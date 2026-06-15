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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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