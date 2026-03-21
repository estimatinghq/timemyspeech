export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { speech, targetMinutes, speakingSpeed } = req.body;

    if (!speech) {
      return res.status(400).json({ error: "No speech provided" });
    }

    const prompt = `
Rewrite the following speech so it is clearer, easier to present aloud, and sounds natural.

Keep the same meaning.

Target speech length: ${targetMinutes} minutes
Speaking speed: ${speakingSpeed} words per minute.

Return ONLY the improved speech.

Speech:
${speech}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 400
      })
    });

    const data = await response.json();

    const refinedText =
      data.output?.[0]?.content?.[0]?.text ||
      "AI could not refine the speech.";

    res.status(200).json({ refinedText });

  } catch (error) {

    res.status(500).json({
      error: "AI refine failed"
    });

  }
}
