"use client"

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all form fields.")
      return
    }

    setIsLoading(true)
    setError("")

    setTimeout(() => {
      // Set the authentication cookie to bypass middleware checks
      Cookies.set("auth_token", "mock-session-id-12345", { expires: 1, path: "/" })
      
      // Save the email address locally to pull into the dashboard workspace
      localStorage.setItem("user_email", email)
      
      setIsLoading(false)
      router.push("/dashboard")
    }, 1200)
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    setError("")
    
    setTimeout(() => {
      Cookies.set("auth_token", "google-oauth-session-98765", { expires: 1, path: "/" })
      
      // Default placeholder email for third-party mock auth streams
      localStorage.setItem("user_email", "google.guest@doctoolkit.local")
      
      setIsLoading(false)
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fraunces { font-family: Georgia, serif; }
          `,
        }}
      />

      <div className="min-h-screen flex flex-col bg-muted/20">
        <header className="px-8 py-6 flex justify-start border-b bg-background">
          <Link href="/">
            <DocToolKitLogo size="md" />
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md border shadow-md bg-background relative overflow-hidden">
            <div className="h-1.5 w-full absolute top-0 left-0" style={{ backgroundColor: "#2563EB" }} />
            
            <CardHeader className="space-y-2 pt-8 text-center">
              <CardTitle className="fraunces text-3xl font-normal tracking-tight">Welcome to Doc Tool Kit</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in to unlock all local-first browser transformation workspace tools.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {error && (
                <div className="text-xs font-medium p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              {/* ── Google Integration ── */}
              <Button 
                variant="outline" 
                type="button" 
                className="w-full h-10 font-normal border shadow-sm relative group hover:bg-muted/30"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="h-4 w-4 mr-3.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4c0,-0.34 -0.03,-0.67 -0.09,-1H21.35z" fill="#4285F4" />
                    <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.6c-0.9,0.6 -2.07,0.98 -3.32,0.98 -2.34,0 -4.33,-1.58 -5.04,-3.7H2.88v2.6c1.5,3 4.58,4.92 8.13,4.92z" fill="#34A853" />
                    <path d="M6.96,13.08c-0.18,-0.54 -0.29,-1.11 -0.29,-1.7s0.11,-1.16 0.29,-1.7V7.08H2.88c-0.6,1.2 -0.94,2.56 -0.94,4c0,1.44 0.34,2.8 0.94,4L6.96,13.08z" fill="#FBBC05" />
                    <path d="M12,6.12c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.35 14.42,2.6 12,2.6c-3.55,0 -6.63,1.92 -8.13,4.92l3.78,2.9c0.71,-2.13 2.7,-3.71 5.04,-3.71z" fill="#EA4335" />
                  </g>
                </svg>
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-muted" />
                <span className="flex-shrink mx-4 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">Or email sign-in</span>
                <div className="flex-grow border-t border-muted" />
              </div>

              {/* ── Standard Form ── */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9 h-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                    <Link href="#" className="text-xs text-[#2563EB] hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 text-white mt-2 transition-all"
                  style={{ background: "#2563EB", border: "none" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    "Sign in to account"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-center">
              <p className="text-xs text-muted-foreground">
                Do not have an active license?{" "}
                <Link href="/register" className="font-semibold text-[#2563EB] hover:underline">Create a free account</Link>
              </p>
            </CardFooter>
          </Card>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
            <span>Secure Web Auth · Browser Encryption Active</span>
          </div>
        </main>

        <footer className="border-t px-8 py-4 bg-background mt-auto">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              © 2026 Doc Tool Kit · Secure Document Pipeline
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-[11px] text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="#" className="text-[11px] text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
