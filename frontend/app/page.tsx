'use client';

import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        </div>

        <MotionWrapper className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            Get2Gather
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 mb-10 leading-relaxed">
            The ultimate platform for college events. <br />
            <span className="text-white font-medium">Connect. Celebrate. Create Memories.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-all"
            >
              Learn More
            </Link>
          </div>
        </MotionWrapper>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <MotionWrapper delay={0.2}>
            <h2 className="text-4xl font-bold text-center mb-16">Why Get2Gather?</h2>
          </MotionWrapper>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🎉", title: "Exciting Events", desc: "Discover concerts, workshops, and fests happening on campus." },
              { icon: "🎫", title: "Easy Booking", desc: "Book your spot in seconds with our seamless ticketing system." },
              { icon: "🤝", title: "Community", desc: "Connect with peers and organizers to build your network." }
            ].map((feature, i) => (
              <StaggerItem key={i} className="p-8 rounded-3xl bg-neutral-950 border border-white/5 hover:border-purple-500/30 transition-colors group">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <MotionWrapper>
            <h2 className="text-4xl font-bold mb-16">Meet the Team</h2>
          </MotionWrapper>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: "Alex", role: "Lead Developer" },
              { name: "Sam", role: "UI/UX Designer" },
              { name: "Jordan", role: "Backend Engineer" },
              { name: "Casey", role: "Project Manager" }
            ].map((member, i) => (
              <StaggerItem key={i} className="p-6 rounded-2xl bg-neutral-900 border border-white/5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 mx-auto mb-4 flex items-center justify-center text-2xl">
                  👤
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-sm text-purple-400">{member.role}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
