import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, CheckCircle, Leaf, Zap, Trees, Milestone } from 'lucide-react';
import { api } from '../services/api';
import type { AssessmentResult } from '../types';

export const ImpactReport: React.FC = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('id') || '';
  
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sliderVal, setSliderVal] = useState(1); // multiplier slider for fun visual scaling
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const data = await api.getAssessmentResult(deviceId);
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [deviceId]);

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-sans">Compiling Sustainability Metrics...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <p className="text-sm text-zinc-400 font-sans">We couldn't locate this impact record.</p>
          <Link to="/assessment" className="inline-block py-2.5 px-5 bg-brand-orange rounded-full text-xs font-bold font-sans">
            Assess New Device
          </Link>
        </div>
      </div>
    );
  }

  // Multiplier conversions
  const baseCO2 = result.environmentalImpact.co2AvoidedKg;
  const scaledCO2 = Math.round(baseCO2 * sliderVal);
  const scaledMiles = Math.round(result.environmentalImpact.carMilesAvoided * sliderVal);
  const scaledTrees = Math.round(result.environmentalImpact.treesEquivalent * sliderVal);
  const scaledCharges = Math.round(scaledCO2 * 121); // ~121 smartphone charges per kg of CO2

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-brand-orange/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Navigation back */}
        <Link 
          to={`/results?id=${result.deviceId}`} 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment Results</span>
        </Link>

        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
            Eco-Mitigation Log
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
            Sustainability Impact Report
          </h1>
          <p className="text-sm text-zinc-400 font-sans max-w-md mx-auto">
            Review detailed offsets, material recoveries, and download your verified sustainability receipt ledger.
          </p>
        </div>

        {/* Grid split: Sliders & Stats (6 cols) vs. Receipt (6 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Stats & Equivalencies (6 cols) */}
          <div className="md:col-span-6 space-y-8">
            
            {/* Main Stats Block */}
            <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold text-zinc-400 font-sans">Consolidated Resource Offsets</h3>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Stat 1: CO2 */}
                <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">CO₂ Avoided</span>
                  <div className="text-2xl font-bold font-display text-white">{scaledCO2} kg</div>
                </div>

                {/* Stat 2: E-waste */}
                <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">E-Waste Prevented</span>
                  <div className="text-2xl font-bold font-display text-white">{(result.environmentalImpact.eWastePreventedGrams * sliderVal / 1000).toFixed(2)} kg</div>
                </div>

                {/* Stat 3: Lifespan */}
                <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Life Extension</span>
                  <div className="text-2xl font-bold font-display text-white">{(result.lifecycleExtensionYears * sliderVal).toFixed(1)} yrs</div>
                </div>

                {/* Stat 4: Value */}
                <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Value Preserved</span>
                  <div className="text-2xl font-bold font-display text-white">${result.valuePreservedUsd * sliderVal}</div>
                </div>

              </div>
            </div>

            {/* Interactive Equivalence Scaling Slider */}
            <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white font-display">Simulate Community Action Scale</h3>
                <p className="text-xs text-zinc-400 font-sans">See what happens if multiple people in your community take this exact action:</p>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={sliderVal} 
                  onChange={(e) => setSliderVal(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 font-sans">
                  <span>1 User (You)</span>
                  <span className="text-brand-orange">{sliderVal} Users</span>
                  <span>100 Users</span>
                </div>
              </div>

              {/* Equivalency Indicators */}
              <div className="space-y-4 pt-3 border-t border-white/5">
                
                {/* Cars */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-950/20 border border-orange-800/30 flex items-center justify-center text-brand-orange">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Car Miles Driven Avoided</div>
                    <div className="text-sm font-bold text-zinc-200 font-display">{scaledMiles.toLocaleString()} Miles</div>
                  </div>
                </div>

                {/* Charges */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-center justify-center text-amber-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Phone Recharges Saved</div>
                    <div className="text-sm font-bold text-zinc-200 font-display">{scaledCharges.toLocaleString()} Cycles</div>
                  </div>
                </div>

                {/* Trees */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Equivalent Trees Grown</div>
                    <div className="text-sm font-bold text-zinc-200 font-display">{scaledTrees.toLocaleString()} Trees</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Receipt Column (6 cols) */}
          <div className="md:col-span-6 flex flex-col items-center">
            
            {/* Receipt Frame */}
            <div className="w-full max-w-[360px] bg-white text-zinc-950 rounded-2xl shadow-2xl relative overflow-hidden p-6 sm:p-8 space-y-6 select-none flex flex-col justify-between">
              
              {/* Receipt Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                  <span>VERIFIED CARBON OFFSET</span>
                </div>
                <h4 className="font-display font-extrabold text-lg tracking-tight pt-1">PHOENIX IMPACT LEDGER</h4>
                <p className="text-[10px] font-mono text-zinc-500">TAX INVOICE / OFFSET RECEIPT</p>
                <div className="text-[9px] font-mono text-zinc-400">UUID: {result.deviceId.toUpperCase()}-{Math.floor(Math.random()*10000)}</div>
              </div>

              {/* Receipt Body */}
              <div className="font-mono text-xs space-y-3.5 border-t border-b border-dashed border-zinc-300 py-6">
                
                {/* Meta details */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>14-JUN-2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DEVICE:</span>
                    <span className="truncate max-w-[160px]">{result.brand.toUpperCase()} {result.model.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PATHWAY:</span>
                    <span>{result.recommendation.toUpperCase()}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3 space-y-2">
                  <div className="font-bold">RESOURCE OFFSETS:</div>
                  <div className="flex justify-between">
                    <span>CO2 EQUIV SAVED:</span>
                    <span>-{scaledCO2} KG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>E-WASTE REDUCED:</span>
                    <span>-{(result.environmentalImpact.eWastePreventedGrams * sliderVal).toLocaleString()} G</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LIFESPAN BOOST:</span>
                    <span>+{(result.lifecycleExtensionYears * sliderVal).toFixed(1)} YRS</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3 space-y-1 text-[11px]">
                  <div className="font-bold text-xs">RECOVERED MINERALS:</div>
                  <div className="flex justify-between">
                    <span>GOLD (Au):</span>
                    <span>+{(result.environmentalImpact.valuableMaterialsRecovered.goldGrams * sliderVal).toFixed(3)} G</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COPPER (Cu):</span>
                    <span>+{(result.environmentalImpact.valuableMaterialsRecovered.copperGrams * sliderVal).toFixed(1)} G</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COBALT (Co):</span>
                    <span>+{(result.environmentalImpact.valuableMaterialsRecovered.cobaltGrams * sliderVal).toFixed(1)} G</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3.5 flex justify-between font-bold text-sm">
                  <span>TOTAL ESTIMATED SAVINGS:</span>
                  <span className="text-emerald-700">${result.valuePreservedUsd * sliderVal}</span>
                </div>

              </div>

              {/* Barcode representation */}
              <div className="text-center space-y-2">
                {/* Mock Barcode bars */}
                <div className="w-full h-10 flex items-center justify-center gap-[1.5px] bg-white pt-1">
                  {[...Array(38)].map((_, i) => {
                    const width = (i % 3 === 0) ? 'w-[3px]' : (i % 2 === 0) ? 'w-[1.5px]' : 'w-[0.75px]';
                    const opacity = i % 5 === 0 ? 'bg-transparent' : 'bg-black';
                    return <div key={i} className={`h-full ${width} ${opacity}`} />;
                  })}
                </div>
                <div className="text-[9px] font-mono text-zinc-500 tracking-[0.25em]">
                  *PHX-{result.deviceId.toUpperCase()}*
                </div>
              </div>

              {/* Jagged bottom indicator via visual absolute div dots or styling */}
              <div className="text-center text-[10px] font-sans text-zinc-400 pt-2">
                Thank you for enabling circular life.
              </div>

            </div>

            {/* Share / Download Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleShare}
                className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
              >
                {shared ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-zinc-300" />
                    <span>Share Receipt</span>
                  </>
                )}
              </button>
              <button
                onClick={() => alert('Downloading PDF receipt payload...')}
                className="py-2.5 px-5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
