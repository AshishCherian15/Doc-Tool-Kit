"use client"

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, Mail, User } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all registration fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Your selected passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulating database registration pipeline delay
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1400)
  }

  const handleGoogleSignUp = () => {
    setIsLoading(true)
    setError("")
    
    // Simulating OAuth authentication handoff pipeline
    setTimeout(() => {
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
        {/* Simple Branding Navbar Header */}
        <header className="px-8 py-6 flex justify-start border-b bg-background">
          <Link href="/">
            <DocToolKitLogo size="md" />
          </Link>
        </header>

        {/* Form Container Wrapper Component */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 py-10">
          <Card className="w-full max-w-md border shadow-md bg-background relative overflow-hidden">
            <div className="h-1.5 w-full absolute top-0 left-0" style={{ backgroundColor: "#2563EB" }} />
            
            <CardHeader className="space-y-2 pt-8 text-center">
              <CardTitle className="fraunces text-3xl font-normal tracking-tight">Create your account</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Get started free and enjoy completely private, client-side PDF editing workspace utilities.
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
                onClick={handleGoogleSignUp}
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
                Sign up with Google
              </Button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-muted" />
                <span className="flex-shrink mx-4 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">Or create via email</span>
                <div className="flex-grow border-t border-muted" />
              </div>

              {/* ── Native Registration Form ── */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-9 h-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      className="pl-9 h-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className="pl-9 h-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 text-white mt-3 transition-all"
                  style={{ background: "#2563EB", border: "none" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    "Register Workspace Account"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="bg-muted/30 border-t py-4 px-6 flex justify-center">
              <p className="text-xs text-muted-foreground">
                Already have a registered profile?{" "}
                <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">Sign in here</Link>
              </p>
            </CardFooter>
          </Card>

          {/* Privacy Disclaimer Badge */}
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
            <span>Zero File Exposure Promise · Cloud Sandbox Vault Verified</span>
          </div>
        </main>

        {/* Footer Area */}
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