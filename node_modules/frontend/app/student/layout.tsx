'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
            <Navbar />
            
            <main className="flex-1 pt-20 md:pt-24 pb-12 px-4 md:px-6 w-full max-w-[100vw] overflow-x-hidden">
                {children}
            </main>

            <Footer />
        </div>
    );
}
