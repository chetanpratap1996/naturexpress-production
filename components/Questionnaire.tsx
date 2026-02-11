'use client';

import React, { useState } from 'react';
import { ExporterFormData } from '@/types';
import { ChevronRight, Leaf, MapPin, Factory, AlertCircle, Globe, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import GeolocationMap from '@/components/GeolocationMap';

interface Props {
  onComplete: (data: ExporterFormData) => void;
}

// Product types covered by EUDR
const PRODUCT_TYPES = [
  'Coffee',
  'Cocoa',
  'Wood',
  'Palm Oil',
  'Rubber',
  'Leather',
  'Furniture',
  'Other',
];

// High-risk countries for deforestation
const COUNTRIES = [
  'Brazil',
  'Indonesia',
  'Malaysia',
  'Vietnam',
  'Thailand',
  'Ivory Coast',
  'Ghana',
  'Colombia',
  'Peru',
  'Honduras',
  'India',
  'Ethiopia',
  'Ecuador',
  'Costa Rica',
  'Uganda',
  'Nigeria',
  'Cameroon',
  'Papua New Guinea',
  'Argentina',
  'Paraguay',
  'Bolivia',
  'Myanmar',
  'Laos',
  'Cambodia',
  'Other',
];

const HIGH_RISK_COUNTRIES = [
  'Brazil',
  'Indonesia',
  'Malaysia',
  'Colombia',
  'Peru',
  'Bolivia',
  'Paraguay',
  'Nigeria',
  'Cameroon',
  'Ghana',
  'Papua New Guinea',
];

const Questionnaire: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plotSize, setPlotSize] = useState<'Small' | 'Large'>('Small');
  
  const [formData, setFormData] = useState<ExporterFormData>({
    companyName: '',
    exportCountry: 'Brazil',
    productType: 'Coffee',
    annualVolume: '',
    hasSupplierList: false,
    hasGPSData: false,
    hasLandRecords: false,
    hasThirdPartyCert: false,
    geolocationData: '',
    supplierCount: 0,
    certificationBody: '',
    deforestationRiskRegion: false,
    supplyChainComplexity: 'Moderate',
    traceabilitySystem: 'None',
  });

  const handleChange = <K extends keyof ExporterFormData>(
    field: K,
    value: ExporterFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);

    // Auto-detect high-risk region
    if (field === 'exportCountry') {
      const isHighRisk = HIGH_RISK_COUNTRIES.includes(value as string);
      setFormData((prev) => ({ ...prev, deforestationRiskRegion: isHighRisk }));
    }
  };

  const nextStep = () => {
    // Validation before moving to next step
    if (step === 1) {
      if (!formData.companyName.trim()) {
        setError('Please enter your company name');
        return;
      }
      if (!formData.annualVolume) {
        setError('Please select annual export volume');
        return;
      }
    }

    if (step === 2) {
      if (formData.hasSupplierList && (!formData.supplierCount || formData.supplierCount === 0)) {
        setError('Please specify the number of suppliers');
        return;
      }
    }

    setIsTransitioning(true);
    setStep((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
    setError(null);
  };

  const prevStep = () => {
    setIsTransitioning(true);
    setStep((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
    setError(null);
  };

  const validateGeolocation = (data: string): boolean => {
    if (!data.trim()) {
      setError('Please enter GPS coordinates');
      return false;
    }

    if (plotSize === 'Small') {
      // Validate "Lat, Long" format
      const coordMatch = data.match(/-?\d+(\.\d+)?/g);
      if (!coordMatch || coordMatch.length < 2) {
        setError('Invalid format. Expected: "Latitude, Longitude" (e.g., 12.34, 56.78)');
        return false;
      }

      const lat = parseFloat(coordMatch[0]);
      const lng = parseFloat(coordMatch[1]);

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Coordinates out of range. Lat: -90 to 90, Lng: -180 to 180');
        return false;
      }
    } else {
      // Validate GeoJSON
      try {
        const json = JSON.parse(data);
        if (!json.type || !json.coordinates) {
          setError('Invalid GeoJSON. Must include "type" and "coordinates"');
          return false;
        }
      } catch (e) {
        setError('Invalid JSON syntax. Please check your GeoJSON format');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTransitioning) return;

    // Final validation
    if (step === 3) {
      if (formData.hasGPSData && !validateGeolocation(formData.geolocationData || '')) {
        return;
      }
    }

    onComplete(formData);
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <Leaf size={16} />
            EUDR Compliance Assessment
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Readiness Audit
          </h2>
          <p className="text-gray-600">
            Benchmark your export operation against EU Regulation 2023/1115
          </p>

          {/* Progress Bar */}
          <div className="mt-6 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900">Validation Error</p>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Company & Product Info */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Factory className="text-green-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Company Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Company/Operator Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter your registered business name"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Commodity Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRODUCT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleChange('productType', type)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                          formData.productType === type
                            ? 'border-green-600 bg-green-50 text-green-700 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Country of Origin *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-4 text-gray-400" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none appearance-none transition-all"
                      value={formData.exportCountry}
                      onChange={(e) => handleChange('exportCountry', e.target.value)}
                    >
                      {COUNTRIES.sort().map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.deforestationRiskRegion && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={14} />
                      <span className="font-medium">
                        This country is flagged as high deforestation risk
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Annual Export Volume *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    value={formData.annualVolume}
                    onChange={(e) => handleChange('annualVolume', e.target.value)}
                  >
                    <option value="">Select volume range</option>
                    <option value="< 50 tons">Less than 50 tons</option>
                    <option value="50-500 tons">50 - 500 tons</option>
                    <option value="500-2000 tons">500 - 2,000 tons</option>
                    <option value="> 2000 tons">Over 2,000 tons</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Supply Chain Traceability */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Supply Chain Traceability
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Supply Chain Complexity *
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        val: 'Simple' as const,
                        label: 'Simple',
                        desc: 'Direct sourcing from known farms/producers',
                      },
                      {
                        val: 'Moderate' as const,
                        label: 'Moderate',
                        desc: 'Mix of direct and cooperative/aggregator sourcing',
                      },
                      {
                        val: 'Complex' as const,
                        label: 'Complex',
                        desc: 'Multiple intermediaries, mixed origin batches',
                      },
                    ].map((opt) => (
                      <div
                        key={opt.val}
                        onClick={() => handleChange('supplyChainComplexity', opt.val)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.supplyChainComplexity === opt.val
                            ? 'border-green-600 bg-green-50 shadow-sm'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.supplyChainComplexity === opt.val
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {formData.supplyChainComplexity === opt.val && (
                              <CheckCircle size={12} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-5 rounded-xl border-2 transition-all ${
                  formData.hasSupplierList ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="supplier-list"
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={formData.hasSupplierList}
                      onChange={(e) => handleChange('hasSupplierList', e.target.checked)}
                    />
                    <label
                      htmlFor="supplier-list"
                      className="font-bold text-gray-900 cursor-pointer"
                    >
                      I have a documented supplier list
                    </label>
                  </div>
                  {formData.hasSupplierList && (
                    <div className="mt-4 animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Suppliers
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 25"
                        value={formData.supplierCount || ''}
                        onChange={(e) =>
                          handleChange('supplierCount', parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Traceability System *
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    value={formData.traceabilitySystem}
                    onChange={(e) =>
                      handleChange(
                        'traceabilitySystem',
                        e.target.value as 'None' | 'Basic' | 'Advanced'
                      )
                    }
                  >
                    <option value="None">No system in place</option>
                    <option value="Basic">Basic (Paper records, spreadsheets)</option>
                    <option value="Advanced">
                      Advanced (Digital platform, blockchain, etc.)
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Documentation & GPS Data */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="text-purple-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Documentation & Geolocation
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    formData.hasLandRecords ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="land-records"
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={formData.hasLandRecords}
                        onChange={(e) => handleChange('hasLandRecords', e.target.checked)}
                      />
                      <label htmlFor="land-records" className="font-medium text-gray-900 cursor-pointer flex-1">
                        Land ownership/lease documents available
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    formData.hasThirdPartyCert ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        id="cert"
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={formData.hasThirdPartyCert}
                        onChange={(e) => handleChange('hasThirdPartyCert', e.target.checked)}
                      />
                      <label htmlFor="cert" className="font-medium text-gray-900 cursor-pointer flex-1">
                        Third-party certification (FSC, Rainforest Alliance, etc.)
                      </label>
                    </div>
                    {formData.hasThirdPartyCert && (
                      <div className="mt-3 ml-8 animate-fade-in">
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                          placeholder="Certification body name"
                          value={formData.certificationBody || ''}
                          onChange={(e) => handleChange('certificationBody', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t-2 border-gray-100 pt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Plot/Farm Size
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlotSize('Small')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        plotSize === 'Small'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-bold text-gray-900">Small Plot</p>
                      <p className="text-xs text-gray-600 mt-1">&lt; 4 hectares</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlotSize('Large')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        plotSize === 'Large'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-bold text-gray-900">Large Plot</p>
                      <p className="text-xs text-gray-600 mt-1">&gt; 4 hectares</p>
                    </button>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border-2 transition-all ${
                  formData.hasGPSData ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="gps-data"
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={formData.hasGPSData}
                      onChange={(e) => handleChange('hasGPSData', e.target.checked)}
                    />
                    <label htmlFor="gps-data" className="font-bold text-gray-900 cursor-pointer">
                      GPS/Geolocation Data Available
                    </label>
                  </div>

                  {formData.hasGPSData && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          {plotSize === 'Small'
                            ? 'Enter coordinates (Latitude, Longitude)'
                            : 'Paste GeoJSON polygon data'}
                        </label>
                        <textarea
                          rows={4}
                          className="w-full p-3 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder={
                            plotSize === 'Small'
                              ? '12.9716, 77.5946'
                              : '{"type":"Polygon","coordinates":[[[...]]]}'
                          }
                          value={formData.geolocationData}
                          onChange={(e) => handleChange('geolocationData', e.target.value)}
                        />
                      </div>

                      {formData.geolocationData && (
                        <GeolocationMap
                          data={formData.geolocationData}
                          plotSize={plotSize}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isTransitioning}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
              
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isTransitioning}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-xl hover:from-green-700 hover:to-green-800 shadow-xl shadow-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isTransitioning}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-xl hover:from-green-700 hover:to-green-800 shadow-xl shadow-green-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Complete Assessment
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This assessment typically takes 5-7 minutes to complete.
            <br />
            All data is stored locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;