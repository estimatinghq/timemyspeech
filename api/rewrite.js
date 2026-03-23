export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, tone, customInstruction } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
You are an email rewriting assistant.

Rewrite the user's message based on the requested tone.

Rules:
- Keep the meaning the same
- Do not add unnecessary fluff
- Keep it natural
- Make it sound like a real human wrote it
- Return only the rewritten message, nothing else

Requested tone: ${tone || "neutral"}
Custom instruction: ${customInstruction || "none"}

Original message:
${message}
    `;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        input: prompt
      })
    });

    const data = await response.json();

    const rewritten =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Sorry, something went wrong.";

    res.status(200).json({ result: rewritten });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
