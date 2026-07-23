"use client"

import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Monitor, 
  Trash2, 
  Loader2, 
  Upload, 
  Settings,
  User,
  LogOut,
  Mail,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userEmail, setUserEmail] = useState('guest@doctoolkit.local')

  useEffect(() => {
    setMounted(true)
    const savedEmail = localStorage.getItem("user_email")
    if (savedEmail) setUserEmail(savedEmail)
  }, [])

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data?')) {
      localStorage.clear()
      sessionStorage.clear()
      toast.success('Cache cleared')
      window.location.reload()
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL documents? This cannot be undone!')) return

    setIsDeleting(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      
      if (data.documents && data.documents.length > 0) {
        await Promise.all(
          data.documents.map((doc: { id: string | number }) => 
            fetch(`/api/documents?id=${doc.id}`, { method: 'DELETE' })
          )
        )
      }
      toast.success('All documents deleted successfully')
    } catch (error) {
      toast.error('Failed to delete documents')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' })
    localStorage.removeItem('user_email')
    toast.success('Signed out safely')
    router.push('/')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fraunces { font-family: Georgia, serif; }
          `,
        }}
      />

      {/* ── Navigation Header ── */}
      <nav className="border-b flex items-center justify-between px-4 sm:px-8 py-4 bg-background z-10">
        <Link href="/">
          <DocToolKitLogo size="md" />
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/#features" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link 
            href="/settings" 
            className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 text-[#2563EB]" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <Button
            size="sm"
            className="hover:opacity-90 text-white hidden sm:flex"
            style={{ background: "#2563EB", border: "none" }}
            asChild
          >
            <Link href="/dashboard">
              <Upload className="mr-2 h-4 w-4" />
              Open a PDF
            </Link>
          </Button>

          {/* Synchronized User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-muted border hover:bg-muted/80 shrink-0">
                <User className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 shadow-md">
              <DropdownMenuLabel className="font-normal flex flex-col py-2 px-3">
                <span className="font-semibold text-sm">Workspace User</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* ── Main Responsive Content Area ── */}
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-6 sm:py-12 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <h1 className="fraunces text-3xl sm:text-4xl font-light mb-6 sm:text-8 tracking-tight">Settings</h1>

        {/* Responsive Grid System: Stacks on mobile, splits into 2-columns on PC screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column Group: Account profile & System preferences */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Profile Card */}
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl">Account Profile</CardTitle>
                <CardDescription>Your active secure local session configuration details</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-[#EEF6FF] border border-[#B7D4FF] flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-[#2563EB]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">Workspace Operator</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{userEmail}</span>
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 w-full sm:w-auto self-start sm:self-auto shrink-0">
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                    Sign out
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 border rounded-lg bg-background">
                    <span className="text-muted-foreground block font-medium">License Tier</span>
                    <span className="text-sm font-semibold text-[#2563EB] mt-1 flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" /> Free Personal Tier
                    </span>
                  </div>
                  <div className="p-3 border rounded-lg bg-background">
                    <span className="text-muted-foreground block font-medium">Data Security Mapping</span>
                    <span className="text-sm font-semibold text-foreground mt-1 block">Local-First Sandbox</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance settings */}
            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl">Appearance</CardTitle>
                <CardDescription>Customize interface themes to your preference</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex-1 justify-start sm:justify-center"
                  >
                    <Sun className="mr-2 h-4 w-4 text-amber-500" />
                    Light Mode
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex-1 justify-start sm:justify-center"
                  >
                    <Moon className="mr-2 h-4 w-4 text-blue-400" />
                    Dark Mode
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex-1 justify-start sm:justify-center"
                  >
                    <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                    System Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column Group: Canvas behavior, maintenance, & info specs */}
          <div className="space-y-6">
            

            <Card className="shadow-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl">Storage Registry</CardTitle>
                <CardDescription>Maintain database indices and system loops</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Flushes localized application workspace indicators, temporary file state frames, and browser cache definitions instantly.
                  </p>
                  <Button variant="outline" onClick={handleClearCache} className="w-full h-9">
                    Clear Cache & Reload
                  </Button>
                </div>

                <div className="pt-4 border-t border-destructive/20 space-y-3">
                  <p className="text-xs font-medium text-destructive block">Danger Zone Area</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Wipes out all stored local PDFs and canvas history from database structures. **This cannot be undone.**
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="w-full h-9"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting Records...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete All Documents
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About metadata description info panel card */}
            <Card className="shadow-sm bg-muted/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Engine Manifest</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 text-xs space-y-2 border-t bg-muted/30">
                <div className="flex justify-between"><span className="text-muted-foreground">Version:</span><span className="font-semibold">1.0.0</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">License ID:</span><span className="font-mono">MIT Open Source</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Architecture:</span><span className="font-medium">Next.js 15 · Tailwind</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Database Core:</span><span className="font-medium">Browser SQLite Wrapper</span></div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t px-4 sm:px-8 py-6 mt-auto bg-background">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <DocToolKitLogo size="sm" />
            <p className="text-xs text-muted-foreground mt-1.5">
              © 2026 Doc Tool Kit &nbsp;·&nbsp; Built by Ashish
            </p>
          </div>
          <div className="flex gap-5 text-xs">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}