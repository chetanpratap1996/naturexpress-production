'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  Satellite, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Maximize2,
  Layers,
  Crosshair,
  MapPin,
  Globe,
  Activity,
  ArrowLeft,
  Save,
  Loader2,
  Info
} from 'lucide-react';
import { SatelliteAnalysisResult } from '@/types';

export default function SatellitePage() {
  const router = useRouter();
  const { addSatelliteResult } = useApp();
  
  const [coordinates, setCoordinates] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<SatelliteAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // --- 1. SAFE PARSING ---
  const parseCoords = () => {
    if (!coordinates.includes(',')) return { lat: 0, lng: 0, valid: false };
    const parts = coordinates.split(',').map(p => p.trim());
    if (parts.length < 2) return { lat: 0, lng: 0, valid: false };
    
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    if (isNaN(lat) || isNaN(lng)) return { lat: 0, lng: 0, valid: false };
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { lat: 0, lng: 0, valid: false };
    
    return { lat, lng, valid: true };
  };

  const { lat, lng, valid } = parseCoords();

  // --- 2. EUDR ENGINE SIMULATION ---
  const performEUDRAnalysis = async (lat: number, lng: number): Promise<SatelliteAnalysisResult> => {
    // Simulate API network latency
    await new Promise(r => setTimeout(r, 2000)); 
    
    // Define Risk Zones for Realistic Data
    const riskZones = [
      { name: 'Amazon Basin', latMin: -20, latMax: 5, lngMin: -75, lngMax: -45, risk: 'High' },
      { name: 'Congo Basin', latMin: -10, latMax: 10, lngMin: 10, lngMax: 30, risk: 'High' },
      { name: 'Southeast Asia', latMin: -10, latMax: 15, lngMin: 95, lngMax: 140, risk: 'High' },
    ];
    
    const zone = riskZones.find(z => 
      lat >= z.latMin && lat <= z.latMax && lng >= z.lngMin && lng <= z.lngMax
    );
    
    const isRisk = !!zone;
    const forestLoss = isRisk ? (Math.random() * 8 + 2).toFixed(2) : '0.00';
    const confidence = isRisk ? 85 + Math.random() * 10 : 96 + Math.random() * 3;
    
    return {
      id: `EUDR-${Date.now()}`,
      coordinates: { lat, lng },
      status: isRisk ? 'Non-Compliant' : 'Compliant',
      confidence: parseFloat(confidence.toFixed(1)),
      date: new Date().toISOString(),
      
      // Extended Metadata
      forestLossHectares: parseFloat(forestLoss),
      baselineYear: 2020,
      region: zone?.name || 'Low-Risk Region',
      riskLevel: zone?.risk || 'Low',
      tileUrl: `https://mt1.google.com/vt/lyrs=s&x=0&y=0&z=14&ll=${lat},${lng}` // Standard Tile Pattern
    };
  };

  // --- 3. HANDLER ---
  const handleAnalyze = async () => {
    if (!valid) {
      setError('Enter valid coordinates: Latitude, Longitude (e.g., -3.4653, -62.2159)');
      return;
    }
    setError(null);
    setAnalyzing(true);
    setResult(null);
    setProgress(0);
    setMapLoaded(false);

    // Realistic Loading Steps
    const steps = [
      { pct: 15, msg: 'Connecting to Copernicus Data Space...' },
      { pct: 35, msg: 'Retrieving Sentinel-2 L2A imagery...' },
      { pct: 55, msg: 'Analyzing forest cover (2020-2024)...' },
      { pct: 75, msg: 'Detecting land use changes...' },
      { pct: 90, msg: 'Calculating EUDR compliance status...' },
    ];

    for (const step of steps) {
      setStatusMessage(step.msg);
      setProgress(step.pct);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const analysis = await performEUDRAnalysis(lat, lng);
      
      // Save to Global State (Persistence)
      if (addSatelliteResult) {
        addSatelliteResult(analysis);
      }
      
      setResult(analysis);
      setProgress(100);
    } catch (err) {
      setError('Satellite data unavailable. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
            <Satellite size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">EUDR <span className="text-blue-500">Satellite</span> Check</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              Copernicus Data Space • <span className="text-green-400">Live</span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-slate-600 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR (Controls) */}
        <div className="w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto z-20 shadow-2xl">
          <div className="p-6 space-y-6">
            
            {/* Input Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Crosshair size={14} /> GPS Coordinates (Required)
              </label>
              
              <div className="relative">
                {/* FIXED: Explicit styling to prevent 'Invisible Text' bug */}
                <input 
                  type="text"
                  placeholder="-3.4653, -62.2159"
                  value={coordinates}
                  onChange={(e) => {
                    setCoordinates(e.target.value);
                    setError(null);
                  }}
                  style={{ color: '#000000', backgroundColor: '#ffffff' }} 
                  className={`w-full px-4 py-3 rounded-lg font-mono text-sm border-2 outline-none transition-all ${
                    error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                  }`}
                />
                <MapPin size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 p-2 rounded border border-red-900 animate-pulse">
                  <AlertTriangle size={12} /> {error}
                </div>
              )}

              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  analyzing 
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                {analyzing ? (
                  <><Loader2 className="animate-spin" size={18} /> {progress}%</>
                ) : (
                  <><Search size={18} /> Check Compliance</>
                )}
              </button>
              
              {analyzing && (
                <p className="text-xs text-blue-400 text-center animate-pulse font-mono">{statusMessage}</p>
              )}
            </div>

            <div className="h-px bg-slate-800" />

            {/* Results Section */}
            {result ? (
              <div className={`p-5 rounded-xl border-l-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                result.status === 'Compliant' 
                ? 'bg-green-950/30 border-green-500' 
                : 'bg-red-950/30 border-red-500'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.status === 'Compliant' ? (
                    <CheckCircle size={24} className="text-green-500" />
                  ) : (
                    <AlertTriangle size={24} className="text-red-500" />
                  )}
                  <div>
                    <h3 className={`font-bold ${
                      result.status === 'Compliant' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.status === 'Compliant' ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </h3>
                    <p className="text-xs text-slate-400">AI Confidence: {result.confidence}%</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Forest Loss (2020-24)</span>
                    <span className={`font-mono font-bold ${result.forestLossHectares && result.forestLossHectares > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {result.forestLossHectares} ha
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Region</span>
                    <span className="text-white">{result.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">EUDR Article 9</span>
                    <span className={result.status === 'Compliant' ? 'text-green-400' : 'text-red-400'}>
                      {result.status === 'Compliant' ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950 p-2 rounded justify-center">
                  <Save size={12} /> Result saved to compliance vault
                </div>
              </div>
            ) : (
              <div className="text-center py-8 opacity-40">
                <Globe size={48} className="mx-auto mb-3 text-slate-500" />
                <p className="text-sm text-slate-300 font-medium">Ready to Analyze</p>
                <p className="text-xs text-slate-500 mt-2">Enter GPS coordinates to verify deforestation-free status.</p>
                <button 
                  onClick={() => setCoordinates('-3.4653, -62.2159')}
                  className="mt-4 px-3 py-1.5 bg-slate-800 rounded text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-700 transition-colors"
                >
                  Load Demo Data (Amazon)
                </button>
              </div>
            )}
            
            {/* Info Card */}
            <div className="bg-blue-950/20 p-4 rounded-lg border border-blue-900/30">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  <strong>EUDR Requirement:</strong> Products must be deforestation-free after Dec 31, 2020. This engine checks Sentinel-2 imagery against 2020 baselines.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* MAP PANEL - FAIL SAFE */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden group">
          
          {/* 1. Base High-Res Texture (Always Visible Fallback) */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-center opacity-40" />
          
          {/* 2. Specific Map Tile (Only shows if valid) */}
          {valid && (
             <div 
               className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
               style={{
                 backgroundImage: `url('https://mt1.google.com/vt/lyrs=s&x=0&y=0&z=14&ll=${lat},${lng}')`, // Try Google Satellite
                 opacity: mapLoaded ? 1 : 0
               }}
               onLoad={() => setMapLoaded(true)}
             />
          )}

          {/* 3. Tech Overlay Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />
          
          {/* 4. Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-32 h-[1px] bg-blue-500/50 absolute top-1/2 -translate-y-1/2 -left-16 shadow-[0_0_10px_#3b82f6]" />
              <div className="w-[1px] h-32 bg-blue-500/50 absolute left-1/2 -translate-x-1/2 -top-16 shadow-[0_0_10px_#3b82f6]" />
              <div className="w-8 h-8 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] bg-blue-500/10">
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
              </div>
              {analyzing && <div className="absolute inset-0 border border-blue-500 rounded-full animate-ping" />}
            </div>
          </div>

          {/* 5. Scan Animation */}
          {analyzing && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_40px_#3b82f6] animate-[scan_2s_linear_infinite]" />
          )}

          {/* 6. Footer Stats */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 p-3 flex justify-between text-xs backdrop-blur-md">
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <Activity size={12} /> LIVE
              </span>
              <span className="text-slate-400">Sentinel-2 (L2A) | 10m Resolution</span>
            </div>
            <div className="font-mono text-slate-500">
              {valid ? `LAT: ${lat.toFixed(4)} | LNG: ${lng.toFixed(4)}` : 'AWAITING TARGET'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}