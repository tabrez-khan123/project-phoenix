import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldAlert, Cpu, Recycle, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
            About Project Phoenix
          </h1>
          <p className="text-sm text-zinc-400 font-sans max-w-lg mx-auto">
            Ending electronic waste through machine learning diagnostics, dynamic valuation indices, and circular logistics routing.
          </p>
        </div>

        {/* Vision Statement (Apple style typography) */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-relaxed">
            "We believe that the most sustainable product is the one that already exists."
          </h2>
          <p className="text-sm text-zinc-400 font-sans leading-relaxed">
            Every year, society discards millions of high-performing processors, OLED displays, and lithium batteries. Mining raw elements to replace them leaves a permanent scar on our biosphere. Project Phoenix provides the intelligence layer needed to verify device conditions, evaluate repairability, and route hardware to its highest-value second life.
          </p>
        </div>

        {/* Framework Architecture Flowchart (SVG graphical layout) */}
        <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-400 font-sans">Phoenix Platform Framework Architecture</h3>
            <p className="text-[10px] text-zinc-500 font-sans">How hardware assessments filter through our decision pipeline.</p>
          </div>

          {/* Architecture Chart SVG */}
          <div className="w-full bg-black/30 rounded-2xl border border-white/5 p-6 overflow-x-auto custom-scrollbar">
            <div className="min-w-[700px] flex items-center justify-between gap-4">
              
              {/* Step 1: Input */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-44 text-center space-y-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center mx-auto text-brand-orange">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold font-display text-white">Device Input</div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Camera feeds, cosmetic grades, defects report</p>
              </div>

              {/* Arrow */}
              <div className="text-zinc-700 font-mono text-sm">&rarr;</div>

              {/* Step 2: Analyzer */}
              <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-5 w-48 text-center space-y-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center mx-auto text-brand-orange animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold font-display text-white">AI Diagnostic Engine</div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Visual damage checks, battery decay models, repair estimate</p>
              </div>

              {/* Arrow */}
              <div className="text-zinc-700 font-mono text-sm">&rarr;</div>

              {/* Step 3: Ledger */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-44 text-center space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold font-display text-white">Impact Registry</div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">CO2 Avoidance, gold/copper recovery weights, LCA verification</p>
              </div>

              {/* Arrow */}
              <div className="text-zinc-700 font-mono text-sm">&rarr;</div>

              {/* Step 4: Routing */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 w-44 text-center space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                  <Recycle className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold font-display text-white">Circular Logistics</div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Certified recyclers, school donations, buyback partners</p>
              </div>

            </div>
          </div>
        </div>

        {/* E-Waste Education Hub */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-400 font-sans">E-Waste Education Hub</h3>
            <p className="text-[11px] text-zinc-500 font-sans">Important facts regarding electronic hardware lifecycles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Fact 1 */}
            <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-red-500">
                <ShieldAlert className="w-5 h-5" />
                <h4 className="text-xs font-bold font-sans uppercase tracking-wider">Heavy Metals Leakage</h4>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Electronics represent only 2% of solid waste in landfills, but they account for **70% of toxic hazardous wastes**. Liquid lead and cadmium leak into water supplies when devices are burned or dumped.
              </p>
            </div>

            {/* Fact 2 */}
            <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-brand-orange">
                <Cpu className="w-5 h-5" />
                <h4 className="text-xs font-bold font-sans uppercase tracking-wider">Resource Intensity</h4>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Manufacturing a single microchip consumes **32 liters of water** and requires hazardous chemical baths. Reusing chips halts this energy-intensive mining and refining lifecycle immediately.
              </p>
            </div>

            {/* Fact 3 */}
            <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Leaf className="w-5 h-5" />
                <h4 className="text-xs font-bold font-sans uppercase tracking-wider">Carbon Offsetting</h4>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Refurbishing a computer saves **80% of its lifetime emissions**. Extending laptop ownership by just one year prevents millions of tons of Scope 3 manufacturing carbon.
              </p>
            </div>

          </div>
        </div>

        {/* Global Action CTA */}
        <div className="bg-forest rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-white/5">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white font-display">Make a Difference Today</h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Every device logged is an action logged. Assess your old smartphone or laptop.
            </p>
          </div>
          <Link 
            to="/assessment"
            className="py-3 px-6 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-1.5"
          >
            <span>Assess Your Device</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
