import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClarityProvider } from "@/components/ClarityProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "ProBuddy", template: "%s | ProBuddy" },
  description: "Find trusted professionals for your home projects.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans min-h-screen bg-surface antialiased`}
      >
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <ClarityProvider
            projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
          />
        )}
        {children}
      </body>
    </html>
  );
}
