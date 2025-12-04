'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';
import AnimatedTitle from '@/components/AnimatedTitle';
import TextReveal from '@/components/TextReveal';
import MagneticButton from '@/components/MagneticButton';

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary/30">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[80vh] flex items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <div className="mb-8">
            <AnimatedTitle />
          </div>
          
          <TextReveal 
            text="Get2Gather isn't just a ticketing platform. It's a complete ecosystem designed to supercharge campus life, from seamless check-ins to gamified engagement."
            className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed justify-center"
            delay={0.5}
          />
        </div>
      </section>

      {/* Deep Dive Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-neutral-900 border border-white/10 rounded-3xl p-8 h-[400px] flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors duration-500">
                <div className="text-9xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🎫</div>
              </div>
            </motion.div>
            <div>
              <h2 className="text-4xl font-bold mb-6">Lightning Fast Ticketing</h2>
              <TextReveal 
                text="Forget long queues and paper lists. Our QR-code based system allows students to book tickets in seconds and organizers to scan them instantly at the door."
                className="text-neutral-400 text-lg leading-relaxed mb-8"
              />
              <ul className="space-y-4">
                {['Instant QR Generation', 'Real-time Capacity Tracking', 'Secure Validation'].map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-neutral-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">✓</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold mb-6">Gamified Engagement</h2>
              <TextReveal 
                text="Make participation fun. Students earn XP for every event they attend or volunteer for, climbing the campus leaderboard and unlocking exclusive badges."
                className="text-neutral-400 text-lg leading-relaxed mb-8"
              />
              <ul className="space-y-4">
                {['XP & Leveling System', 'Department Leaderboards', 'Volunteer Badges'].map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-neutral-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm">✓</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group order-1 md:order-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-neutral-900 border border-white/10 rounded-3xl p-8 h-[400px] flex items-center justify-center overflow-hidden group-hover:border-accent/50 transition-colors duration-500">
                <div className="text-9xl transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">🏆</div>
              </div>
            </motion.div>
          </div>

          {/* Feature 3: Social Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-neutral-900 border border-white/10 rounded-3xl p-8 h-[400px] flex items-center justify-center overflow-hidden group-hover:border-pink-500/50 transition-colors duration-500">
                {/* Mock Feed UI */}
                <div className="relative w-full max-w-xs space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      animate={{ y: [0, -5, 0] }}
                      // @ts-ignore
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 1 }}
                      className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/5 flex gap-3 items-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-20 bg-white/20 rounded-full" />
                        <div className="h-2 w-full bg-white/10 rounded-full" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            <div>
              <h2 className="text-4xl font-bold mb-6">Social Feeds & Connections</h2>
              <TextReveal 
                text="Don't just attend events—experience them together. Connect with peers, share your thoughts on the live feed, and build your campus network."
                className="text-neutral-400 text-lg leading-relaxed mb-8"
              />
              <ul className="space-y-4">
                {['Live Event Feeds', 'Student Networking', 'Photo Sharing'].map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-neutral-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 text-sm">✓</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 4: Smart Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold mb-6">Smart Calendar</h2>
              <TextReveal 
                text="Never miss a beat. Our intuitive calendar view organizes all campus happenings, helping you plan your semester with ease."
                className="text-neutral-400 text-lg leading-relaxed mb-8"
              />
              <ul className="space-y-4">
                {['Personalized Schedule', 'Event Reminders', 'Sync with Google Calendar'].map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-neutral-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-sm">✓</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group order-1 md:order-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-neutral-900 border border-white/10 rounded-3xl p-8 h-[400px] flex items-center justify-center overflow-hidden group-hover:border-cyan-500/50 transition-colors duration-500">
                {/* Mock Calendar UI */}
                <div className="grid grid-cols-3 gap-3 transform rotate-12 scale-110 group-hover:rotate-0 group-hover:scale-100 transition-all duration-700">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(6, 182, 212, 0.2)" }}
                      className="w-20 h-20 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center relative"
                    >
                      <span className="text-neutral-600 text-xs absolute top-2 left-2">{i + 1}</span>
                      {i % 2 === 0 && (
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-primary/5" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <h2 className="text-5xl font-bold mb-8">Have Questions?</h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl">
            Whether you're a student leader or a campus administrator, we're here to help you get started.
          </p>
          <div className="flex justify-center gap-6">
            <MagneticButton>
              <a 
                href="mailto:224jatin2006@gmail.com?subject=Inquiry%20from%20Get2Gather%20Website" 
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <span>✉️</span> Contact Us
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

