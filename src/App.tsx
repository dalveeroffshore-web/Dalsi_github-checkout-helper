import { Page, PageBody, Button } from '@blinkdotnew/ui'
import { SharedAppLayout } from './layouts/shared-app-layout'
import { useBlinkAuth } from '@blinkdotnew/react'
import { CheckoutTool } from './components/CheckoutTool'
import { Github, LogIn, Loader2 } from 'lucide-react'
import { blink } from './lib/blink'

export default function App() {
  const { user, isLoading, isAuthenticated } = useBlinkAuth()

  const login = () => blink.auth.login(window.location.href)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in bg-background">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/20 text-accent mb-4">
            <Github size={40} />
          </div>
          <h1 className="text-5xl font-bold tracking-tight font-heading">
            GitHub Checkout Helper
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            The ultimate developer utility to instantly clone and explore repositories in the cloud.
          </p>
        </div>
        <Button size="lg" onClick={login} className="px-8 h-12 bg-accent text-accent-foreground hover:bg-accent/90">
          <LogIn className="mr-2 h-5 w-5" />
          Sign in to get started
        </Button>
      </div>
    )
  }

  return (
    <SharedAppLayout appName="GitHub Checkout">
      <Page>
        <PageBody className="py-12 px-6">
          <CheckoutTool />
        </PageBody>
      </Page>
    </SharedAppLayout>
  )
}
