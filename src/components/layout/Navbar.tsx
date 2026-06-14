import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, Leaf } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-dark-bg/85 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/10' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/30 group-hover:border-brand-orange transition-colors">
              <Leaf className="w-5 h-5 text-brand-orange group-hover:rotate-6 transition-transform duration-300" />
              <Cpu className="absolute w-2 h-2 text-brand-orange/60 -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-brand-orange transition-colors">
              Phoenix
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-sans font-medium text-sm transition-colors ${
                isActive('/') ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/assessment" 
              className={`font-sans font-medium text-sm transition-colors ${
                isActive('/assessment') ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Assess Device
            </Link>
            <Link 
              to="/impact-ledger" 
              className={`font-sans font-medium text-sm transition-colors ${
                isActive('/impact-ledger') ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Global Ledger
            </Link>
            <Link 
              to="/about" 
              className={`font-sans font-medium text-sm transition-colors ${
                isActive('/about') ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
              }`}
            >
              About
            </Link>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-5 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
              Log In
            </button>
            <Link 
              to="/assessment" 
              className="px-5 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              Assess Your Device
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100 border-b border-white/5 bg-dark-bg/95 backdrop-blur-lg' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-3 rounded-lg text-base font-semibold ${
              isActive('/') ? 'text-brand-orange bg-brand-orange/5' : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/assessment"
            className={`block px-3 py-3 rounded-lg text-base font-semibold ${
              isActive('/assessment') ? 'text-brand-orange bg-brand-orange/5' : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Assess Device
          </Link>
          <Link
            to="/impact-ledger"
            className={`block px-3 py-3 rounded-lg text-base font-semibold ${
              isActive('/impact-ledger') ? 'text-brand-orange bg-brand-orange/5' : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Global Ledger
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-3 rounded-lg text-base font-semibold ${
              isActive('/about') ? 'text-brand-orange bg-brand-orange/5' : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            About
          </Link>
          <div className="pt-4 pb-2 border-t border-white/5 px-3 flex flex-col space-y-3">
            <button className="w-full py-2.5 text-center text-sm font-semibold text-zinc-300 hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
              Log In
            </button>
            <Link
              to="/assessment"
              className="w-full py-3 text-center bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold rounded-xl transition-all"
            >
              Assess Your Device
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
