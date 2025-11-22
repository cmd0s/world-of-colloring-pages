"use client"

import { useState } from "react"
import { Wand2, Download, Printer, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function Page() {
  const [idea, setIdea] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingIdea, setGeneratingIdea] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  const handleGenerateRandomIdea = async () => {
    setGeneratingIdea(true)
    setError("")

    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        let errorDetails = "Error generating idea"
        try {
          const errorData = await response.json()
          errorDetails = errorData.details || errorData.error || errorDetails
        } catch {
          errorDetails = `Error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorDetails)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response format from server")
      }

      const data = await response.json()

      if (!data.idea) {
        throw new Error("No idea returned from server")
      }

      setIdea(data.idea)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Could not generate idea. Try again!"
      console.error("[v0] Error in handleGenerateRandomIdea:", errorMsg)
      setError(errorMsg)
    } finally {
      setGeneratingIdea(false)
    }
  }

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError("Please enter an idea for the coloring page!")
      return
    }

    setError("")
    setLoading(true)
    setProgress(0)

    const startTime = Date.now()
    const duration = 30000 // 30 seconds in milliseconds

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)
    }, 50) // Update every 50ms for smooth animation

    try {
      const response = await fetch("/api/generate-coloring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error generating coloring page")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)

      setTimeout(() => {
        setProgress(0)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    try {
      console.log("[v0] Download starting, image type:", generatedImage.substring(0, 50))

      if (generatedImage.startsWith("data:image")) {
        const link = document.createElement("a")
        link.href = generatedImage
        link.download = `coloring-page-${Date.now()}.png`
        document.body.appendChild(link)

        await new Promise((resolve) => setTimeout(resolve, 10))
        link.click()

        await new Promise((resolve) => setTimeout(resolve, 100))
        document.body.removeChild(link)
        console.log("[v0] Download completed via data URL")
      } else {
        const response = await fetch(generatedImage)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `coloring-page-${Date.now()}.png`
        document.body.appendChild(link)

        await new Promise((resolve) => setTimeout(resolve, 10))
        link.click()

        await new Promise((resolve) => setTimeout(resolve, 100))
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        console.log("[v0] Download completed via blob URL")
      }
    } catch (err) {
      console.error("[v0] Download error:", err)
      setError("Error downloading image. Please try again.")
    }
  }

  const handlePrint = () => {
    if (!generatedImage) return

    const printWindow = window.open("", "", "width=800,height=600")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Coloring Page</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${generatedImage}" alt="Coloring page" />
            <script>
              window.print();
              window.close();
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">AI Coloring Book</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Create unique coloring pages from your child's imagination
          </p>

          <div className="bg-primary/5 rounded-lg p-6 md:p-8 border border-primary/20 space-y-3 text-left">
            <p className="font-bold text-foreground text-base">How it works:</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✨ Your child tells you what they want on the coloring page</p>
              <p>🤖 AI generates it instantly</p>
              <p>🖨️ Print it on A4</p>
              <p>🖍️ Your child colors it with crayons</p>
              <p className="font-semibold text-primary">☕ You get 10 minutes of peace!</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur border-primary/20 shadow-xl mb-6">
          <div className="p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-foreground">What's your idea?</label>
                  <Button
                    onClick={handleGenerateRandomIdea}
                    disabled={generatingIdea || loading}
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                  >
                    {generatingIdea ? (
                      <>
                        <Loader className="h-3 w-3 animate-spin mr-1" />
                        Generating...
                      </>
                    ) : (
                      "Generate random idea"
                    )}
                  </Button>
                </div>
                <Input
                  placeholder="E.g.: Elephant wearing sunglasses riding a skateboard..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !loading && handleGenerate()}
                  disabled={loading}
                  className="text-base border-primary/30"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading || !idea.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Generating coloring page...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Coloring Page
                  </>
                )}
              </Button>

              {loading && progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Generating your coloring page...</span>
                    <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-primary/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {generatedImage && (
          <Card className="bg-white/80 backdrop-blur border-primary/20 shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold text-muted-foreground mb-4">Your coloring page is ready!</p>
                <div className="bg-white rounded-lg overflow-hidden border-4 border-primary/20">
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated coloring page"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="flex gap-3 flex-col md:flex-row">
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 text-base rounded-lg transition-all"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Print
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base rounded-lg transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download as PNG
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Tip: Be creative! The more detailed your description, the better the coloring page!</p>
        </div>
      </div>
    </main>
  )
}
