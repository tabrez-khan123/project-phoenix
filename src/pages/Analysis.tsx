import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { api } from '../services/api';

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'warn' | 'system';
}

export const Analysis: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const deviceId = searchParams.get('id') || '';
  
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<LogLine[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { name: 'Device Detection', desc: 'Confirming model & specifications' },
    { name: 'Damage Detection', desc: 'Scanning cosmetic & structural wear' },
    { name: 'Component Analysis', desc: 'Evaluating battery health & memory' },
    { name: 'Repairability Analysis', desc: 'Calculating diagnostic indices' },
    { name: 'Impact Analysis', desc: 'Estimating CO2 & materials offsets' }
  ];

  // Auto scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  useEffect(() => {
    if (!deviceId) {
      navigate('/assessment');
      return;
    }

    const assessmentInput = api.getCurrentAssessmentInput(deviceId);
    const brand = assessmentInput?.brand || 'Apple';
    const model = assessmentInput?.model || 'Device';
    const condition = assessmentInput?.condition || 'fair';
    const symptoms = assessmentInput?.symptoms || 'None reported';

    // Logs database for our pipeline simulation
    const logsData: Record<number, LogLine[]> = {
      0: [
        { text: 'SYSTEM: Booting Phoenix Diagnostic Intelligence Engine...', type: 'system' },
        { text: `SYSTEM: Fetching device metadata for assessment: ${deviceId}`, type: 'system' },
        { text: `INFO: Input specifications - Brand: ${brand}, Model: ${model}`, type: 'info' },
        { text: 'INFO: Decoding camera visual data streams...', type: 'info' },
        { text: `SUCCESS: Device matched in global catalog: Verified ${brand} ${model} form-factor`, type: 'success' },
        { text: 'INFO: Parsing diagnostic symptoms logs...', type: 'info' },
        { text: `INFO: Symptom profile: "${symptoms}"`, type: 'info' },
      ],
      1: [
        { text: 'INFO: Scanning chassis geometry for structural wear...', type: 'info' },
        { text: `INFO: Evaluating state: cosmetic profile designated as "${condition}"`, type: 'info' },
        { text: 'WARN: Minor chassis abrasion detected along corners', type: 'warn' },
        { text: 'INFO: Aligning panel cracks. Screen matrix refraction diagnostic active...', type: 'info' },
        { text: condition === 'broken' 
            ? 'WARN: Structural display failure detected. Digitizer matrix unresponsive.' 
            : 'SUCCESS: Display refraction check: Panel structurally solid, digitizer functional.', type: 'success' },
        { text: 'SUCCESS: Outer ports integrity checked. Connectors operational.', type: 'success' },
      ],
      2: [
        { text: 'INFO: Reading cycle health logs for internal battery cells...', type: 'info' },
        { text: condition === 'like-new' 
            ? 'SUCCESS: Battery capacity checks at 94% health. Cycles count: 120.' 
            : condition === 'good'
            ? 'INFO: Battery capacity checks at 84% health. Cycles count: 350.'
            : 'WARN: Battery capacity checks at 68% health. Cycles count: 520. Replacement advised.', type: 'warn' },
        { text: 'INFO: Testing memory modules and flash sectors...', type: 'info' },
        { text: 'INFO: Write-wear metric: 14% total TBW. Read/write velocities within parameters.', type: 'info' },
        { text: 'SUCCESS: Motherboard rails test completed. CPU cores report thermal balance.', type: 'success' },
      ],
      3: [
        { text: 'INFO: Launching Repairability index evaluation...', type: 'info' },
        { text: 'INFO: Matching parts availability inside local supply-chains...', type: 'info' },
        { text: 'INFO: Component structural adhesive rating: 6/10 (moderate difficulty)', type: 'info' },
        { text: condition === 'broken'
            ? 'INFO: Estimated repair cost exceeds 75% of residual value. Alternate pathways prioritized.'
            : 'INFO: Estimated repair cost lies within 25% of market value. Viable lifecycle preservation path active.', type: 'info' },
        { text: 'SUCCESS: Repair Index score logged successfully.', type: 'success' },
      ],
      4: [
        { text: 'INFO: Accessing Scope 3 GHG carbon coefficients registry...', type: 'info' },
        { text: 'INFO: Running lifecycle assessment: mining, raw processing, logistics components...', type: 'info' },
        { text: 'INFO: Simulating material reclamation potential (gold, copper, aluminum, cobalt)...', type: 'info' },
        { text: 'SUCCESS: Environmental LCA index compiled.', type: 'success' },
        { text: 'SYSTEM: Pipeline compilation completed. Releasing outcome lock...', type: 'system' }
      ]
    };

    // Run the pipeline step-by-step
    let currentStep = 0;
    let logIndex = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

    const runPipeline = () => {
      if (currentStep >= steps.length) {
        setIsFinished(true);
        // Automatic redirection after a short delay (2 seconds)
        const redirectTimeout = setTimeout(() => {
          navigate(`/results?id=${deviceId}`);
        }, 2000);
        return () => clearTimeout(redirectTimeout);
      }

      setActiveStep(currentStep);
      const stepLogs = logsData[currentStep] || [];
      logIndex = 0;

      intervalId = setInterval(() => {
        if (logIndex < stepLogs.length) {
          setConsoleLogs(prev => [...prev, stepLogs[logIndex]]);
          logIndex++;
        } else {
          if (intervalId) clearInterval(intervalId);
          setCompletedSteps(prev => [...prev, currentStep]);
          currentStep++;
          setTimeout(runPipeline, 500); // Small pause before starting the next step
        }
      }, 250); // Speed of typewriter console log line additions
    };

    runPipeline();

    return () => {
      clearInterval(intervalId);
    };
  }, [deviceId, navigate]);

  const handleSkip = () => {
    navigate(`/results?id=${deviceId}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col justify-center space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
            Diagnostic Chamber
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
            AI Analysis Chamber
          </h1>
          <p className="text-sm text-zinc-400 font-sans max-w-lg mx-auto">
            Phoenix is conducting a deep-level assessment scan of your hardware specs, parts decay, and lifecycle recovery impact.
          </p>
        </div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Steps list (5 cols) */}
          <div className="md:col-span-5 bg-white/2.5 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase font-sans">Pipeline Milestones</h3>
              
              <div className="space-y-5">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isCompleted = completedSteps.includes(idx);
                  
                  return (
                    <div 
                      key={idx}
                      className={`flex items-start space-x-4 p-3 rounded-2xl border transition-all duration-300 ${
                        isActive 
                          ? 'bg-brand-orange/10 border-brand-orange' 
                          : isCompleted 
                          ? 'bg-white/2 bg-white/1 shadow-inner border-white/5' 
                          : 'border-transparent opacity-40'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-500 font-bold font-sans">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-bold font-display ${isActive || isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                          {step.name}
                        </h4>
                        <p className="text-xs text-zinc-400 font-sans leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skip Option */}
            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={handleSkip}
                className="w-full py-3 border border-white/10 hover:border-brand-orange rounded-xl text-xs font-bold font-sans tracking-wide hover:bg-brand-orange/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Skip Diagnostic Sequence</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Typewriter Terminal Console (7 cols) */}
          <div className="md:col-span-7 bg-zinc-950/80 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[480px] shadow-2xl relative">
            {/* Terminal Header */}
            <div className="bg-zinc-900 px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[10px] font-semibold text-zinc-500 font-mono tracking-widest pl-4">PHOENIX_CORE_ANALYSIS</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                <span className="text-[9px] font-bold text-brand-orange uppercase tracking-wider font-sans">Live Diagnostic</span>
              </div>
            </div>

            {/* Terminal Body / Logs */}
            <div className="p-6 overflow-y-auto flex-grow font-mono text-xs space-y-3 custom-scrollbar bg-black/40">
              {consoleLogs.map((log, index) => {
                let colorClass = 'text-zinc-400';
                let prefix = '> ';

                if (log.type === 'system') {
                  colorClass = 'text-brand-orange font-semibold';
                  prefix = ':: ';
                } else if (log.type === 'success') {
                  colorClass = 'text-emerald-400 font-semibold';
                  prefix = '✓ ';
                } else if (log.type === 'warn') {
                  colorClass = 'text-amber-400 font-semibold';
                  prefix = '⚠ ';
                }

                return (
                  <div key={index} className="leading-relaxed flex items-start space-x-2">
                    <span className="text-zinc-600 select-none">{prefix}</span>
                    <span className={colorClass}>{log.text}</span>
                  </div>
                );
              })}
              {/* Typewriter Cursor */}
              {!isFinished && (
                <div className="flex items-center space-x-1 text-zinc-500">
                  <span className="text-zinc-600 select-none">&gt;</span>
                  <span className="w-1.5 h-4 bg-brand-orange animate-pulse" />
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

      </div>

      {/* Finished Button Overlay */}
      {isFinished && (
        <div className="relative z-10 text-center py-4 bg-zinc-950/80 border-t border-white/5 animate-fade-in-up">
          <button
            onClick={handleSkip}
            className="px-8 py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold rounded-full shadow-lg shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span>Access Assessment Report</span>
            <Play className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
