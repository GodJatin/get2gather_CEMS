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
            
            <main className="flex-1 pt-24 pb-12 px-6">
                {children}
            </main>

            <Footer />
        </div>
    );
}
