export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { messages = [] } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",    // có thể đổi sang "gpt-4o-mini" (đã dùng) hoặc "o4-mini" nếu tài khoản bạn có quyền
        messages
      })
    });

    if (!r.ok) {
      const err = await r.text(); // đưa lỗi OpenAI ra ngoài để UI thấy
      return new Response(JSON.stringify({ error: `OpenAI error: ${err}` }), { status: 500 });
    }

    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content ?? null;
    if (!answer) {
      return new Response(JSON.stringify({ error: "No answer from model" }), { status: 500 });
    }

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500 });
  }
}
