import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, 
  Smartphone, 
  UploadCloud, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  AlertCircle, 
  X, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import type { DeviceType } from '../types';

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  
  // Form State
  const [deviceType, setDeviceType] = useState<DeviceType>('laptop');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<'like-new' | 'good' | 'fair' | 'poor' | 'broken'>('fair');
  const [symptoms, setSymptoms] = useState('');
  
  // Media State
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  
  // UI Loading/Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  // Handle mock file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray].slice(0, 3)); // max 3 images
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  // Submit assessment and animate upload progress
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) {
      alert('Please fill out the Brand and Model fields.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate multi-stage upload progress
    const steps = [
      { progress: 20, label: 'Encrypting data payload...' },
      { progress: 50, label: 'Uploading visual image assets (MIME: image/png)...' },
      { progress: 75, label: 'Uploading system diagnostic video logs...' },
      { progress: 95, label: 'Finalizing hardware metadata registry...' },
      { progress: 100, label: 'Submission complete. Opening analysis chamber...' }
    ];

    for (const step of steps) {
      setProgressLabel(step.label);
      let current = uploadProgress;
      while (current < step.progress) {
        current += Math.min(5, step.progress - current);
        setUploadProgress(current);
        await new Promise(r => setTimeout(r, 60));
      }
    }

    try {
      const { id } = await api.submitAssessment({
        type: deviceType,
        brand,
        model,
        condition,
        symptoms
      });
      // Redirect to the Analysis page with the created device ID
      navigate(`/analysis?id=${id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-28 pb-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-orange uppercase font-sans">
            Device Intel Core
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight">
            Assess Your Device
          </h1>
          <p className="text-sm text-zinc-400 font-sans max-w-lg mx-auto">
            Provide specs and upload media files. The Phoenix intelligence network will analyze components and calculate repair viability.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Form Panel (8 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-8 bg-dark-card border border-white/5 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
            
            {/* 1. Device Type Toggle */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-400 font-sans">1. Select Device Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeviceType('laptop')}
                  className={`py-4 px-6 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    deviceType === 'laptop'
                      ? 'bg-brand-orange/15 border-brand-orange text-white'
                      : 'bg-white/2.5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <Laptop className="w-8 h-8" />
                  <span className="font-display font-bold text-sm">Laptop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceType('smartphone')}
                  className={`py-4 px-6 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    deviceType === 'smartphone'
                      ? 'bg-brand-orange/15 border-brand-orange text-white'
                      : 'bg-white/2.5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-8 h-8" />
                  <span className="font-display font-bold text-sm">Smartphone</span>
                </button>
              </div>
            </div>

            {/* 2. Device Details */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-zinc-400 font-sans">2. Device Specifications</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold font-sans">Brand</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Dell, Samsung"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white/2.5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-orange focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold font-sans">Model</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro M1, Galaxy S22"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-white/2.5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-orange focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Condition Level Slider/Selectors */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-400 font-sans flex items-center justify-between">
                <span>3. Operating Condition</span>
                <span className="text-xs font-bold text-brand-orange capitalize font-sans">{condition.replace('-', ' ')}</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['like-new', 'good', 'fair', 'poor', 'broken'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCondition(level)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold font-sans border transition-all ${
                      condition === level
                        ? 'bg-brand-orange/20 border-brand-orange text-white'
                        : 'bg-white/2.5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                    }`}
                  >
                    {level.split('-')[0].toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                {condition === 'like-new' && 'Like-New: Operates flawlessly, absolute zero scratch or structural wear.'}
                {condition === 'good' && 'Good: Fully operational, displays minor micro-scratches or soft signs of ownership.'}
                {condition === 'fair' && 'Fair: Fully operational, displays noticeable cosmetic scuffs or slightly degraded battery.'}
                {condition === 'poor' && 'Poor: Stiff keys, faded display backlight, heavily degraded battery, or deep scratches.'}
                {condition === 'broken' && 'Broken: Completely damaged panels, severe motherboard shorts, or expanded battery cells.'}
              </p>
            </div>

            {/* 4. Symptoms / Notes */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-400 font-sans">4. Defect Symptoms & Notes</label>
              <textarea
                placeholder="Describe screen flickers, button damage, system slowdown, liquid contact, etc."
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-white/2.5 border border-white/5 rounded-xl p-4 text-sm focus:border-brand-orange focus:outline-none transition-colors font-sans resize-none"
              />
            </div>

            {/* 5. Media Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Image Upload Zone */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-zinc-400 font-sans">Photos (Max 3)</span>
                <div className="border-2 border-dashed border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center bg-white/1.5 relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={images.length >= 3}
                  />
                  <UploadCloud className="w-7 h-7 text-zinc-500 group-hover:text-brand-orange transition-colors mb-2" />
                  <span className="text-xs text-zinc-400 font-semibold font-sans">Drop images here</span>
                  <span className="text-[10px] text-zinc-500 font-sans">or click to browse</span>
                </div>
              </div>

              {/* Video Upload Zone */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-zinc-400 font-sans">Walk-around Video</span>
                <div className="border-2 border-dashed border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center bg-white/1.5 relative cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={!!video}
                  />
                  <VideoIcon className="w-7 h-7 text-zinc-500 group-hover:text-brand-orange transition-colors mb-2" />
                  <span className="text-xs text-zinc-400 font-semibold font-sans">{video ? 'Video Loaded' : 'Drop video walk-around'}</span>
                  <span className="text-[10px] text-zinc-500 font-sans">{video ? video.name : 'or click to browse'}</span>
                </div>
              </div>

            </div>

            {/* Upload File Previews */}
            <AnimatePresence>
              {(images.length > 0 || video) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 border-t border-white/5 pt-6"
                >
                  <span className="text-xs font-semibold text-zinc-500 font-sans">Visual Evidence Queue</span>
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((_, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 h-16 flex items-center justify-center group">
                        <ImageIcon className="w-5 h-5 text-zinc-500" />
                        <span className="text-[9px] text-zinc-400 font-sans absolute bottom-1 px-1 text-center truncate w-full">Image {index+1}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {video && (
                      <div className="relative rounded-xl overflow-hidden border border-brand-orange/20 bg-zinc-900 h-16 flex items-center justify-center group">
                        <VideoIcon className="w-5 h-5 text-brand-orange" />
                        <span className="text-[9px] text-brand-orange font-semibold absolute bottom-1 px-1 text-center truncate w-full">Video Log</span>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action CTA */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white text-base font-bold rounded-xl shadow-lg shadow-brand-orange/15 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Payload...</span>
                  </>
                ) : (
                  <>
                    <span>Start AI Assessment</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Preview Panel (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Summary Preview Card */}
            <div className="bg-white/2.5 border border-white/5 rounded-3xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-zinc-400 font-sans">Assessment Preview</h3>
              
              <div className="flex items-center space-x-3 bg-white/2.5 rounded-xl p-3 border border-white/5">
                <div className="p-2.5 bg-brand-orange/10 rounded-lg">
                  {deviceType === 'laptop' ? <Laptop className="w-5 h-5 text-brand-orange" /> : <Smartphone className="w-5 h-5 text-brand-orange" />}
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-semibold font-sans">DEVICE CLASS</div>
                  <div className="text-sm font-bold capitalize font-display text-white">{deviceType}</div>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-sans">Brand:</span>
                  <span className="font-semibold text-white font-sans">{brand || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-sans">Model:</span>
                  <span className="font-semibold text-white font-sans">{model || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-sans">Condition:</span>
                  <span className="font-bold text-brand-orange uppercase font-sans text-[10px]">{condition.replace('-', ' ')}</span>
                </div>
              </div>

              {symptoms && (
                <div className="border-t border-white/5 pt-4">
                  <div className="text-[10px] text-zinc-500 font-semibold font-sans mb-1">NOTES & SYMPTOMS:</div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-white/5">
                    "{symptoms}"
                  </p>
                </div>
              )}
            </div>

            {/* Quick tips list */}
            <div className="bg-emerald-950/10 border border-emerald-900/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-emerald-500" />
                <h4 className="text-sm font-bold text-emerald-400 font-display">Assessment Tips</h4>
              </div>
              <ul className="text-xs text-zinc-400 space-y-2.5 font-sans leading-relaxed list-disc list-inside">
                <li>Capture pictures in bright, direct lighting to help our visual algorithm analyze frame integrity.</li>
                <li>Record visual proof of screen scratches, cracked case, or flickering display indicators.</li>
                <li>Describe accurate operating errors (e.g. system freezes or battery percentage drops) for repair analysis.</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Progress Overlay Modal */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-dark-card border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
              <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">Transmitting Payload</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{progressLabel}</p>
              </div>

              {/* Progress bar container */}
              <div className="space-y-1">
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-brand-orange h-full rounded-full transition-all duration-100" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-right text-xs text-zinc-500 font-bold font-sans">
                  {uploadProgress}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
