import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add additional font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add additional font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add additional font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add additional font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add additional font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add more font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = localFont({
  src: [
    {
      path: "/fonts/inter/Inter-VariableFont_slnt,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    // Add more font files if needed
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}



import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KMRCL VCC Explorer",
  description: "Intelligent Wiring Explorer for KMRCL RS3R",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} h-full flex overflow-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
