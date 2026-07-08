import type { Metadata } from "next";
import "./globals.css";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import AppShell from "@/components/layout/AppShell";
import KhushiAgent from "@/components/agent/KhushiAgent";

export const metadata: Metadata = {
  title: "KMRCL VCC Intelligence Explorer",
  description: "Production-grade Vehicle Control Circuits Explorer for KMRCL RS3R Metro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        {/* Fonts (Inter + JetBrains Mono) are imported in globals.css.
            Preconnect to the Google Fonts hosts to speed up that import. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full flex overflow-hidden font-sans text-slate-100 antialiased">
        <AppShell>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </AppShell>
        <KhushiAgent />
      </body>
    </html>
  );
}