import { useState, useEffect } from 'react'
import { useAgent, Agent, sandboxTools } from '@blinkdotnew/react'
import type { Sandbox } from '@blinkdotnew/sdk'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Skeleton } from '@blinkdotnew/ui'
import { Github, Rocket, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { blink } from '../lib/blink'

const checkoutAgent = new Agent({
  model: 'google/gemini-3-flash',
  system: `You are a GitHub Checkout Helper. Your goal is to clone a repository and prepare it for the user.
  
  MANDATORY STEPS:
  1. Clone the repository into the current directory: git clone <url> .
  2. Analyze the project structure (README, package.json, etc.).
  3. Provide a brief summary of what the project is and how to run it.
  
  Do not try to run the project unless explicitly asked, just prepare the environment and summarize.`,
  tools: [...sandboxTools],
  maxSteps: 10,
})

export function CheckoutTool() {
  const [url, setUrl] = useState('')
  const [sandbox, setSandbox] = useState<Sandbox | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)

  const { messages, sendMessage, isLoading, error } = useAgent({
    agent: checkoutAgent,
    sandbox: sandbox,
    onFinish: () => {
      setCheckoutComplete(true)
    }
  })

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    try {
      setIsInitializing(true)
      const sbx = await blink.sandbox.create({ template: 'devtools-base' })
      setSandbox(sbx)
      setIsInitializing(false)
      
      await sendMessage(`Please checkout this repository: ${url}`)
    } catch (err) {
      console.error('Failed to initialize sandbox:', err)
      setIsInitializing(false)
    }
  }

  const getLaunchUrl = () => {
    if (!sandbox) return ''
    // We'll point to port 3000 by default as a dev environment
    return `https://${sandbox.getHost(3000)}`
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 text-accent mb-4">
          <Github size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading">
          GitHub <span className="text-accent">Checkout</span> Helper
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Instantly clone, analyze, and launch any GitHub repository in a persistent cloud environment.
        </p>
      </div>

      <Card className="border-border/50 bg-secondary/30 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleCheckout} className="flex gap-3">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="https://github.com/username/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:ring-accent"
                disabled={isLoading || isInitializing}
              />
            </div>
            <Button 
              type="submit" 
              size="lg"
              disabled={!url || isLoading || isInitializing}
              className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLoading || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Checkout
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(isLoading || messages.length > 0) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent animate-pulse' : 'bg-green-500'}`} />
                  Process Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sandbox Creation</span>
                  {sandbox ? <CheckCircle2 className="text-green-500" size={16} /> : <Loader2 className="animate-spin text-accent" size={16} />}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Repository Cloning</span>
                  {checkoutComplete ? <CheckCircle2 className="text-green-500" size={16} /> : (isLoading && sandbox ? <Loader2 className="animate-spin text-accent" size={16} /> : <div className="w-4 h-4 rounded-full border border-muted" />)}
                </div>
                {checkoutComplete && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-accent/20 hover:bg-accent/10 hover:text-accent"
                    asChild
                  >
                    <a href={getLaunchUrl()} target="_blank" rel="noopener noreferrer">
                      Open in Cloud IDE
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm prose-invert max-w-none">
                  {messages.length > 0 ? (
                    messages.filter(m => m.role === 'assistant').map((m, i) => (
                      <div key={i} className="text-sm text-muted-foreground animate-fade-in">
                        {m.content}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-muted/50" />
                      <Skeleton className="h-4 w-[90%] bg-muted/50" />
                      <Skeleton className="h-4 w-[80%] bg-muted/50" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
