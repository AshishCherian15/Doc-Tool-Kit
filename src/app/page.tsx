import { DocToolKitLogo } from '@/components/branding/doc-tool-kit-logo'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  FilePen,
  LayoutList,
  Scissors,
  SlidersHorizontal,
  FileImage,
  ScanText,
  Search,
  Highlighter,
  Upload,
  Lock,
  Zap,
  WifiOff,
  Settings,
  Droplets,
  RotateCw,
  BadgeInfo,
  ImageDown,
  Layers,
  Share2,
  Hash,
  EyeOff,
} from "lucide-react"

const features: { icon: React.ReactNode; name: string; desc: string; href: string }[] = [
  {
    icon: <FilePen className="h-5 w-5" />,
    name: "Edit PDF",
    desc: "Sejda-style editor: add text, whiteout, draw, and images",
    href: "/edit",
  },
  {
    icon: <LayoutList className="h-5 w-5" />,
    name: "Merge",
    desc: "Combine multiple PDFs into one document",
    href: "/merge",
  },
  {
    icon: <Scissors className="h-5 w-5" />,
    name: "Split",
    desc: "Extract pages or split by custom range",
    href: "/split",
  },
  {
    icon: <SlidersHorizontal className="h-5 w-5" />,
    name: "Compress",
    desc: "Shrink file size, keep the quality",
    href: "/compress",
  },
  {
    icon: <FileImage className="h-5 w-5" />,
    name: "Convert",
    desc: "PDF to images, or images to PDF",
    href: "/convert",
  },
  {
    icon: <ScanText className="h-5 w-5" />,
    name: "OCR",
    desc: "Extract text from scanned documents",
    href: "/ocr",
  },
  {
    icon: <Hash className="h-5 w-5" />,
    name: "Page Numbers",
    desc: "Embed Page X of Y in header/footer",
    href: "/page-numbers",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    name: "Protect PDF",
    desc: "Password encrypt and security lock",
    href: "/protect",
  },
  {
    icon: <EyeOff className="h-5 w-5" />,
    name: "Redact PDF",
    desc: "Sanitize & blackout sensitive information",
    href: "/redact",
  },
  {
    icon: <Search className="h-5 w-5" />,
    name: "Search",
    desc: "Find text across every page instantly",
    href: "/search",
  },
  {
    icon: <Highlighter className="h-5 w-5" />,
    name: "Annotate",
    desc: "Highlight, underline, and leave notes",
    href: "/annotate",
  },
  {
    icon: <Droplets className="h-5 w-5" />,
    name: "Watermark",
    desc: "Stamp custom text across every page",
    href: "/watermark",
  },
  {
    icon: <RotateCw className="h-5 w-5" />,
    name: "Rotate",
    desc: "Turn pages 90, 180, or 270 degrees",
    href: "/rotate",
  },
  {
    icon: <BadgeInfo className="h-5 w-5" />,
    name: "PDF Info",
    desc: "Inspect metadata, size, and page count",
    href: "/info",
  },
  {
    icon: <ImageDown className="h-5 w-5" />,
    name: "Extract Images",
    desc: "Save each page as PNG or JPEG",
    href: "/extract-images",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    name: "Reorder",
    desc: "Move or remove pages before export",
    href: "/reorder",
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    name: "Share Link",
    desc: "Copy a download link for uploaded PDFs",
    href: "/share",
  },
]

const pills = [
  { icon: <Lock className="h-3.5 w-3.5" />, label: "Stays local" },
  { icon: <Zap className="h-3.5 w-3.5" />, label: "Instant" },
  { icon: <WifiOff className="h-3.5 w-3.5" />, label: "Works offline" },
]

export default function Home() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fraunces { font-family: Georgia, serif; }
            .gradient-text {
              background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .hero-gradient {
              background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.08) 0%, transparent 50%);
            }
            .feature-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
            }
            .feature-card {
              transition: all 0.2s ease;
            }
          `,
        }}
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">

        {/* ── Nav ── */}
        <nav className="border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 sm:px-8 py-4 sticky top-0 z-50">
          <Link href="/">
            <DocToolKitLogo size="md" />
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Features
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <Button
              size="sm"
              className="hover:opacity-90 shadow-md shadow-blue-500/20"
              style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", border: "none" }}
              asChild
            >
              <Link href="/dashboard">
                <Upload className="mr-2 h-4 w-4" />
                Open a PDF
              </Link>
            </Button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="container mx-auto px-6 sm:px-8 py-16 sm:py-24 lg:py-32 hero-gradient">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <p className="text-xs font-medium tracking-wide" style={{ color: "#2563EB" }}>
                  Login-free · Local-first · Secure
                </p>
              </div>
              <h1
                className="fraunces text-4xl sm:text-5xl lg:text-6xl font-light leading-tight"
              >
                Doc Tool Kit for <span className="gradient-text font-medium">everyday</span> document work.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Merge, split, compress, annotate, and extract text from PDFs directly in your browser.
                <span className="font-medium text-foreground"> Nothing leaves your device.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  className="hover:opacity-90 shadow-lg shadow-blue-500/25"
                  style={{ background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)", border: "none" }}
                  asChild
                >
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" className="hover:bg-muted/50" asChild>
                  <Link href="#features">See how it works</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                {pills.map((p) => (
                  <div
                    key={p.label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30" style={{ color: "#2563EB" }}>
                      {p.icon}
                    </div>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — stacked doc preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative rounded-2xl border bg-gradient-to-br from-background to-muted/50 p-6 shadow-2xl">
                <div className="relative h-64" style={{ isolation: "isolate" }}>
                  <div
                    className="absolute inset-x-4 top-8 rounded-xl border bg-background/80 backdrop-blur-sm p-5 opacity-40 shadow-lg"
                    style={{ transform: "rotate(3deg)", zIndex: 1 }}
                  />
                  <div
                    className="absolute inset-x-2 top-4 rounded-xl border bg-background/90 backdrop-blur-sm p-5 opacity-60 shadow-lg"
                    style={{ transform: "rotate(-2deg)", zIndex: 2 }}
                  />
                  <div className="absolute inset-0 rounded-xl border bg-gradient-to-br from-background to-muted/30 p-5 shadow-xl" style={{ zIndex: 3 }}>
                    <div className="flex flex-col gap-3">
                      <div className="h-4 w-4/5 rounded-md bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50"></div>
                      <div className="h-2.5 w-full rounded-md bg-muted"></div>
                      <div className="h-2.5 w-3/5 rounded-md bg-muted"></div>
                      <div className="h-2.5 w-full rounded-md bg-muted"></div>
                      <div className="h-2.5 w-4/5 rounded-md bg-muted"></div>
                      <div className="h-2.5 w-2/3 rounded-md bg-muted"></div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <FilePen className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">contract_v3.pdf</span>
                      </div>
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: "linear-gradient(135deg, #EEF6FF 0%, #DBEAFE 100%)", color: "#1E40AF" }}
                      >
                        Annotated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          className="container mx-auto px-6 sm:px-8 py-16 sm:py-24"
        >
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              What you can do
            </p>
            <h2
              className="fraunces text-3xl sm:text-4xl font-light mb-4"
            >
              Everything your PDF needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to handle all your document workflows, right in your browser.
            </p>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 overflow-hidden shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className={`feature-card block p-6 bg-background hover:bg-muted/40 transition-all ${index > 0 ? "border-l" : ""} ${index >= 4 ? "border-t" : ""}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #EEF6FF 0%, #DBEAFE 100%)", color: "#1E40AF" }}
                  >
                    {feature.icon}
                  </div>
                  <p className="font-semibold text-sm mb-2">{feature.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <section className="border-y bg-gradient-to-r from-muted/50 to-muted/30 px-6 sm:px-8 py-12 sm:py-16">
          <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h2
                className="fraunces text-2xl sm:text-3xl font-light mb-3"
              >
                Built for people who care where their files go.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Zero server uploads. All processing runs in your browser tab. Your documents never leave your device.
              </p>
            </div>
            <div className="flex gap-8 sm:gap-12 shrink-0">
              {[
                { num: "0 KB", label: "data uploaded" },
                { num: "100%", label: "in-browser" },
                { num: "Free", label: "to start" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className="fraunces text-3xl sm:text-4xl font-light gradient-text"
                  >
                    {s.num}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t bg-background px-6 sm:px-8 py-8 mt-auto">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <DocToolKitLogo size="sm" />
              <p className="text-xs text-muted-foreground">
                © 2026 Doc Tool Kit · Built by Ashish
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}