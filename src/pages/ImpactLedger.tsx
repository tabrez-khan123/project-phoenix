import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe2, 
  Leaf, 
  Laptop, 
  Smartphone, 
  DollarSign, 
  Award,
  Users,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import type { CommunityAction, LedgerStats } from '../types';

export const ImpactLedger: React.FC = () => {
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [feed, setFeed] = useState<CommunityAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLedger = async () => {
      setLoading(true);
      try {
        const statsData = await api.getGlobalLedgerStats();
        const feedData = await api.getCommunityActions();
        setStats(statsData);
        setFeed(feedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLedger();
  }, []);

  // Simulating real-time feeds appending to the community log
  useEffect(() => {
    if (feed.length === 0) return;

    const names = ['Liam G.', 'Sofia V.', 'Kenji H.', 'Amara N.', 'David S.'];
    const locations = ['Toronto, CA', 'Madrid, ES', 'Tokyo, JP', 'Nairobi, KE', 'Chicago, IL'];
    const brands = ['Apple', 'Dell', 'Samsung', 'Lenovo', 'Google'];
    const models = ['iPhone 12', 'Inspiron 15', 'Galaxy S20', 'ThinkPad E14', 'Pixel 6'];
    const pathways = ['repair', 'refurbish', 'donate', 'recycle', 'harvest'] as const;
    const co2Val = [65, 280, 150, 35, 95];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * names.length);
      const newAction: CommunityAction = {
        id: 'c_live_' + Math.random().toString(36).substr(2, 5),
        userName: names[idx],
        userLocation: locations[idx],
        deviceType: idx % 2 === 0 ? 'laptop' : 'smartphone',
        brand: brands[idx],
        model: models[idx],
        pathway: pathways[idx],
        timestamp: 'Just now',
        co2SavedKg: co2Val[idx]
      };

      setFeed(prev => [newAction, ...prev].slice(0, 6)); // cap at 6 entries
      
      // Slightly increment global metrics to match active real-time updates!
      setStats(prev => {
        if (!prev) return null;
        return {
          devicesSaved: prev.devicesSaved + 1,
          co2AvoidedTons: parseFloat((prev.co2AvoidedTons + (co2Val[idx] / 1000)).toFixed(3)),
          educationalDonations: pathways[idx] === 'donate' ? prev.educationalDonations + 1 : prev.educationalDonations,
          economicValuePreservedUsd: prev.economicValuePreservedUsd + (idx % 2 === 0 ? 350 : 120)
        };
      });
    }, 4500); // simulated activity every 4.5 seconds

    return () => clearInterval(interval);
  }, [feed]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-sans">Syncing Global Ledger Accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
            Global Registry
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
            The Global Impact Ledger
          </h1>
          <p className="text-sm text-zinc-400 font-sans max-w-lg mx-auto">
            Live environmental savings indices, active donor channels, and real-time community hardware lifecycles.
          </p>
        </div>

        {/* Global Stats Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          
          {/* Stat 1: Saved */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-2 border-t-2 border-t-brand-orange">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-brand-orange" />
              <span>Devices Saved</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">{stats.devicesSaved.toLocaleString()}</div>
          </div>

          {/* Stat 2: CO2 Avoided */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-2 border-t-2 border-t-emerald-500">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>CO₂ Avoided</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-400">{stats.co2AvoidedTons.toLocaleString()} Tons</div>
          </div>

          {/* Stat 3: Donations */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-2 border-t-2 border-t-pink-500">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Users className="w-4 h-4 text-pink-400" />
              <span>Edu Donations</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">{stats.educationalDonations} Items</div>
          </div>

          {/* Stat 4: Preserved Value */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 space-y-2 border-t-2 border-t-amber-500">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-sans flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>Value Preserved</span>
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">${stats.economicValuePreservedUsd.toLocaleString()}</div>
          </div>

        </div>

        {/* Global Impact Map & Feed (Split Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Global SVG Map (7 cols) */}
          <div className="lg:col-span-7 bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-[450px]">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                <Globe2 className="w-4.5 h-4.5 text-brand-orange" />
                <span>Global Hardware Offsets Node Graph</span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans">Pulsing nodes represent localized device assessments logged within past 24h.</p>
            </div>

            {/* Stylized SVG Map Container */}
            <div className="flex-grow flex items-center justify-center relative bg-black/20 rounded-2xl border border-white/5 overflow-hidden my-4">
              
              {/* Map grid decoration */}
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

              <svg viewBox="0 0 800 450" className="w-full h-full text-zinc-800/40 select-none">
                {/* Simplified Continents paths */}
                <path d="M150,150 L250,130 L300,160 L280,240 L240,280 L180,250 Z" fill="currentColor" />
                <path d="M220,300 L260,290 L290,340 L270,390 L240,410 L210,380 Z" fill="currentColor" />
                <path d="M400,140 L520,110 L580,150 L560,240 L490,260 L450,220 Z" fill="currentColor" />
                <path d="M480,270 L520,260 L540,300 L500,340 L460,320 Z" fill="currentColor" />
                <path d="M600,280 L650,270 L680,310 L660,340 L610,320 Z" fill="currentColor" />
                
                {/* Node coordinates & pulses */}
                
                {/* Node 1: North America */}
                <g transform="translate(240, 180)">
                  <circle r="12" className="fill-brand-orange/15 stroke-brand-orange/30 stroke-[0.5px] animate-ping" />
                  <circle r="4" className="fill-brand-orange shadow-glow-orange" />
                </g>

                {/* Node 2: Europe */}
                <g transform="translate(460, 160)">
                  <circle r="12" className="fill-brand-orange/15 stroke-brand-orange/30 stroke-[0.5px] animate-ping" />
                  <circle r="4" className="fill-brand-orange" />
                </g>

                {/* Node 3: Asia */}
                <g transform="translate(540, 190)">
                  <circle r="15" className="fill-emerald-500/15 stroke-emerald-500/30 stroke-[0.5px] animate-ping" />
                  <circle r="4" className="fill-emerald-400" />
                </g>

                {/* Node 4: India */}
                <g transform="translate(510, 220)">
                  <circle r="10" className="fill-brand-orange/15 stroke-brand-orange/30 stroke-[0.5px] animate-ping" />
                  <circle r="4" className="fill-brand-orange" />
                </g>

                {/* Node 5: South America */}
                <g transform="translate(260, 340)">
                  <circle r="8" className="fill-emerald-500/10 stroke-emerald-500/20 stroke-[0.5px]" />
                  <circle r="3.5" className="fill-emerald-400/80" />
                </g>
              </svg>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-sans">
              <span>Map scale: Mercator projection grid layout</span>
              <span>Updated: Real-time telemetry feed active</span>
            </div>
          </div>

          {/* Community Live Logs Feed (5 cols) */}
          <div className="lg:col-span-5 bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-[450px]">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                <Compass className="w-4.5 h-4.5 text-brand-orange" />
                <span>Live Action Logs</span>
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans">Latest assessment pathways completed across the globe.</p>
            </div>

            {/* List Feed */}
            <div className="flex-grow overflow-y-auto space-y-3.5 my-4 pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {feed.map((act) => (
                  <motion.div 
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="bg-black/20 rounded-xl p-3 border border-white/5 hover:border-brand-orange/20 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-grow min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-display truncate">{act.userName}</span>
                        <span className="text-[9px] text-zinc-500 font-sans">{act.userLocation}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-zinc-400 truncate font-sans">
                        {act.deviceType === 'laptop' ? <Laptop className="w-3.5 h-3.5 text-zinc-500" /> : <Smartphone className="w-3.5 h-3.5 text-zinc-500" />}
                        <span>Saved {act.brand} {act.model} ({act.pathway})</span>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-emerald-400 font-sans">-{act.co2SavedKg} kg CO₂</div>
                      <div className="text-[9px] text-zinc-500 font-sans">{act.timestamp}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">
                ••• TELEMETRY SYNCED •••
              </span>
            </div>
          </div>

        </div>

        {/* Success Stories Grid */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
              <Award className="w-4.5 h-4.5 text-brand-orange" />
              <span>Mitigation Success Stories</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans">How recovered hardware creates direct environmental and social utility value.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Story 1 */}
            <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs uppercase tracking-wider font-display">
                  <span>Educational Donation</span>
                  <span className="text-zinc-600 font-sans">•</span>
                  <span>Austin Prep Schools</span>
                </div>
                <h4 className="text-lg font-bold text-white font-display">120 Laptops Refurbished for STEM Labs</h4>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  A local technology company cycled out their engineering workstations. Phoenix intelligence routed them to refurbishing centers, preserving RAM cores and sending them to Austin public middle schools.
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-400 font-sans">33.6 Tons CO₂ Saved</div>
                  <div className="text-[9px] text-zinc-500 font-sans">Avoided manufacture emissions</div>
                </div>
                <a href="#" className="inline-flex items-center space-x-0.5 text-xs text-zinc-400 hover:text-brand-orange">
                  <span>Full report</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider font-display">
                  <span>Precious Metals Harvest</span>
                  <span className="text-zinc-600 font-sans">•</span>
                  <span>Metals Reclamation Partners</span>
                </div>
                <h4 className="text-lg font-bold text-white font-display">4,200 Smartphones Processed for Cobalt Recovery</h4>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Water-damaged phone chassises discarded from consumer drops were processed in a zero-burn eco-refining facility, reclaiming high-grade cobalt and gold nodes.
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-400 font-sans">1,470g Precious Metals Reclaimed</div>
                  <div className="text-[9px] text-zinc-500 font-sans">Averted mining exploration</div>
                </div>
                <a href="#" className="inline-flex items-center space-x-0.5 text-xs text-zinc-400 hover:text-brand-orange">
                  <span>Full report</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
