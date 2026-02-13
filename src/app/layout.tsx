import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["500", "600", "700", "800"] })

export const metadata: Metadata = {
  title: { default: "My App", template: "%s | My App" },
  description: "A Next.js starter template with Cloudflare D1 and Auth.js",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} font-sans min-h-screen bg-surface antialiased`}>
        {children}
      </body>
    </html>
  )
}
