import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wrench, 
  Heart, 
  DollarSign, 
  Trash2, 
  MapPin, 
  Star, 
  Calendar, 
  Sparkles, 
  Award,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import type { AssessmentResult } from '../types';

export const ActionCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('id') || '';
  
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionDone, setActionDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-06-16');

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
          <p className="text-sm text-zinc-400 font-sans">Mapping Action Center pathways...</p>
        </div>
      </div>
    );
  }

  // Fallback if no device results are found
  const finalResult: AssessmentResult = result || {
    deviceId: 'default',
    deviceType: 'laptop',
    brand: 'Apple',
    model: 'MacBook Pro',
    recommendation: 'repair',
    confidenceScore: 90,
    deviceHealthScore: 65,
    evidence: [],
    reasoning: '',
    lifecycleExtensionYears: 2.0,
    valuePreservedUsd: 300,
    environmentalImpact: {
      co2AvoidedKg: 200,
      eWastePreventedGrams: 2000,
      valuableMaterialsRecovered: { goldGrams: 0.2, copperGrams: 100, cobaltGrams: 30, aluminumGrams: 500 },
      treesEquivalent: 9,
      carMilesAvoided: 490
    }
  };

  const getPathwayGroup = (recommendation: string): 'repair' | 'donate' | 'resell' | 'recycle' => {
    if (recommendation === 'refurbish') return 'resell';
    if (recommendation === 'harvest') return 'recycle';
    return recommendation as 'repair' | 'donate' | 'resell' | 'recycle';
  };

  const pathwayGroup = getPathwayGroup(finalResult.recommendation);

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Navigation back */}
        <div className="flex justify-between items-center">
          <Link 
            to={result ? `/results?id=${result.deviceId}` : '/'} 
            className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Results</span>
          </Link>
          
          <Link 
            to={`/impact?id=${finalResult.deviceId}`}
            className="text-xs font-semibold text-brand-orange hover:underline font-sans"
          >
            Review Sustainability Impact Report &rarr;
          </Link>
        </div>

        {/* Header summary */}
        <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-bold text-zinc-500 font-sans tracking-wide">ACTION EXECUTION CORE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
            <span className="text-xs font-bold text-zinc-400 font-sans uppercase">{finalResult.brand} {finalResult.model}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
            Next Action Pathway: <span className="capitalize text-brand-orange">{pathwayGroup}</span>
          </h1>
          <p className="text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
            Based on the AI hardware assessment, we have filtered the highest value, lowest footprint options to complete the device's circular transition.
          </p>
        </div>

        {/* Content based on dynamic pathway */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Main action execution area (8 cols) */}
          <div className="md:col-span-8">
            {actionDone ? (
              <div className="bg-emerald-950/10 border border-emerald-800/20 rounded-3xl p-8 text-center space-y-6 shadow-xl animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Award className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-white">Pathway Activated!</h3>
                  <p className="text-sm text-zinc-400 font-sans leading-relaxed max-w-md mx-auto">
                    Your request has been successfully registered. Partner services have been locked in, and your circular savings have been compiled into the Global ledger.
                  </p>
                </div>
                <div className="pt-4 flex justify-center space-x-4">
                  <Link to="/impact-ledger" className="py-2.5 px-6 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-lg">
                    Check Community Ledger
                  </Link>
                  <Link to="/" className="py-2.5 px-6 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold">
                    Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. REPAIR PATHWAY */}
                {pathwayGroup === 'repair' && (
                  <div className="space-y-6 animate-fade-in-up">
                    
                    {/* Cost & Time breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/2.5 border border-white/5 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Estimated Cost</span>
                        <div className="text-xl font-bold text-white font-display">$115 - $140 USD</div>
                      </div>
                      <div className="bg-white/2.5 border border-white/5 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Estimated Service Duration</span>
                        <div className="text-xl font-bold text-white font-display">1.5 Hours</div>
                      </div>
                    </div>

                    {/* Tech Shops list */}
                    <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                        <Wrench className="w-4 h-4 text-brand-orange" />
                        <span>Certified Repair Shops Nearby</span>
                      </h3>
                      
                      <div className="space-y-3.5">
                        
                        {/* Shop 1 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-white font-display">UrbanTech Repairs</span>
                              <div className="flex items-center space-x-0.5 text-amber-400 text-xs">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="font-bold">4.8</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-sans">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                              <span>0.8 Miles away (Austin Downtown)</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActionDone(true)}
                            className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Book Repair
                          </button>
                        </div>

                        {/* Shop 2 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-white font-display">EcoFix Solutions</span>
                              <div className="flex items-center space-x-0.5 text-amber-400 text-xs">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="font-bold">4.6</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-sans">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                              <span>2.1 Miles away (North Loop)</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActionDone(true)}
                            className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Book Repair
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* 2. DONATE PATHWAY */}
                {pathwayGroup === 'donate' && (
                  <div className="space-y-6 animate-fade-in-up">
                    
                    {/* Impact potential card */}
                    <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-2xl p-5 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 font-sans uppercase">Social Impact Potential</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                        Donating this device helps bridge the digital divide. Fully operational, lower-spec machines are converted into educational learning interfaces for elementary classrooms.
                      </p>
                    </div>

                    {/* NGOs list */}
                    <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-brand-orange" />
                        <span>Partner Educational NGOs</span>
                      </h3>
                      
                      <div className="space-y-3.5">
                        
                        {/* NGO 1 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <span className="text-sm font-bold text-white font-display">Computers For Classrooms</span>
                            <p className="text-xs text-zinc-400 font-sans leading-relaxed">Redistributes functional laptops to low-income middle school kids.</p>
                          </div>
                          <button 
                            onClick={() => setActionDone(true)}
                            className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Donate Device
                          </button>
                        </div>

                        {/* NGO 2 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <span className="text-sm font-bold text-white font-display">Digital Divide Coalition</span>
                            <p className="text-xs text-zinc-400 font-sans leading-relaxed">Sends smartphones and tablets to digital literacy campaigns in community centers.</p>
                          </div>
                          <button 
                            onClick={() => setActionDone(true)}
                            className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Donate Device
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* 3. RESELL PATHWAY */}
                {pathwayGroup === 'resell' && (
                  <div className="space-y-6 animate-fade-in-up">
                    
                    {/* Valuations & Demand */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/2.5 border border-white/5 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Estimated Resell Value</span>
                        <div className="text-xl font-bold text-white font-display">${finalResult.valuePreservedUsd} USD</div>
                      </div>
                      <div className="bg-white/2.5 border border-white/5 rounded-2xl p-5 space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Global Demand Score</span>
                        <div className="text-xl font-bold text-emerald-400 font-display flex items-center space-x-1.5">
                          <TrendingUp className="w-5 h-5" />
                          <span>9.4 / 10 (High)</span>
                        </div>
                      </div>
                    </div>

                    {/* Certified bids */}
                    <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-brand-orange" />
                        <span>Guaranteed Refurbisher Buyback Offers</span>
                      </h3>
                      
                      <div className="space-y-3.5">
                        
                        {/* Partner 1 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-white font-display">Phoenix Renew LLC</span>
                            <div className="text-[10px] text-emerald-400 font-bold font-sans">PAID SHIPPING INCLUDED</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-bold text-white font-display">${finalResult.valuePreservedUsd} USD</div>
                              <div className="text-[9px] text-zinc-500 font-mono">Offer valid: 7 days</div>
                            </div>
                            <button 
                              onClick={() => setActionDone(true)}
                              className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              Accept Bid
                            </button>
                          </div>
                        </div>

                        {/* Partner 2 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-white font-display">Gazelle ReCommerce</span>
                            <div className="text-[10px] text-emerald-400 font-bold font-sans">PAID SHIPPING INCLUDED</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-bold text-white font-display">${Math.round(finalResult.valuePreservedUsd * 0.95)} USD</div>
                              <div className="text-[9px] text-zinc-500 font-mono">Offer valid: 3 days</div>
                            </div>
                            <button 
                              onClick={() => setActionDone(true)}
                              className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              Accept Bid
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* 4. RECYCLE PATHWAY */}
                {pathwayGroup === 'recycle' && (
                  <div className="space-y-6 animate-fade-in-up">
                    
                    {/* Authorized pick ups */}
                    <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                        <Calendar className="w-4.5 h-4.5 text-brand-orange" />
                        <span>Schedule Authorized E-waste Pickup</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase font-sans">Select Pickup Date</span>
                          <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-white/2.5 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => setActionDone(true)}
                          className="py-3 px-6 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer text-center"
                        >
                          Request Schedule Pickup
                        </button>
                      </div>
                    </div>

                    {/* Local recyclers map */}
                    <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-400 font-sans flex items-center space-x-2">
                        <Trash2 className="w-4 h-4 text-brand-orange" />
                        <span>Authorized Recyclers Nearby</span>
                      </h3>
                      
                      <div className="space-y-3.5">
                        
                        {/* Recycler 1 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <span className="text-sm font-bold text-white font-display">EcoRecycle Metals</span>
                            <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-sans">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                              <span>1.5 Miles away (Industrial Zone E)</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActionDone(true)}
                            className="py-2 px-4 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 rounded-xl transition-colors cursor-pointer"
                          >
                            Drop-off details
                          </button>
                        </div>

                        {/* Recycler 2 */}
                        <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <span className="text-sm font-bold text-white font-display">CleanEarth Metals Corp</span>
                            <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-sans">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                              <span>4.2 Miles away (Southeast Industrial Road)</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActionDone(true)}
                            className="py-2 px-4 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 rounded-xl transition-colors cursor-pointer"
                          >
                            Drop-off details
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>

          {/* Device metadata summary panel (4 cols) */}
          <div className="md:col-span-4 bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-400 font-sans">Diagnostic Metadata</h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-zinc-500">Device Model:</span>
                <span className="font-semibold text-white">{finalResult.brand} {finalResult.model}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-zinc-500">AI Pathway Recommendation:</span>
                <span className="font-bold text-brand-orange uppercase text-[10px]">{finalResult.recommendation}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-zinc-500">Health Score:</span>
                <span className="font-semibold text-white">{finalResult.deviceHealthScore}%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-zinc-500">CO2 Equivalent Savings:</span>
                <span className="font-bold text-emerald-400">-{finalResult.environmentalImpact.co2AvoidedKg} kg</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-white font-display flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                <span>Impact Assessment</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                By routing this device through circular pathways, you help avoid the emissions of mining new metals and manufacturing replacement models.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
