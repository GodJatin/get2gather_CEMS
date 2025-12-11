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
            <p className="mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="mb-6">
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Get2Gather ("we," "us" or "our"), concerning your access to and use of the Get2Gather website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. Intellectual Property Rights</h2>
            <p className="mb-6">
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. User Representations</h2>
            <p className="mb-4">
                By using the Site, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                <li>You are a current student or faculty member of the university.</li>
                <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
                <li>Your use of the Site will not violate any applicable law or regulation.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">4. User Registration</h2>
            <p className="mb-6">
                You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Activities</h2>
            <p className="mb-4">
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Site, you agree not to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
                <li>Use the Site to advertise or offer to sell goods and services.</li>
                <li>Engage in unauthorized framing of or linking to the Site.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p className="mb-6">
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
            </p>
            
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
             <p className="text-white">
                If you have questions regarding these terms, please contact us at support@get2gather.com
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
