'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Sprout, 
  MapPin, 
  FileCheck,
  ShieldAlert,
  Leaf
} from 'lucide-react';
import { ExporterFormData, ComplianceResult, RiskLevel } from '@/types';

// --- INITIAL STATE ---
// This strictly matches your 'types/index.ts' ExporterFormData interface
const initialFormData: ExporterFormData = {
  companyName: '',
  exportCountry: 'India',
  productType: 'Coffee', 
  supplyChainType: 'Direct',
  supplierCount: 1, 
  
  // Geolocation & Traceability
  hasGPS: false,
  hasPolygons: false,
  traceabilitySystem: false,
  
  // Compliance Docs
  riskAssessmentConducted: false,
  deforestationFreeCert: false,
};

export default function AssessmentPage() {
  const router = useRouter();
  const { user, setCurrentAssessment } = useApp();
  
  // UI State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Fix for hydration mismatches
  
  // Initialize form with user data if available
  const [formData, setFormData] = useState<ExporterFormData>(initialFormData);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      setFormData(prev => ({ ...prev, companyName: user.companyName }));
    }
  }, [user]);

  // --- HANDLERS ---

  const handleChange = (field: keyof ExporterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  // --- EUDR SCORING ENGINE (Business Logic) ---
  // This calculates the score based on real EU regulations
  const calculateScore = (data: ExporterFormData): ComplianceResult => {
    let score = 0;
    const gaps: string[] = [];
    const recommendations: string[] = [];

    // 1. Geolocation (40 points) - MANDATORY for EUDR
    if (data.hasGPS) {
      score += 20;
    } else {
      gaps.push("Critical: Missing GPS coordinates for production plots");
      recommendations.push("Deploy field agents to collect latitude/longitude for all farms.");
    }
    
    if (data.hasPolygons) {
      score += 20;
    } else {
      // Polygons are required for plots > 4 hectares
      gaps.push("Missing geolocation polygons (Required for plots > 4 hectares)");
      recommendations.push("Map plot boundaries using GPS or satellite tools.");
    }

    // 2. Risk Assessment (20 points) - Article 10 Requirement
    if (data.riskAssessmentConducted) {
      score += 20;
    } else {
      gaps.push("Risk assessment not formally conducted");
      recommendations.push("Generate a formal Risk Assessment Report (Article 10 compliant).");
    }

    // 3. Documentation & Certification (20 points)
    if (data.deforestationFreeCert) {
      score += 20;
    } else {
      gaps.push("No deforestation-free certification");
      recommendations.push("Upload valid certifications (e.g., Rainforest Alliance, FSC, Organic).");
    }

    // 4. Traceability System (20 points) - Article 9 Requirement
    if (data.traceabilitySystem) {
      score += 20;
    } else {
      gaps.push("No digital traceability system in place");
      recommendations.push("Implement a digital ledger to track products from farm to export.");
    }

    // Determine Risk Level based on Score
    let riskLevel: RiskLevel = RiskLevel.High;
    if (score >= 80) riskLevel = RiskLevel.Low;
    else if (score >= 50) riskLevel = RiskLevel.Medium;

    return {
      score,
      riskLevel,
      missingGaps: gaps,
      recommendations: recommendations,
      estimatedTime: score > 80 ? 'Ready for Review' : score > 50 ? '2-4 Weeks' : '2-3 Months',
      timestamp: new Date().toISOString()
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // 1. Run the Scoring Engine
    const result = calculateScore(formData);
    
    // 2. Simulate AI Processing Delay (UX)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Save to Global State
    setCurrentAssessment(result, formData);
    
    // 4. Redirect to Results
    router.push('/results');
  };

  // Prevent hydration mismatch
  if (!isClient) return null;

  // --- RENDER UI ---

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Progress</span>
            <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              Step {step} / 3
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 px-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-green-700' : 'text-gray-400'}`}>Product Info</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-green-700' : 'text-gray-400'}`}>Supply Chain</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-green-700' : 'text-gray-400'}`}>Compliance Docs</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(22,163,74,0.4)]"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 transition-all">
          
          {/* STEP 1: PRODUCT DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
                  <Sprout size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Product & Origin</h2>
                  <p className="text-gray-500 mt-1">Tell us about the product you are exporting to the EU market.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Product Category (EUDR List)</label>
                <div className="relative">
                  <select 
                    value={formData.productType}
                    onChange={(e) => handleChange('productType', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white appearance-none cursor-pointer hover:border-green-400"
                  >
                    <option value="Coffee">☕ Coffee & Coffee Products</option>
                    <option value="Cocoa">🍫 Cocoa & Chocolate</option>
                    <option value="Wood">🪵 Wood & Timber</option>
                    <option value="Rubber">🚗 Rubber & Tires</option>
                    <option value="Soy">🌱 Soya & Soy Products</option>
                    <option value="Palm Oil">🌴 Palm Oil & Derivatives</option>
                    <option value="Cattle">🐄 Cattle & Beef</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Country of Production</label>
                  <input 
                    type="text"
                    value={formData.exportCountry}
                    onChange={(e) => handleChange('exportCountry', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="e.g. India, Brazil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Company Name</label>
                  <input 
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Your Company Ltd."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SUPPLY CHAIN & GEOLOCATION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shadow-sm border border-purple-100">
                  <MapPin size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Supply Chain Mapping</h2>
                  <p className="text-gray-500 mt-1">EUDR requires precise geolocation (GPS) of all production plots.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Sourcing Model</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleChange('supplyChainType', 'Direct')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      formData.supplyChainType === 'Direct' 
                      ? 'border-green-600 bg-green-50 ring-1 ring-green-600' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`font-bold ${formData.supplyChainType === 'Direct' ? 'text-green-800' : 'text-gray-900'}`}>Direct Sourcing</div>
                    <div className="text-xs text-gray-500 mt-1">Directly from farmers or cooperatives</div>
                  </button>
                  <button 
                    onClick={() => handleChange('supplyChainType', 'Indirect')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      formData.supplyChainType === 'Indirect' 
                      ? 'border-green-600 bg-green-50 ring-1 ring-green-600' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`font-bold ${formData.supplyChainType === 'Indirect' ? 'text-green-800' : 'text-gray-900'}`}>Indirect Sourcing</div>
                    <div className="text-xs text-gray-500 mt-1">From aggregators, traders, or auctions</div>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-orange-500"/> Geolocation Data Availability
                </label>
                <div className="space-y-4">
                  <label className="flex items-start cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                    <div className="relative flex items-center pt-1">
                      <input 
                        type="checkbox"
                        checked={formData.hasGPS}
                        onChange={(e) => handleChange('hasGPS', e.target.checked)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">We have GPS coordinates (Lat/Long)</span>
                      <p className="text-gray-500 mt-0.5">I have the GPS point for every farm in my supply chain.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start cursor-pointer group p-2 hover:bg-white rounded-lg transition-colors">
                    <div className="relative flex items-center pt-1">
                      <input 
                        type="checkbox"
                        checked={formData.hasPolygons}
                        onChange={(e) => handleChange('hasPolygons', e.target.checked)}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">We have Polygons (Maps)</span>
                      <p className="text-gray-500 mt-0.5">I have boundary maps for farms larger than 4 hectares.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLIANCE CHECK */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm border border-orange-100">
                  <FileCheck size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Readiness & Risk</h2>
                  <p className="text-gray-500 mt-1">Final check on your documentation and due diligence status.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg border-b border-gray-100 pb-2">Compliance Checklist</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-start p-3 hover:bg-green-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-green-100">
                      <input 
                        type="checkbox"
                        checked={formData.riskAssessmentConducted}
                        onChange={(e) => handleChange('riskAssessmentConducted', e.target.checked)}
                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div className="ml-3">
                        <span className="block text-gray-900 font-bold">Risk Assessment Report (Article 10)</span>
                        <span className="block text-sm text-gray-500 mt-1">I have formally analyzed and documented the risk of non-compliance.</span>
                      </div>
                    </label>

                    <label className="flex items-start p-3 hover:bg-green-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-green-100">
                      <input 
                        type="checkbox"
                        checked={formData.deforestationFreeCert}
                        onChange={(e) => handleChange('deforestationFreeCert', e.target.checked)}
                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div className="ml-3">
                        <span className="block text-gray-900 font-bold">Deforestation-Free Certification</span>
                        <span className="block text-sm text-gray-500 mt-1">I hold valid certs (e.g., Rainforest Alliance, FSC, Organic).</span>
                      </div>
                    </label>

                    <label className="flex items-start p-3 hover:bg-green-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-green-100">
                      <input 
                        type="checkbox"
                        checked={formData.traceabilitySystem}
                        onChange={(e) => handleChange('traceabilitySystem', e.target.checked)}
                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <div className="ml-3">
                        <span className="block text-gray-900 font-bold">Traceability System (Article 9)</span>
                        <span className="block text-sm text-gray-500 mt-1">I have a system to track products from harvest to export.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Note:</strong> By clicking "Analyze", our AI engine will compare your inputs against the <span className="underline">EU Deforestation Regulation (EUDR)</span> requirements to calculate your readiness score.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION FOOTER */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
            ) : (
              <div className="w-24"></div> 
            )}

            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transform"
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-xl hover:-translate-y-0.5 transform disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px] justify-center"
              >
                {loading ? (
                  <>
                    <Leaf className="animate-spin" size={20} /> Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Compliance <CheckCircle size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        
        </div>
      </main>
    </div>
  );
}