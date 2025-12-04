import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Get2Gather",
    description: "The ultimate platform for college events",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
