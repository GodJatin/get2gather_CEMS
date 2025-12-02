'use client';

import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary/30">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-invert prose-lg text-neutral-400">
            <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-6">
                Welcome to Get2Gather. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
            <p className="mb-6">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Identity Data includes first name, last name, username or similar identifier.</li>
                <li>Contact Data includes email address and telephone number.</li>
                <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
