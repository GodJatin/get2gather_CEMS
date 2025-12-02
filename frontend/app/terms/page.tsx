'use client';

import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary/30">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-invert prose-lg text-neutral-400">
            <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="mb-6">
                By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p className="mb-6">
                Permission is granted to temporarily download one copy of the materials (information or software) on Get2Gather's website for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
            <p className="mb-6">
                The materials on Get2Gather's website are provided on an 'as is' basis. Get2Gather makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
