import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Video, 
  Mic, 
  Wrench, 
  Calculator, 
  Heart, 
  Building2, 
  Users, 
  MapPin, 
  ShieldAlert, 
  Flame, 
  Globe 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="bg-dark-bg min-h-screen">
      
      {/* SECTION 1: HERO (Dark Cinematic Aesthetic) */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        
        {/* Background Dumpster Image with environmental color grading and visibility */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/dumpster.png" 
            alt="Electronic waste dumpster" 
            className="w-full h-full object-cover object-center opacity-55 filter brightness-75 contrast-110 saturate-[0.8] scale-100" 
          />
          {/* Subtle green ambient lighting spots */}
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full green-env-glow filter blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full green-env-glow opacity-75 filter blur-[100px] pointer-events-none" />
          {/* Vignette cinematic overlay */}
          <div className="absolute inset-0 cinematic-overlay" />
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Headline and CTAs */}
            <motion.div 
              className="lg:col-span-7 space-y-8 text-left animate-fade-in"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Badge Pill */}
              <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                <span className="text-xs font-semibold tracking-wide uppercase text-brand-orange font-sans">
                  AI-Powered Sustainability
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 variants={itemVariants} className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight text-shadow-premium">
                Every Device <br />
                Deserves a <br />
                <span className="text-gradient-orange">Second Chance.</span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={itemVariants} className="font-sans text-lg text-zinc-200 max-w-xl leading-relaxed text-shadow-premium">
                An AI-powered sustainability platform that helps you repair, refurbish, donate, resell, or recycle electronics intelligently — instead of letting them become e-waste.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link 
                  to="/assessment" 
                  className="px-8 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-base font-bold rounded-full shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 drop-shadow-[0_4px_12px_rgba(255,90,54,0.15)]"
                >
                  Assess Your Device Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/impact-ledger" 
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-base font-semibold border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 text-center backdrop-blur-sm"
                >
                  See Global Impact
                </Link>
              </motion.div>

              {/* Quick links */}
              <motion.div variants={itemVariants} className="flex items-center space-x-4 text-sm text-zinc-400 font-sans pt-2 text-shadow-premium">
                <span>Or</span>
                <button className="hover:text-white transition-colors cursor-pointer">Log In</button>
                <span className="text-zinc-700">•</span>
                <Link to="/assessment" className="hover:text-white transition-colors">Continue as Guest</Link>
              </motion.div>
            </motion.div>

            {/* Floating Glassmorphism Stats Cards */}
            <motion.div 
              className="lg:col-span-5 grid grid-cols-2 gap-4 lg:pl-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              {/* Stat 1 */}
              <motion.div 
                className="glass-card-dark p-6 rounded-2xl flex flex-col justify-between h-36 border-l-2 border-l-brand-orange shadow-lg hover:border-brand-orange/40 transition-all duration-300"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-brand-orange">3.2 yrs</span>
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase font-sans">
                  Avg. Life Extended
                </span>
              </motion.div>

              {/* Stat 2 */}
              <motion.div 
                className="glass-card-dark p-6 rounded-2xl flex flex-col justify-between h-36 mt-4 lg:mt-0 shadow-lg hover:border-white/15 transition-all duration-300"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.4 }}
              >
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-white">38.2t</span>
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase font-sans">
                  CO₂ Prevented
                </span>
              </motion.div>

              {/* Stat 3 */}
              <motion.div 
                className="glass-card-dark p-6 rounded-2xl flex flex-col justify-between h-36 shadow-lg hover:border-white/15 transition-all duration-300"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.8 }}
              >
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-white">$2.1M</span>
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase font-sans">
                  Value Recovered
                </span>
              </motion.div>

              {/* Stat 4 */}
              <motion.div 
                className="glass-card-dark p-6 rounded-2xl flex flex-col justify-between h-36 mt-4 lg:mt-0 shadow-lg hover:border-white/15 transition-all duration-300"
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1.2 }}
              >
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-white">12,480</span>
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase font-sans">
                  Devices Saved
                </span>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* SECTION 2: E-WASTE PROBLEM */}
      <section className="py-24 bg-dark-bg border-t border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-orange/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
              The Critical Challenge
            </h2>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
              Electronic Waste is Growing 5x Faster Than Documented Recycling.
            </p>
            <p className="text-sm text-zinc-400 font-sans max-w-xl mx-auto">
              Millions of functional laptops and smartphones are thrown away daily, leaking heavy metals into landfills and raising global carbon output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/2.5 border border-white/5 rounded-2xl p-8 space-y-4 hover:border-brand-orange/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-red-950/20 border border-red-800/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">62 Million Tons</h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Of e-waste is generated annually worldwide, containing toxic lead, mercury, and cadmium that poison groundwater.
              </p>
            </div>
            
            <div className="bg-white/2.5 border border-white/5 rounded-2xl p-8 space-y-4 hover:border-brand-orange/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-950/20 border border-orange-800/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-brand-orange" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Only 17.4% Documented</h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Is formally collected and recycled. The remaining 82.6% is left in junk drawers, burned, or dumped in developing nations.
              </p>
            </div>

            <div className="bg-white/2.5 border border-white/5 rounded-2xl p-8 space-y-4 hover:border-brand-orange/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/20 border border-emerald-800/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">80% manufacturing footprint</h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                The massive majority of a device's lifetime greenhouse gases are generated during manufacturing. Extending device life stops this cycle.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: HOW PHOENIX WORKS */}
      <section className="py-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
              Intelligent Pipeline
            </h2>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
              Lifecycle Decisioning in Under 2 Minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="space-y-4 relative">
              <div className="text-5xl font-extrabold font-display text-brand-orange/20">01</div>
              <h3 className="text-xl font-bold text-white font-display">Provide Specifications</h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Toggle your device type, describe cosmetic conditions, and optionally drop in a photo or hardware log report.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 relative">
              <div className="text-5xl font-extrabold font-display text-brand-orange/20">02</div>
              <h3 className="text-xl font-bold text-white font-display">AI Visual Diagnostic</h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Phoenix executes a multi-point inspection checks: model identification, battery depletion, repair cost estimate, and carbon offset.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 relative">
              <div className="text-5xl font-extrabold font-display text-brand-orange/20">03</div>
              <h3 className="text-xl font-bold text-white font-display">Determine Best Next Life</h3>
              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                Receive the best pathways—Resell, Repair, Refurbish, Donate, Harvest, or Recycle—along with dynamic service links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CIRCULAR PATHWAYS */}
      <section className="py-24 bg-dark-bg border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
              Circular Economy
            </h2>
            <p className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
              Six Paths to Zero Waste
            </p>
            <p className="text-sm text-zinc-400 font-sans max-w-xl mx-auto">
              Every analyzed hardware piece fits into one of these verified, high-impact channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Repair */}
            <div className="bg-white/2.5 hover:bg-white/5 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-base font-bold text-white font-display group-hover:text-brand-orange transition-colors">Repair</h4>
              <p className="text-xs font-sans text-brand-orange mt-1">Life Extension: +2 Years</p>
              <p className="text-sm text-zinc-400 font-sans mt-3 leading-relaxed">
                Fix isolated damage like battery capacity degradation or broken charging ports.
              </p>
            </div>

            {/* Donate */}
            <div className="bg-white/2.5 hover:bg-white/5 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-base font-bold text-white font-display group-hover:text-brand-orange transition-colors">Donate</h4>
              <p className="text-xs font-sans text-emerald-400 mt-1">Social Impact: High</p>
              <p className="text-sm text-zinc-400 font-sans mt-3 leading-relaxed">
                Provide low-spec or cosmetically damaged items to educational partners and charities.
              </p>
            </div>

            {/* Refurbish */}
            <div className="bg-white/2.5 hover:bg-white/5 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-base font-bold text-white font-display group-hover:text-brand-orange transition-colors">Refurbish</h4>
              <p className="text-xs font-sans text-brand-orange mt-1">Value Recovery: Medium</p>
              <p className="text-sm text-zinc-400 font-sans mt-3 leading-relaxed">
                Clean and replace battery, screen, or cosmetics to match original hardware certifications.
              </p>
            </div>

            {/* Resell */}
            <div className="bg-white/2.5 hover:bg-white/5 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-base font-bold text-white font-display group-hover:text-brand-orange transition-colors">Resell</h4>
              <p className="text-xs font-sans text-brand-orange mt-1">Economic Return: High</p>
              <p className="text-sm text-zinc-400 font-sans mt-3 leading-relaxed">
                Instantly matches functional gadgets with certified resellers to cash out immediately.
              </p>
            </div>

            {/* Harvest Components */}
            <div className="bg-white/2.5 hover:bg-white/5 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-base font-bold text-white font-display group-hover:text-brand-orange transition-colors">Harvest Components</h4>
              <p className="text-xs font-sans text-purple-400 mt-1">Material Extraction: High</p>
              <p className="text-sm text-zinc-400 font-sans mt-3 leading-relaxed">
                Reclaim fully functional SSDs, screens, RAM, and cables from non-repairable motherboards.
              </p>
            </div>

            {/* Recycle */}
            <div className="bg-white/2.5 hover:bg-white/5 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
              <h4 className="text-base font-bold text-white font-display group-hover:text-brand-orange transition-colors">Recycle</h4>
              <p className="text-xs font-sans text-blue-400 mt-1">Toxic Mitigation: Critical</p>
              <p className="text-sm text-zinc-400 font-sans mt-3 leading-relaxed">
                Extract raw materials (gold, cobalt, copper, steel) safely in zero-burn chemical lines.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: IMPACT PREVIEW (Cream background matching the reference image) */}
      <section className="py-24 bg-cream text-zinc-900 border-t border-cream-card/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase font-sans">
              Welcome Back
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-zinc-950 leading-tight">
              What would you like to do today?
            </h2>
            <p className="text-sm text-zinc-600 font-sans max-w-xl mx-auto">
              Pick an action below — Phoenix will guide you through the rest, step by step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Assess Your Device */}
            <Link 
              to="/assessment" 
              className="bg-emerald-50 border border-emerald-100 hover:border-emerald-300 p-8 rounded-3xl flex flex-col justify-between h-[280px] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-emerald-100 shadow-sm">
                  <Video className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Assess Your Device</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Record a quick video walk-around and let Phoenix read its condition automatically.
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors">
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 2: AI Voice Assistant */}
            <div className="bg-purple-50/70 border border-purple-100/60 hover:border-purple-300 p-8 rounded-3xl flex flex-col justify-between h-[280px] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-purple-100 shadow-sm">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">AI Voice Assistant</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Answer a few spoken questions about what's wrong — Phoenix listens and figures out the rest.
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-purple-600 transition-colors">
                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Card 3: Repair Shops Near You */}
            <Link 
              to="/action-center" 
              className="bg-amber-50/70 border border-amber-100 hover:border-amber-300 p-8 rounded-3xl flex flex-col justify-between h-[280px] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-amber-100 shadow-sm">
                  <Wrench className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Repair Shops Near You</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Find trusted, certified repair shops nearby with transparent pricing and reviews.
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-amber-600 transition-colors">
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>

            {/* Card 4: Sustainability Impact Calculator */}
            <Link 
              to="/impact-ledger" 
              className="bg-blue-50/70 border border-blue-100 hover:border-blue-300 p-8 rounded-3xl flex flex-col justify-between h-[280px] shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-blue-100 shadow-sm">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Sustainability Calculator</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  See exactly how much CO2, water, and raw material your choice will save.
                </p>
              </div>
              <div className="flex justify-end pt-4">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* SECTION 6: OUR COMMUNITY (Cream background matching the reference image) */}
      <section className="py-24 bg-cream text-zinc-900 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-zinc-950 leading-tight">
              Our Community
            </h2>
            <p className="text-sm text-zinc-600 font-sans max-w-xl mx-auto">
              Phoenix connects devices, people, and organizations working toward the same goal — keeping electronics in use, in circulation, or responsibly recycled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Partner NGOs */}
            <div className="bg-emerald-50/50 border border-emerald-100/60 p-8 rounded-3xl flex flex-col justify-between h-[280px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-emerald-100 shadow-sm">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Partner NGOs</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Meet the organizations Phoenix works with to refurbish and redistribute devices.
                </p>
              </div>
              <div>
                <a href="#" className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                  <span>Explore partners</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Join an NGO */}
            <div className="bg-purple-50/50 border border-purple-100/60 p-8 rounded-3xl flex flex-col justify-between h-[280px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-purple-100 shadow-sm">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Join an NGO</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Bring Phoenix's tools to your own organization and start tracking your impact.
                </p>
              </div>
              <div>
                <a href="#" className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-700 hover:text-purple-900">
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: Donate Your Device */}
            <Link 
              to="/assessment" 
              className="bg-rose-50/50 border border-rose-100/60 p-8 rounded-3xl flex flex-col justify-between h-[280px]"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-rose-100 shadow-sm">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Donate Your Device</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Give an old device a new home with someone who needs it most.
                </p>
              </div>
              <div>
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-700 hover:text-rose-900">
                  <span>Start donation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Card 4: Find Recycling Centers */}
            <Link 
              to="/action-center" 
              className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col justify-between h-[280px]"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold font-display text-zinc-950">Find Recycling Centers</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  Locate certified e-waste recycling centers near you, ready when nothing else fits.
                </p>
              </div>
              <div>
                <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900">
                  <span>Find a center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* SECTION 7: CTA (Dark Green Rounded Container matching screenshots) */}
      <section className="py-20 bg-cream text-white pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            className="bg-forest rounded-[2.5rem] py-16 px-8 sm:px-16 text-center max-w-5xl mx-auto relative overflow-hidden shadow-2xl shadow-forest/20"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-orange/5 rounded-full filter blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-5xl font-display font-extrabold leading-tight">
                Ready to give your device its next chapter?
              </h2>
              
              <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed max-w-lg mx-auto">
                It takes less than two minutes — record, answer a few questions, and get a verdict you can act on today.
              </p>

              <div className="pt-4">
                <Link 
                  to="/assessment" 
                  className="px-10 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-base font-bold rounded-full shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center"
                >
                  Start Your Assessment
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};
