export async function POST() {
  try {
    console.log("[v0] Starting idea generation...")

    const openAIApiKey = process.env.OPENAI_API_KEY
    if (!openAIApiKey) {
      console.error("[v0] OPENAI_API_KEY is not set")
      return Response.json({ error: "API key not configured" }, { status: 500 })
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You write one-sentence ideas for children's coloring pages. Output exactly one sentence, nothing else. Ideas should be fun, creative, and kid-friendly. Examples: 'A friendly dragon having a tea party with animals', 'An underwater city with talking fish and jellyfish', 'A happy robot playing with butterflies in a garden'.",
          },
          {
            role: "user",
            content: "Generate a creative coloring page idea.",
          },
        ],
        max_tokens: 80,
        temperature: 0.8,
      }),
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text()
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const data = await openAIResponse.json()
    console.log("[v0] OpenAI response received")

    const idea = data.choices[0].message.content.trim()
    console.log("[v0] Generated idea:", idea)

    return Response.json({ idea })
  } catch (error) {
    console.error("[v0] Error generating idea:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate idea"
    return Response.json({ error: errorMessage, details: String(error) }, { status: 500 })
  }
}
