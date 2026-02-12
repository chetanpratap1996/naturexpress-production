'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  ShieldCheck, 
  Satellite, 
  FileText,
  TrendingUp,
  LayoutGrid,
  Menu,
  X,
  Leaf // <--- ADDED THIS MISSING IMPORT
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { login } = useApp();
  
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !company) return;
    
    setLoading(true);
    // Simulate secure auth handshake
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    login(email, company);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img 
              src="https://naturexpress.in/wp-content/uploads/2025/07/Untitled-design-12-1.png" 
              alt="NatureXpress Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#platform" className="hover:text-green-700 transition-colors">Platform</a>
            <a href="#compliance" className="hover:text-green-700 transition-colors">EUDR Compliance</a>
            <a href="#pricing" className="hover:text-green-700 transition-colors">Enterprise</a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-bold text-slate-900 hover:text-green-700">Log In</button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Book Demo
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl">
            <a href="#" className="text-lg font-semibold text-slate-800">Platform</a>
            <a href="#" className="text-lg font-semibold text-slate-800">Solutions</a>
            <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Get Started</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 overflow-hidden lg:pt-48 lg:pb-32">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: Value Proposition */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Globe size={12} className="text-green-600" />
              EU Deforestation Regulation (EUDR) Ready
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              The Operating System for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-teal-500">
                Sustainable Trade.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              NatureXpress provides the digital infrastructure to map supply chains, verify land via satellite, and generate EU-compliant Due Diligence Statements instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
                <Satellite size={18} className="text-blue-600" /> Satellite Verification
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
                <ShieldCheck size={18} className="text-green-600" /> Risk Analysis
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
                <FileText size={18} className="text-purple-600" /> DDS Generation
              </div>
            </div>
          </div>

          {/* Right: Login Card (Glassmorphism) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-200 to-blue-200 rounded-[2rem] transform rotate-2 blur-sm opacity-60"></div>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/50 relative">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Access Platform</h3>
                <p className="text-slate-500 mt-1">Secure login for exporters & traders.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Organic Exports Ltd."
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium text-slate-900"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Business Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@company.com"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium text-slate-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-green-900/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Connecting...</span>
                  ) : (
                    <>Launch Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  By logging in, you agree to our <a href="#" className="underline hover:text-slate-600">Terms</a> and <a href="#" className="underline hover:text-slate-600">GDPR Policy</a>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- LOGO STRIP --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by sustainable brands worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Logos for Professional Look */}
            <div className="text-xl font-black text-slate-800">AGRO<span className="text-green-600">CORP</span></div>
            <div className="text-xl font-bold text-slate-800 flex items-center gap-1"><Globe size={24}/> GLOBAL<span className="font-light">TRADE</span></div>
            <div className="text-xl font-serif font-bold text-slate-800 italic">EcoBean</div>
            <div className="text-xl font-bold text-slate-800 flex items-center gap-1"><Leaf size={24}/> GreenChain</div>
            <div className="text-xl font-mono font-bold text-slate-800">PURE<span className="text-green-600">SOURCE</span></div>
          </div>
        </div>
      </section>

      {/* --- FEATURE BENTO GRID --- */}
      <section id="platform" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Complete EUDR Compliance Suite</h2>
            <p className="text-lg text-slate-600">Eliminate the risk of non-compliance. Our platform unifies geolocation data, risk assessments, and documentation into a single workflow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-green-200 transition-colors group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Satellite size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">OrbitalView™ Engine</h3>
              <p className="text-slate-600 leading-relaxed">
                Check deforestation status using real-time Sentinel-2 imagery. Verify plot history back to the 2020 cutoff date with 99% accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-purple-200 transition-colors group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <LayoutGrid size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Supply Chain Mapping</h3>
              <p className="text-slate-600 leading-relaxed">
                Trace commodities from the exact plot of land to the final shipment. Manage thousands of suppliers and polygons effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-green-200 transition-colors group">
              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Auto-Generate DDS</h3>
              <p className="text-slate-600 leading-relaxed">
                One-click generation of Due Diligence Statements (DDS) ready for submission to the EU Traces system. Reduce manual paperwork by 90%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518173946687-a4c88928d9f3?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-extrabold text-green-400 mb-2">2M+</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hectares Monitored</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-blue-400 mb-2">50k+</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Polygons Verified</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-purple-400 mb-2">100%</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Audit Success Rate</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-yellow-400 mb-2">Article 9</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Full Compliance</div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <img 
              src="https://naturexpress.in/wp-content/uploads/2025/07/Untitled-design-12-1.png" 
              alt="NatureXpress Logo" 
              className="h-10 w-auto mb-6"
            />
            <p className="text-slate-500 max-w-sm">
              NatureXpress is the leading compliance platform for sustainable supply chains. We help businesses meet EUDR requirements with technology-first solutions.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-green-700">Features</a></li>
              <li><a href="#" className="hover:text-green-700">Satellite API</a></li>
              <li><a href="#" className="hover:text-green-700">Pricing</a></li>
              <li><a href="#" className="hover:text-green-700">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li><a href="/privacy" className="hover:text-green-700">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-green-700">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-700">Security</a></li>
              <li><a href="#" className="hover:text-green-700">EUDR Guide</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © 2024 NatureXpress Technologies. All rights reserved.
          </div>
          <div className="flex gap-6">
            <TrendingUp size={20} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
            <Globe size={20} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
          </div>
        </div>
      </footer>

    </div>
  );
}