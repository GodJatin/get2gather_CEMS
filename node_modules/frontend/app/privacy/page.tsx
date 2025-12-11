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
            <p className="mb-6">Effective Date: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-6">
                Get2Gather ("we," "our," or "us") is dedicated to facilitating campus events and student engagement at Parul University. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-white mb-2">Personal Data</h3>
            <p className="mb-4">
                We collect personally identifiable information that you voluntarily provide to us when you register on the web application. This includes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Student Details:</strong> Name, Enrollment Number, Department, and Contact Information.</li>
                <li><strong>Credentials:</strong> University Email Address and encrypted passwords.</li>
                <li><strong>Profile Data:</strong> Profile pictures and interests related to events.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-2">Derivative Data</h3>
            <p className="mb-6">
                Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. Use of Your Information</h2>
            <p className="mb-4">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Create and manage your account.</li>
                <li>Process event registrations and ticketing.</li>
                <li>Compile anonymous statistical data and analysis for use internally.</li>
                <li>Send you emails regarding your account or order.</li>
                <li>Enable user-to-user communications.</li>
                <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">4. Disclosure of Your Information</h2>
            <p className="mb-6">
                We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                <li><strong>University Administrators:</strong> We may share usage data with university administration for academic or disciplinary purposes as per campus guidelines.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">5. Security of Your Information</h2>
            <p className="mb-6">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
            <p className="mb-6">
                If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="text-white">
                <strong>Email:</strong> support@get2gather.com<br />
                <strong>Address:</strong> Parul University Campus, Vadodara, Gujarat
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
