'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  FileText, 
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';
import { RiskLevel } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const { currentAssessment } = useApp();

  // Protect Route: Redirect if no assessment data exists
  useEffect(() => {
    if (!currentAssessment) {
      router.push('/assessment');
    }
  }, [currentAssessment, router]);

  if (!currentAssessment) return null;

  const { score, riskLevel, missingGaps, recommendations, estimatedTime } = currentAssessment;

  // Dynamic Styles based on Risk
  const getRiskColor = () => {
    switch (riskLevel) {
      case RiskLevel.Low: return 'text-green-600 bg-green-50 border-green-200';
      case RiskLevel.Medium: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case RiskLevel.High: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="font-bold text-xl text-gray-900">Assessment Results</div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Close & Return to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: SCORE CARD */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">EUDR Readiness</h2>
              
              {/* Circular Score Visual */}
              <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * score) / 100}
                    className={`${getScoreColor()} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-5xl font-extrabold ${getScoreColor()}`}>{score}</span>
                  <span className="text-xs text-gray-400 font-medium">/ 100</span>
                </div>
              </div>

              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 ${getRiskColor()}`}>
                {riskLevel} Risk
              </div>
              
              <p className="text-sm text-gray-500">
                Estimated time to full compliance: <strong className="text-gray-900">{estimatedTime}</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">Next Step</h3>
              <p className="text-sm text-blue-700 mb-4">
                {score >= 80 
                  ? "You are ready to generate your Due Diligence Statement." 
                  : "Address the critical gaps below to improve your score."}
              </p>
              <button 
                onClick={() => router.push('/documents')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <FileText size={18} /> 
                {score >= 80 ? 'Generate DDS' : 'View Templates'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED REPORT */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Recommendations Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Action Plan</h3>
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold">{recommendations.length} Steps</span>
              </div>
              <div className="divide-y divide-gray-100">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                    <div key={i} className="p-6 flex gap-4 hover:bg-gray-50 transition-colors">
                      <div className="shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{rec}</p>
                        <button className="text-xs text-blue-600 font-bold mt-2 hover:underline">View Guide →</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                    <p>No actions needed. You are fully compliant!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gaps Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Identified Gaps</h3>
              </div>
              <div className="p-6 space-y-4">
                {missingGaps.length > 0 ? (
                  missingGaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-800">
                      <XCircle size={20} className="shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{gap}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-800">
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">No critical gaps found. Great job!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-4">
              <button 
                onClick={() => router.push('/assessment')}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Retake Assessment
              </button>
              <button className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                <Download size={18} /> Download Report
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}