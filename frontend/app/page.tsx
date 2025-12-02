import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import AnimatedTitle from '@/components/AnimatedTitle';
import HeroSubtitle from '@/components/HeroSubtitle';
import TeamMemberCard from '@/components/TeamMemberCard';
import Footer from '@/components/Footer';
import InteractiveFeatureCard from '@/components/InteractiveFeatureCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        </div>

        <MotionWrapper className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="mb-6 w-full">
            <AnimatedTitle />
          </div>
          <HeroSubtitle />

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
            <Link
              href="/learn-more"
              className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-all"
            >
              Learn More
            </Link>
          </div>
        </MotionWrapper>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Decorative Background for Section */}
        <div className="absolute inset-0 bg-neutral-950">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <MotionWrapper delay={0.2}>
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-20">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent bg-[length:200%_auto] animate-shine">Get2Gather?</span>
            </h2>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <InteractiveFeatureCard 
              icon="🎉"
              title="Exciting Events"
              description="Never miss a beat. Discover high-energy concerts, tech hackathons, and cultural fests tailored to your interests."
              colorClass="from-primary to-purple-600"
              delay={0}
            />
            <InteractiveFeatureCard 
              icon="⚡"
              title="Instant Access"
              description="Say goodbye to queues. Secure your spot in seconds with our lightning-fast QR ticketing and seamless check-in system."
              colorClass="from-blue-500 to-cyan-400"
              delay={0.1}
            />
            <InteractiveFeatureCard 
              icon="🏆"
              title="Level Up"
              description="More than just events. Earn XP, unlock badges, and climb the leaderboards by participating and volunteering."
              colorClass="from-amber-500 to-orange-600"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-neutral-900/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <MotionWrapper>
            <h2 className="text-5xl font-bold text-center mb-20">Meet the <span className="text-primary">Team</span></h2>
          </MotionWrapper>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {[
              { 
                name: "Alex Johnson", 
                role: "Lead Developer", 
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
                contribution: "Architected the entire backend microservices and real-time notification system.",
                socials: { github: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
              },
              { 
                name: "Sam Smith", 
                role: "UI/UX Designer", 
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede",
                contribution: "Designed the vibrant neon theme and crafted the seamless user experience.",
                socials: { github: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
              },
              { 
                name: "Jordan Lee", 
                role: "Backend Engineer", 
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffdfbf",
                contribution: "Optimized database queries and implemented the secure authentication flow.",
                socials: { github: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
              },
              { 
                name: "Casey Taylor", 
                role: "Project Manager", 
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey&backgroundColor=ffdfbf",
                contribution: "Coordinated the sprint cycles and ensured timely delivery of all features.",
                socials: { github: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
              },
              { 
                name: "Riley Davis", 
                role: "Frontend Dev", 
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley&backgroundColor=b6e3f4",
                contribution: "Built the responsive dashboard and implemented the complex animation logic.",
                socials: { github: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
              },
              { 
                name: "Morgan White", 
                role: "QA Engineer", 
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan&backgroundColor=c0aede",
                contribution: "Conducted rigorous testing to ensure a bug-free and smooth launch.",
                socials: { github: "#", linkedin: "#", instagram: "#", whatsapp: "#" }
              }
            ].map((member, i) => (
              <StaggerItem key={i}>
                <TeamMemberCard {...member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
