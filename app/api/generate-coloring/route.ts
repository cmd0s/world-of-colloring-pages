import { type NextRequest, NextResponse } from "next/server"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const { idea } = await request.json()

    if (!idea || typeof idea !== "string") {
      return NextResponse.json({ error: "Coloring page idea is required" }, { status: 400 })
    }

    const prompt = `Create a simple, child-friendly coloring book page based on this idea: "${idea}". 

IMPORTANT - Keep it SIMPLE and MINIMALIST:
- Use only essential outlines with thick, bold black lines
- Minimal details - focus on main shapes and forms
- Large open areas for children to color easily
- Avoid complex patterns, shading, or fine details
- Background must be WHITE with black line art only
- Age-appropriate for children (4-10 years old)
- Perfect for printing on A4 paper

Style: Simple, clean line drawing coloring book - like traditional children's coloring books with bold outlines and plenty of white space to color.`

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API error:", errorData)

      if (response.status === 401) {
        return NextResponse.json({ error: "OpenAI API key is invalid" }, { status: 401 })
      }

      if (response.status === 429) {
        return NextResponse.json({ error: "Too many requests. Please try again in a moment." }, { status: 429 })
      }

      return NextResponse.json({ error: "Error generating coloring page" }, { status: response.status })
    }

    const data = await response.json()
    const imageUrl = data.data[0].url

    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")
    const dataUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
