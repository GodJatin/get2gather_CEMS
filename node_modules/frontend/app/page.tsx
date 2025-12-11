import Link from 'next/link';
import MotionWrapper, { StaggerContainer, StaggerItem } from '@/components/MotionWrapper';
import AnimatedTitle from '@/components/AnimatedTitle';
import HeroSubtitle from '@/components/HeroSubtitle';
import TeamMemberCard from '@/components/TeamMemberCard';
import Footer from '@/components/Footer';
import InteractiveFeatureCard from '@/components/InteractiveFeatureCard';

export default function Home() {
  return (
    <div className="min-h-screen text-white overflow-hidden relative z-10 w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        {/* Background Gradients */}
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950" />
           {/* Aurora-like effects */}
          <div className="absolute top-[-10%] left-[20%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px] animate-pulse delay-700" />
          
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
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
                name: "Jatin Jalpesh Shah", 
                role: "Lead Developer", 
                image: "/pfp/Jatin Jalpesh Shah.png",
                contribution: "Architected the entire backend microservices and real-time notification system.",
                socials: { 
                  github: "https://github.com/GodJatin", 
                  linkedin: "https://www.linkedin.com/in/jatin-jalpesh-shah-6961842bb/", 
                  instagram: "https://www.instagram.com/jatin_jalpesh_shah?igsh=bXVxMTY4bThmNmMz", 
                  whatsapp: "https://wa.me/918511666675?text=Hello%2C%20I%E2%80%99m%20contacting%20through%20your%20website%20(%22Get2Gather%22).%20Kindly%20respond%20me." 
                }
              },
              { 
                name: "Gaurav Vijay Upadhyay", 
                role: "UI/UX Designer", 
                image: "/pfp/Gaurav Vijay Upadhyay.png",
                contribution: "Designed the vibrant neon theme and crafted the seamless user experience.",
                socials: { 
                  github: "https://github.com/Gaurav00321", 
                  linkedin: "https://www.linkedin.com/in/gauravupadhyay-tech", 
                  instagram: "https://www.instagram.com/gauravxupadhyay", 
                  whatsapp: "https://wa.me/917275742642?text=Hello%2C%20I%E2%80%99m%20contacting%20through%20your%20website%20(%22Get2Gather%22).%20Kindly%20respond%20me." 
                }
              },
              { 
                name: "Arunav Roy Sarkar", 
                role: "Backend Engineer", 
                image: "/pfp/Arunav Roy Sarkar.png",
                contribution: "Optimized database queries and implemented the secure authentication flow.",
                socials: { 
                  github: "https://share.google/KAMOpciWHCPdyH5rb", 
                  linkedin: "https://www.linkedin.com/in/arunav-roy-36502a2a4?utm_source=share_via&utm_content=profile&utm_medium=member_android", 
                  instagram: "https://www.instagram.com/arunav696?igsh=MWNjcGR4aHNtNHFhNA==", 
                  whatsapp: "https://wa.me/917002781019?text=Hello%2C%20I%E2%80%99m%20contacting%20through%20your%20website%20(%22Get2Gather%22).%20Kindly%20respond%20me." 
                }
              },
              { 
                name: "Ravi Ranjan", 
                role: "Project Manager", 
                image: "/pfp/Ravi Ranjan.png",
                contribution: "Coordinated the sprint cycles and ensured timely delivery of all features.",
                socials: { 
                  github: "https://github.com/RaviR659", 
                  linkedin: "https://www.linkedin.com/in/ravi-ranjan-909623372", 
                  instagram: "https://www.instagram.com/raviranjan6834?igsh=MWhwdzdub2FwMjVh", 
                  whatsapp: "https://wa.me/919274868331?text=Hello%2C%20I%E2%80%99m%20contacting%20through%20your%20website%20(%22Get2Gather%22).%20Kindly%20respond%20me." 
                }
              },
              { 
                name: "R Jan Steve Daniel", 
                role: "Frontend Dev", 
                image: "/pfp/R Jan Steve Daniel.png",
                contribution: "Built the responsive dashboard and implemented the complex animation logic.",
                socials: { 
                  github: "https://github.com/JanSteve", 
                  linkedin: "https://linkedin.com/in/r-jan-steve-daniel-248630275", 
                  instagram: "https://instagram.com/_stevexdd", 
                  whatsapp: "https://wa.me/919384670536?text=Hello%2C%20I%E2%80%99m%20contacting%20through%20your%20website%20(%22Get2Gather%22).%20Kindly%20respond%20me." 
                }
              },
              { 
                name: "Smit Patel", 
                role: "QA Engineer", 
                image: "/pfp/Smit Patel.png",
                contribution: "Conducted rigorous testing to ensure a bug-free and smooth launch.",
                socials: { 
                  github: "https://github.com/smitp6832-lang", 
                  linkedin: "https://www.linkedin.com/in/smit-patel-35ab772b3?utm_source=share_via&utm_content=profile&utm_medium=member_android", 
                  instagram: "https://www.instagram.com/smit__patel_0070?igsh=ZXFjNGh1c3g3dWZj", 
                  whatsapp: "https://wa.me/919016093364?text=Hello%2C%20I%E2%80%99m%20contacting%20through%20your%20website%20(%22Get2Gather%22).%20Kindly%20respond%20me." 
                }
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
