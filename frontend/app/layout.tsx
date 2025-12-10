import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Get2Gather",
    description: "The ultimate platform for college events",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    React.useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW registration failed', err));
        }
    }, []);
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
                <Toaster />
            </body>
        </html>
    );
}
