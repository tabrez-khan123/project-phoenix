import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-bg border-t border-white/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-brand-orange/10 border border-brand-orange/30">
                <Leaf className="w-4.5 h-4.5 text-brand-orange" />
                <Cpu className="absolute w-1.5 h-1.5 text-brand-orange/60 -bottom-0.5 -right-0.5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Phoenix
              </span>
            </Link>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              Every Device Deserves A Second Chance. A platform empowering lifecycle intelligence to end digital waste.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/assessment" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Device Assessment
                </Link>
              </li>
              <li>
                <Link to="/impact-ledger" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Global Ledger
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  About Phoenix
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Partner Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Pathways Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Pathways
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/assessment" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Device Refurbishing
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Authorized Repair
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Secure Donation
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-sm text-zinc-400 hover:text-brand-orange transition-colors">
                  Eco-Safe Recycling
                </Link>
              </li>
            </ul>
          </div>

          {/* Impact Stats / SDG Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Global Standards
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2 bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400">UN SDG 12: Responsible Consumption</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-950/20 border border-blue-800/30 rounded-lg p-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-blue-400">UN SDG 13: Climate Action</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-sans">
            &copy; {new Date().getFullYear()} Project Phoenix. All rights reserved. Built for sustainability.
          </p>
          <div className="flex space-x-6 text-xs text-zinc-500 font-sans">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300">E-Waste Pledge</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
