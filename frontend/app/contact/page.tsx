'use client';

import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary/30">
      <PublicNavbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-8"
          >
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Touch</span>
          </motion.h1>
          <p className="text-xl text-neutral-400 mb-12">
            Have a question or feedback? We'd love to hear from you.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto text-left relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <form className="space-y-6 relative z-10" onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                
                // Simulate sending process
                const btn = form.querySelector('button') as HTMLButtonElement;
                const originalText = btn.innerText;
                btn.innerText = 'Sending...';
                btn.disabled = true;
                
                setTimeout(() => {
                    window.location.href = `mailto:224jatin2006@gmail.com?subject=Contact from ${name}&body=${message}%0D%0A%0D%0AFrom: ${email}`;
                    btn.innerText = 'Sent! Opening Mail...';
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                        form.reset();
                    }, 2000);
                }, 1000);
            }}>
                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Name</label>
                    <input name="name" required type="text" className="w-full bg-neutral-900 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors focus:ring-1 focus:ring-primary/50" placeholder="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                    <input name="email" required type="email" className="w-full bg-neutral-900 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors focus:ring-1 focus:ring-primary/50" placeholder="john@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Message</label>
                    <textarea name="message" required rows={4} className="w-full bg-neutral-900 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors focus:ring-1 focus:ring-primary/50" placeholder="Your message..." />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                    Send Message
                </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
