import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  Leaf, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  Award,
  Globe2
} from 'lucide-react';
import { api } from '../services/api';
import type { AssessmentResult } from '../types';

export const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('id') || '';
  
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'environment' | 'materials'>('reasoning');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-brand-orange border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-sans">Compiling Lifecycle Intelligence Report...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <p className="text-sm text-zinc-400 font-sans">We couldn't locate this assessment record. It might have expired or been cleared.</p>
          <Link to="/assessment" className="inline-block py-2.5 px-5 bg-brand-orange rounded-full text-xs font-bold font-sans">
            Start New Assessment
          </Link>
        </div>
      </div>
    );
  }

  // Pathway specific color formatting
  const getPathwayDetails = (path: string) => {
    switch (path) {
      case 'resell':
        return { name: 'Resell', color: 'text-amber-400 bg-amber-950/20 border-amber-500/30 glow-amber' };
      case 'repair':
        return { name: 'Repair', color: 'text-orange-400 bg-orange-950/20 border-orange-500/30 glow-orange' };
      case 'donate':
        return { name: 'Donate', color: 'text-pink-400 bg-pink-950/20 border-pink-500/30 glow-pink' };
      case 'recycle':
        return { name: 'Recycle', color: 'text-blue-400 bg-blue-950/20 border-blue-500/30 glow-blue' };
      case 'harvest':
        return { name: 'Harvest Parts', color: 'text-purple-400 bg-purple-950/20 border-purple-500/30 glow-purple' };
      case 'refurbish':
      default:
        return { name: 'Refurbish', color: 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30 glow-emerald' };
    }
  };

  const pathway = getPathwayDetails(result.recommendation);

  // Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const confidenceStroke = circumference - (result.confidenceScore / 100) * circumference;
  const healthStroke = circumference - (result.deviceHealthScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Navigation back */}
        <Link 
          to="/assessment" 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Assess Another Device</span>
        </Link>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold text-zinc-500 font-sans tracking-wide">ASSESSMENT ID: {result.deviceId}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span className="text-xs font-bold text-zinc-500 font-sans uppercase">{result.deviceType}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              {result.brand} {result.model} Report
            </h1>
          </div>
          
          {/* Glowing Pathway recommendation */}
          <div className="flex items-center">
            <div className={`px-6 py-3.5 rounded-2xl border text-sm font-extrabold tracking-wider uppercase font-display flex items-center space-x-2.5 shadow-lg ${pathway.color}`}>
              <Sparkles className="w-4.5 h-4.5" />
              <span>Recommended path: {pathway.name}</span>
            </div>
          </div>
        </div>

        {/* 3 Metrics Cards ( CO2, Economic, Lifespan ) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Lifespan */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-950/20 border border-orange-800/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-orange" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-sans">Lifespan Extension</div>
              <div className="text-2xl font-bold font-display text-white">+{result.lifecycleExtensionYears} Years</div>
            </div>
          </div>

          {/* Value saved */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-sans">Market Value Saved</div>
              <div className="text-2xl font-bold font-display text-white">${result.valuePreservedUsd} USD</div>
            </div>
          </div>

          {/* CO2 Prevented */}
          <div className="bg-white/2.5 border border-white/5 rounded-2xl p-6 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-sans">Manufacturing CO₂ Avoided</div>
              <div className="text-2xl font-bold font-display text-white">{result.environmentalImpact.co2AvoidedKg} kg</div>
            </div>
          </div>
        </div>

        {/* Detailed Diagnostic Gauges + Evidence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Gauges (5 cols) */}
          <div className="lg:col-span-5 bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-around gap-8">
            <h3 className="text-sm font-semibold text-zinc-400 font-sans">Diagnostic Index Calibration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Confidence Circle */}
              <div className="text-center space-y-3">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r={radius} 
                      className="stroke-brand-orange" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={circumference}
                      strokeDashoffset={confidenceStroke}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-display font-extrabold text-lg text-white">{result.confidenceScore}%</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white font-display">Decision Confidence</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal font-sans">Statistical match based on symptom model diagnostics.</p>
                </div>
              </div>

              {/* Health Circle */}
              <div className="text-center space-y-3">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r={radius} 
                      className="stroke-emerald-500" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={circumference}
                      strokeDashoffset={healthStroke}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-display font-extrabold text-lg text-white">{result.deviceHealthScore}%</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white font-display">Device Health</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal font-sans">Evaluated operational capacity of core hardware.</p>
                </div>
              </div>

            </div>

            <div className="bg-white/2.5 rounded-2xl p-4 border border-white/5 flex items-center space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-brand-orange flex-shrink-0" />
              <p className="text-zinc-400 font-sans leading-relaxed">
                Calibration confirmed. Integrity diagnostics align with the global electronic waste mitigation standard.
              </p>
            </div>
          </div>

          {/* Diagnostic Evidence Logs (7 cols) */}
          <div className="lg:col-span-7 bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-400 font-sans">AI Diagnostic Evidence Logs</h3>
            <div className="space-y-4">
              {result.evidence.map((fact, index) => (
                <div key={index} className="flex items-start space-x-3 text-sm bg-black/20 rounded-xl p-3.5 border border-white/5 hover:border-brand-orange/20 transition-colors">
                  <div className="mt-0.5 w-4.5 h-4.5 rounded-full bg-brand-orange/10 flex items-center justify-center text-[10px] text-brand-orange font-bold font-sans">
                    {index + 1}
                  </div>
                  <span className="text-zinc-300 font-sans leading-relaxed">{fact}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic Detail Tabs */}
        <div className="bg-white/2.5 border border-white/5 rounded-3xl overflow-hidden shadow-lg">
          {/* Tab buttons */}
          <div className="bg-zinc-950/40 border-b border-white/5 flex">
            <button
              onClick={() => setActiveTab('reasoning')}
              className={`px-6 py-4 text-xs font-bold tracking-wider uppercase font-display border-b-2 transition-all cursor-pointer ${
                activeTab === 'reasoning'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Diagnostic Reasoning
            </button>
            <button
              onClick={() => setActiveTab('environment')}
              className={`px-6 py-4 text-xs font-bold tracking-wider uppercase font-display border-b-2 transition-all cursor-pointer ${
                activeTab === 'environment'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Carbon Equivalents
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-6 py-4 text-xs font-bold tracking-wider uppercase font-display border-b-2 transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Reclaimed Metals
            </button>
          </div>

          {/* Tab contents */}
          <div className="p-6 sm:p-8 bg-zinc-950/20">
            {activeTab === 'reasoning' && (
              <div className="space-y-4 font-sans text-sm text-zinc-300 leading-relaxed max-w-3xl">
                <div className="flex items-center space-x-2 text-brand-orange mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider">Phoenix Neural Synthesis</span>
                </div>
                <p className="whitespace-pre-wrap">{result.reasoning}</p>
              </div>
            )}

            {activeTab === 'environment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Globe2 className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">Carbon Offset Metrics</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    By choosing a circular pathway instead of dumping, your action matches the environmental recovery goals of these critical benchmarks:
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-black/25 rounded-xl p-4 border border-white/5 space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Car Miles Averted</span>
                      <div className="text-xl font-bold font-display text-white">{result.environmentalImpact.carMilesAvoided} Miles</div>
                    </div>
                    <div className="bg-black/25 rounded-xl p-4 border border-white/5 space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Trees Equivalent</span>
                      <div className="text-xl font-bold font-display text-white">+{result.environmentalImpact.treesEquivalent} Trees</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/10 rounded-2xl p-6 border border-white/5 flex flex-col justify-center space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-sans">CO₂ Offset Value:</span>
                    <span className="font-bold text-emerald-400 font-sans">-{result.environmentalImpact.co2AvoidedKg} kg</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[80%]" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                    Calculation parameters represent average lifecycle greenhouse gas coefficients mapped for electronic parts under GHG Protocol Scope 3.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider">Precious Element Harvesting Potential</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
                  Electronics are high-grade mineral deposits. Extracting these elements prevents toxic chemical dump cycles and avoids mining new reserves:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Gold */}
                  <div className="bg-black/25 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-24">
                    <span className="text-[10px] text-zinc-500 font-bold font-sans">GOLD (Au)</span>
                    <span className="text-lg font-bold font-display text-white">{result.environmentalImpact.valuableMaterialsRecovered.goldGrams}g</span>
                  </div>

                  {/* Copper */}
                  <div className="bg-black/25 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-24">
                    <span className="text-[10px] text-zinc-500 font-bold font-sans">COPPER (Cu)</span>
                    <span className="text-lg font-bold font-display text-white">{result.environmentalImpact.valuableMaterialsRecovered.copperGrams}g</span>
                  </div>

                  {/* Cobalt */}
                  <div className="bg-black/25 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-24">
                    <span className="text-[10px] text-zinc-500 font-bold font-sans">COBALT (Co)</span>
                    <span className="text-lg font-bold font-display text-white">{result.environmentalImpact.valuableMaterialsRecovered.cobaltGrams}g</span>
                  </div>

                  {/* Aluminum */}
                  <div className="bg-black/25 rounded-xl p-4 border border-white/5 flex flex-col justify-between h-24">
                    <span className="text-[10px] text-zinc-500 font-bold font-sans">ALUMINUM (Al)</span>
                    <span className="text-lg font-bold font-display text-white">{result.environmentalImpact.valuableMaterialsRecovered.aluminumGrams}g</span>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global CTA Section linking downstream routes */}
        <div className="bg-forest rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-white/5">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white font-display flex items-center justify-center sm:justify-start space-x-2">
              <Award className="w-5 h-5 text-brand-orange" />
              <span>Next Pathway Execution</span>
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Activate the circular network to execute your decision: request pickups, explore listings, or view receipt.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link 
              to={`/impact?id=${result.deviceId}`}
              className="py-3 px-6 bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 hover:border-white/20 rounded-xl transition-all text-center"
            >
              View Sustainability Receipt
            </Link>
            <Link 
              to={`/action-center?id=${result.deviceId}`}
              className="py-3 px-6 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-orange/15 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Action Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
