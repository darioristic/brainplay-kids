'use client';

import React, { useState } from 'react';
import { ArrowRight, Star, Shield, Brain, Sparkles, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [familyName, setFamilyName] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim()) {
      // Redirect to subdomain
      const subdomain = familyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      window.location.href = `http://${subdomain}.localhost:3000`;
    }
  };

  const HeroOwl = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl animate-float">
      <circle cx="100" cy="110" r="80" fill="#F4C95D" />
      <path d="M 60 40 Q 100 20 140 40" fill="#F4C95D" />
      <ellipse cx="70" cy="90" rx="35" ry="30" fill="#FDFBF7" />
      <ellipse cx="130" cy="90" rx="35" ry="30" fill="#FDFBF7" />
      <circle cx="70" cy="90" r="12" fill="#5D4037" />
      <circle cx="130" cy="90" r="12" fill="#5D4037" />
      <circle cx="72" cy="88" r="4" fill="white" />
      <circle cx="132" cy="88" r="4" fill="white" />
      <path d="M 90 120 L 110 120 L 100 135 Z" fill="#E79E85" />
      <path d="M 25 110 Q 10 140 35 160" fill="#E4C15A" />
      <path d="M 175 110 Q 190 140 165 160" fill="#E4C15A" />
      <path d="M 80 150 Q 100 160 120 150" fill="none" stroke="#E79E85" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M 85 165 Q 100 175 115 165" fill="none" stroke="#E79E85" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );

  return (
    <div className="min-h-full bg-scandi-cream flex flex-col font-sans text-scandi-chocolate overflow-x-hidden">
      <nav className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full z-50 relative">
        <div className="flex items-center gap-2 font-kids font-bold text-2xl text-scandi-chocolate">
          <div className="w-10 h-10 bg-scandi-moss text-white rounded-xl flex items-center justify-center shadow-toy">
            <Brain size={24} />
          </div>
          BrainPlay
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="hidden md:flex text-sm font-bold text-scandi-stone hover:text-scandi-chocolate transition px-4 py-2 rounded-full hover:bg-scandi-oat"
          >
            Admin
          </Link>
          <button 
            onClick={() => setShowLogin(!showLogin)}
            className="bg-white border-2 border-scandi-oat text-scandi-chocolate px-6 py-2 rounded-full font-bold shadow-sm hover:border-scandi-honey transition"
          >
            {showLogin ? 'Close Login' : 'Enter Family Space'}
          </button>
        </div>
      </nav>

      <header className="relative pt-10 pb-20 px-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-scandi-honey/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-scandi-sage/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-scandi-oat text-scandi-moss font-bold text-sm animate-fade-in">
              <Sparkles size={16} />
              <span>AI-Powered Learning for Ages 0-13</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-kids font-bold text-scandi-chocolate leading-tight">
              Spark Curiosity.<br/>
              <span className="text-scandi-moss">Build Confidence.</span>
            </h1>
            
            <p className="text-xl text-scandi-stone font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              A cozy, safe digital nest where children learn through play, guided by a gentle AI companion.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link 
                href="/onboarding"
                className="px-8 py-4 bg-scandi-moss text-white rounded-full font-bold text-lg shadow-toy hover:shadow-lg hover:-translate-y-1 active:shadow-toy-active active:translate-y-[4px] transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Create Family Space <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-white text-scandi-chocolate border-2 border-scandi-oat rounded-full font-bold text-lg hover:border-scandi-sand hover:bg-scandi-cream transition-all w-full sm:w-auto"
              >
                I have a code
              </button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-scandi-stone font-semibold pt-4">
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-scandi-sage" /> Child-Safe AI</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-scandi-sage" /> Ad-Free</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-scandi-sage" /> Parent Controlled</span>
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
            {showLogin ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center animate-fade-in">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-soft-lg border border-scandi-oat w-full max-w-md text-center">
                   <div className="w-16 h-16 bg-scandi-cream rounded-full mx-auto mb-6 flex items-center justify-center text-scandi-moss">
                     <Users size={32} />
                   </div>
                   <h3 className="text-2xl font-kids font-bold mb-2">Welcome Back!</h3>
                   <p className="text-scandi-stone mb-8">Enter your family space name to begin.</p>
                   
                   <form onSubmit={handleSubmit} className="space-y-4">
                     <input 
                       autoFocus
                       type="text" 
                       placeholder="e.g. smith-family" 
                       value={familyName}
                       onChange={e => setFamilyName(e.target.value)}
                       className="w-full p-4 bg-scandi-cream border-2 border-transparent focus:border-scandi-honey rounded-2xl outline-none font-bold text-lg text-center placeholder:text-scandi-sand transition"
                     />
                     <button type="submit" className="w-full py-4 bg-scandi-clay text-white rounded-full font-bold text-lg shadow-toy active:shadow-toy-active active:translate-y-[4px] transition">
                       Enter Space
                     </button>
                   </form>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full shadow-soft-lg flex items-center justify-center z-10">
                   <div className="w-64 h-64">
                     <HeroOwl />
                   </div>
                 </div>
                 <div className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-soft animate-bounce-slow">
                    <Star className="text-scandi-honey fill-scandi-honey" size={32} />
                 </div>
                 <div className="absolute bottom-20 left-10 bg-white p-4 rounded-2xl shadow-soft animate-wiggle">
                    <Brain className="text-scandi-denim" size={32} />
                 </div>
                 <div className="absolute top-1/2 right-0 bg-white px-4 py-2 rounded-full shadow-soft font-bold text-scandi-moss text-sm animate-pulse">
                    "Hoot hoot!"
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="py-20 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-scandi-cream to-white"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-kids font-bold text-scandi-chocolate mb-4">Grows With Your Child</h2>
            <p className="text-xl text-scandi-stone max-w-2xl mx-auto">
              Our interface and content adapt magically as your child ages, from toddler interactions to junior challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Smart Discovery", 
                desc: "Adaptive games that challenge logic, creativity, and math skills.",
                icon: Brain,
                color: "text-scandi-denim",
                bg: "bg-scandi-denim/10"
              },
              { 
                title: "Owl Companion", 
                desc: "A gentle AI friend that talks, listens, and encourages curiosity.",
                icon: Sparkles,
                color: "text-scandi-honey",
                bg: "bg-scandi-honey/10"
              },
              { 
                title: "Peace of Mind", 
                desc: "Zero ads, safe content, and detailed insights for parents.",
                icon: Shield,
                color: "text-scandi-moss",
                bg: "bg-scandi-moss/10"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-[2.5rem] bg-scandi-cream border border-transparent hover:border-scandi-oat hover:shadow-soft-lg transition-all duration-300">
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold font-kids text-scandi-chocolate mb-3">{feature.title}</h3>
                <p className="text-scandi-stone leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-scandi-oat/30 py-12 border-t border-scandi-oat">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-kids font-bold text-xl text-scandi-stone">
            <div className="w-8 h-8 bg-scandi-stone text-white rounded-lg flex items-center justify-center">
              <Brain size={16} />
            </div>
            BrainPlay
          </div>
          <div className="flex gap-8 text-sm font-bold text-scandi-stone">
             <a href="#" className="hover:text-scandi-chocolate transition">About</a>
             <a href="#" className="hover:text-scandi-chocolate transition">Safety</a>
             <a href="#" className="hover:text-scandi-chocolate transition">Privacy</a>
             <a href="#" className="hover:text-scandi-chocolate transition">Contact</a>
          </div>
          <div className="text-xs font-bold text-scandi-stone/50">
            © 2024 BrainPlay Kids. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

