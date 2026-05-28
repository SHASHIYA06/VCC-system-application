import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import AppShell from "@/components/layout/AppShell";
import KhushiAgent from "@/components/agent/KhushiAgent";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
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