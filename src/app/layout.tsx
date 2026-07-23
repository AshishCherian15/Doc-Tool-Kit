import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Doc Tool Kit - Document Editor and Converter",
  description: "A login-free document toolkit for editing, merging, splitting, compressing, converting, and OCR workflows.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
