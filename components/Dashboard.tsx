'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile, RiskLevel, Supplier } from '@/types';
import { Plus, FileText, TrendingUp, AlertTriangle, Satellite, ArrowUpRight, BookOpen, Bot, Users, Activity } from 'lucide-react';

// Import other components (you'll need to create these or they might already exist)
// import Questionnaire from './Questionnaire';
// import SatelliteChecker from './SatelliteChecker';
// import FarmerLedger from './FarmerLedger';
// import DDSGenerator from './DDSGenerator';
// import SupplierManager from './SupplierManager';

interface Props {
  user: UserProfile;
  onLogout?: () => void;
}

const Dashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'assessment' | 'satellite' | 'ledger' | 'dds' | 'suppliers'>('dashboard');

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedReports = localStorage.getItem('naturexpress_reports');
      const savedDocs = localStorage.getItem('naturexpress_documents');
      const savedSuppliers = localStorage.getItem('naturexpress_suppliers');
      
      if (savedReports) setReports(JSON.parse(savedReports));
      if (savedDocs) setDocs(JSON.parse(savedDocs));
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const avgScore = reports.length > 0 
    ? Math.round(reports.reduce((acc, curr) => acc + curr.score, 0) / reports.length)
    : 0;

  const highRiskSuppliers = suppliers.filter(s => s.riskTag === RiskLevel.High).length;

  const handleNewAssessment = () => {
    setActiveView('assessment');
  };

  const handleUpgrade = () => {
    alert('Upgrade feature coming soon! This will integrate with Stripe.');
  };

  const handleOpenSatellite = () => {
    setActiveView('satellite');
  };

  const handleOpenLedger = () => {
    setActiveView('ledger');
  };

  const handleOpenDDS = () => {
    setActiveView('dds');
  };

  const handleOpenSuppliers = () => {
    setActiveView('suppliers');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  // Conditional rendering based on activeView
  if (activeView === 'assessment') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button 
          onClick={handleBackToDashboard}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
          <p className="text-gray-600">Questionnaire component will load here</p>
          {/* <Questionnaire onComplete={handleBackToDashboard} /> */}
        </div>
      </div>
    );
  }

  if (activeView === 'satellite') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button 
          onClick={handleBackToDashboard}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Satellite Verification</h2>
          <p className="text-gray-600">Satellite checker component will load here</p>
          {/* <SatelliteChecker /> */}
        </div>
      </div>
    );
  }

  if (activeView === 'ledger') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button 
          onClick={handleBackToDashboard}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Farmer Digital Ledger</h2>
          <p className="text-gray-600">Farmer ledger component will load here</p>
          {/* <FarmerLedger /> */}
        </div>
      </div>
    );
  }

  if (activeView === 'dds') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button 
          onClick={handleBackToDashboard}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">TRACES Submission</h2>
          <p className="text-gray-600">DDS generator component will load here</p>
          {/* <DDSGenerator /> */}
        </div>
      </div>
    );
  }

  if (activeView === 'suppliers') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <button 
          onClick={handleBackToDashboard}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Supplier Portal</h2>
          <p className="text-gray-600">Supplier manager component will load here</p>
          {/* <SupplierManager /> */}
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NatureXpress</h1>
                <p className="text-xs text-gray-500">EUDR Compliance Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{user.email}</div>
                <div className="text-xs text-gray-500">{user.plan} Plan</div>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 animate-fade-in">
          {/* SaaS Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <Activity size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Avg Readiness</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{avgScore}%</div>
              <div className="text-xs text-gray-400 mt-1">Across {reports.length} assessments</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Users size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Suppliers</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{suppliers.length}</div>
              <div className="text-xs text-gray-400 mt-1">{highRiskSuppliers} flagged high risk</div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-purple-600 mb-2">
                <FileText size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Legal Docs</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{docs.length}</div>
              <div className="text-xs text-gray-400 mt-1">Ready for download</div>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl text-white flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase opacity-60">Plan</div>
                <div className="text-lg font-bold">{user.plan} ACCESS</div>
              </div>
              <button onClick={handleUpgrade} className="text-xs underline hover:text-green-200">View upgrades</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Compliance Toolchain</h2>
                <button onClick={handleNewAssessment} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                  <Plus size={18} /> New Due Diligence
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToolCard 
                  icon={<Satellite size={24}/>} 
                  title="Satellite Verification" 
                  desc="Real-time deforestation map overlay." 
                  onClick={handleOpenSatellite}
                  color="green"
                />
                <ToolCard 
                  icon={<Users size={24}/>} 
                  title="Supplier Portal" 
                  desc="Manage evidence and GPS data." 
                  onClick={handleOpenSuppliers}
                  color="blue"
                />
                 <ToolCard 
                  icon={<BookOpen size={24}/>} 
                  title="Farmer Digital Ledger" 
                  desc="Legal land records management." 
                  onClick={handleOpenLedger}
                  color="teal"
                />
                <ToolCard 
                  icon={<Bot size={24}/>} 
                  title="TRACES Submission" 
                  desc="Automated EU XML generation." 
                  onClick={handleOpenDDS}
                  color="purple"
                />
              </div>

              {/* Activity List */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Assessment History</h3>
                </div>
                {reports.length === 0 ? (
                   <div className="p-12 text-center text-gray-400">
                    <p>No recent reports. Start your first assessment to see history.</p>
                   </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {reports.slice(0, 5).map((r, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${r.riskLevel === RiskLevel.High ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <Shield size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{r.data?.productType || 'Unknown'} from {r.data?.exportCountry || 'Unknown'}</div>
                            <div className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-green-600">{r.score}%</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{r.riskLevel} RISK</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18}/> Compliance Pulse</h3>
                 <div className="space-y-4">
                    <PulseItem label="Documentation Complete" val={Math.round((docs.length/8)*100)} color="blue" />
                    <PulseItem label="Supplier Coverage" val={Math.round((suppliers.filter(s=>s.gpsAvailable).length / suppliers.length)*100) || 0} color="green" />
                    <PulseItem label="Deforestation Check" val={100} color="teal" />
                 </div>
               </div>

               <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl text-white shadow-xl">
                 <h4 className="font-bold mb-2">Need Help with EUDR?</h4>
                 <p className="text-sm opacity-80 mb-4">Our AI Compliance Advisor is available for NatureXpress Pro members.</p>
                 <button onClick={handleUpgrade} className="w-full py-2 bg-white text-green-600 font-bold rounded-lg text-sm hover:bg-green-50 transition-colors">
                    Talk to AI Advisor
                 </button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ToolCard = ({ icon, title, desc, onClick, color }: any) => {
  const colorClasses: any = {
    green: 'border-green-100 hover:bg-green-50 text-green-600',
    blue: 'border-blue-100 hover:bg-blue-50 text-blue-600',
    teal: 'border-teal-100 hover:bg-teal-50 text-teal-600',
    purple: 'border-purple-100 hover:bg-purple-50 text-purple-600',
  };
  return (
    <div 
      onClick={onClick}
      className={`p-5 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-md flex items-start gap-4 ${colorClasses[color]}`}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
};

const PulseItem = ({ label, val, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-bold text-gray-500">
      <span>{label}</span>
      <span>{val}%</span>
    </div>
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full bg-${color}-500`} style={{ width: `${val}%` }} />
    </div>
  </div>
);

const Shield = ({ size }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export default Dashboard;