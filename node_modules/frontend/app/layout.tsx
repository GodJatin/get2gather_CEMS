import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import SplashScreen from "@/components/SplashScreen";

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

import ParticleBackground from "@/components/ParticleBackground";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <ParticleBackground />
                <ServiceWorkerRegister />
                <SplashScreen />
                <div className="relative z-10 w-full min-h-screen">
                    {children}
                </div>
                <Toaster richColors position="top-center" closeButton style={{ zIndex: 99999 }} />
            </body>
        </html>
    );
}
