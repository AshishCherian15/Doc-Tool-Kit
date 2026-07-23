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
          `,
        }}
      />

      <div className="min-h-screen flex flex-col">

        {/* ── Nav ── */}
        <nav className="border-b flex items-center justify-between px-8 py-4">
          <Link href="/">
            <DocToolKitLogo size="md" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            {/* ── Settings Option ── */}
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
              className="hover:opacity-90"
              style={{ background: "#2563EB", border: "none" }}
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
        <section
          className="container mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          style={{ position: "relative", zIndex: 0 }}
        >
          {/* Left */}
          <div>
            <p
              className="text-xs font-medium tracking-widest mb-4 uppercase"
              style={{ color: "#2563EB" }}
            >
              Login-free · local-first · always yours
            </p>
            <h1
              className="fraunces mb-5"
              style={{ fontSize: 48, fontWeight: 300, lineHeight: 1.15 }}
            >
              Doc Tool Kit for everyday document work.
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Merge, split, compress, annotate, and extract text from PDFs directly in your browser.
              Nothing leaves your device.
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                className="hover:opacity-90"
                style={{ background: "#2563EB", border: "none" }}
                asChild
              >
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">See how it works</Link>
              </Button>
            </div>
          </div>

          {/* Right — stacked doc preview */}
          <div className="rounded-xl border bg-muted/40 p-5 self-start">
            <div className="relative h-52" style={{ isolation: "isolate" }}>
              <div
                className="absolute inset-x-3 top-6 rounded-lg border bg-background p-4 opacity-50"
                style={{ transform: "rotate(1.5deg)", zIndex: 1 }}
              />
              <div
                className="absolute inset-x-1.5 top-3 rounded-lg border bg-background p-4 opacity-75"
                style={{ transform: "rotate(-0.8deg)", zIndex: 2 }}
              />
              <div className="absolute inset-0 rounded-lg border bg-background p-4" style={{ zIndex: 3 }}>
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-3/4 rounded-sm" style={{ background: "#B7D4FF" }} />
                  <div className="h-2 w-full rounded-sm bg-muted" />
                  <div className="h-2 w-1/2 rounded-sm bg-muted" />
                  <div className="h-2 w-full rounded-sm bg-muted" />
                  <div className="h-2 w-3/5 rounded-sm bg-muted" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">contract_v3.pdf</span>
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: "#EEF6FF", color: "#1E40AF" }}
                  >
                    Annotated
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pills.map((p) => (
                <span
                  key={p.label}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-full px-3 py-1"
                >
                  {p.icon}
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          className="container mx-auto px-8 pb-20"
          style={{ position: "relative", zIndex: 0 }}
        >
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
            What you can do
          </p>
          <h2
            className="fraunces mb-8"
            style={{ fontSize: 30, fontWeight: 300 }}
          >
            Everything your PDF needs
          </h2>

          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className={`block p-5 bg-background hover:bg-muted/50 transition-colors ${index > 0 ? "border-l" : ""} ${index >= 4 ? "border-t" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: "#EEF6FF", color: "#1E40AF" }}
                  >
                    {feature.icon}
                  </div>
                  <p className="font-medium text-sm mb-1">{feature.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{feature.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Strip ── */}
        <section className="border-t border-b bg-muted/40 px-8 py-12">
          <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2
                className="fraunces mb-1"
                style={{ fontSize: 24, fontWeight: 300 }}
              >
                Built for people who care where their files go.
              </h2>
              <p className="text-sm text-muted-foreground">
                Zero server uploads. All processing runs in your browser tab.
              </p>
            </div>
            <div className="flex gap-10 shrink-0">
              {[
                { num: "0 kb", label: "data uploaded" },
                { num: "100%", label: "in-browser" },
                { num: "Free", label: "to start" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="fraunces"
                    style={{ fontSize: 30, fontWeight: 300, color: "#2563EB", lineHeight: 1 }}
                  >
                    {s.num}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t px-8 py-6 mt-auto">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <DocToolKitLogo size="sm" />
              <p className="text-xs text-muted-foreground mt-1.5">
                © 2026 Doc Tool Kit &nbsp;·&nbsp; Built by Ashish
              </p>
            </div>
            <div className="flex gap-5">
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