'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  Sprout, 
  LogOut, 
  Plus, 
  FileText, 
  Users, 
  Satellite, 
  BookOpen, 
  Activity,
  TrendingUp
} from 'lucide-react';

// Define strict types for the Action Card props
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'teal' | 'green';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, assessments, documents, suppliers } = useApp();
  const [loading, setLoading] = useState(true);

  // Protect the route: Redirect if not logged in
  useEffect(() => {
    // Small delay to allow context to load from localStorage
    const timer = setTimeout(() => {
      if (!user) {
        router.push('/');
      } else {
        setLoading(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  // Prevent flash of content or crash while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Sprout className="animate-bounce text-green-600" size={48} />
          <div className="text-gray-500 font-medium">Loading NatureXpress...</div>
        </div>
      </div>
    );
  }

  // Calculate Average Readiness Score safely
  const avgScore = assessments.length > 0 
    ? Math.round(assessments.reduce((acc, curr) => acc + curr.result.score, 0) / assessments.length)
    : 0;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="bg-green-600 p-1.5 rounded-lg text-white">
              <Sprout size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Nature<span className="text-green-600">Xpress</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-sm font-semibold text-gray-800">{user.companyName}</span>
               <span className="text-xs text-gray-500">{user.email}</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, here is your compliance summary.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <Activity size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Avg Readiness</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{avgScore}%</div>
            <div className="text-xs text-gray-400 mt-1">Across {assessments.length} assessments</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <Users size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Suppliers</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{suppliers.length}</div>
            <div className="text-xs text-gray-400 mt-1">Tracked suppliers</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 text-green-600 mb-2">
              <FileText size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Documents</span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{documents.length}</div>
            <div className="text-xs text-gray-400 mt-1">Generated documents</div>
          </div>

          <div className="bg-green-900 p-6 rounded-xl text-white flex flex-col justify-between shadow-lg">
            <div>
              <div className="text-xs font-bold uppercase opacity-60">Current Plan</div>
              <div className="text-xl font-bold uppercase tracking-wide">{user.plan} TIER</div>
            </div>
            {/* FIXED: Now links to Pricing Page */}
            <button 
              onClick={() => router.push('/pricing')}
              className="text-xs font-medium bg-white/20 py-1.5 px-3 rounded hover:bg-white/30 text-center transition-colors"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <button 
                onClick={() => router.push('/assessment')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-all shadow-md font-medium"
              >
                <Plus size={18} /> New Assessment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                icon={<Satellite size={24} />}
                title="Satellite Verification"
                desc="Check deforestation status via GPS"
                onClick={() => router.push('/satellite')}
                color="blue"
              />
              <ActionCard
                icon={<Users size={24} />}
                title="Supplier Manager"
                desc="Track supplier compliance data"
                onClick={() => router.push('/suppliers')}
                color="purple"
              />
              <ActionCard
                icon={<BookOpen size={24} />}
                title="Farmer Ledger"
                desc="Manage land rights & records"
                onClick={() => router.push('/farmers')}
                color="teal"
              />
              <ActionCard
                icon={<FileText size={24} />}
                title="Document Vault"
                desc="Access generated DDS forms"
                onClick={() => router.push('/documents')}
                color="green"
              />
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Recent Assessments</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {assessments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <TrendingUp className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No assessments yet.</p>
                  <button 
                    onClick={() => router.push('/assessment')}
                    className="text-green-600 hover:text-green-700 font-semibold text-sm hover:underline"
                  >
                    Start your first one →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {assessments.slice(0, 5).map((assessment, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          assessment.result.score >= 80 ? 'bg-green-100 text-green-700' :
                          assessment.result.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {assessment.formData.productType}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(assessment.timestamp).toLocaleDateString()} • {assessment.formData.exportCountry}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{assessment.result.score}%</div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${
                           assessment.result.riskLevel === 'Low' ? 'text-green-600' :
                           assessment.result.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {assessment.result.riskLevel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Strictly typed ActionCard component
function ActionCard({ icon, title, desc, onClick, color }: ActionCardProps) {
  const colorClasses = {
    blue: 'border-blue-100 hover:bg-blue-50 text-blue-600 group-hover:text-blue-700',
    purple: 'border-purple-100 hover:bg-purple-50 text-purple-600 group-hover:text-purple-700',
    teal: 'border-teal-100 hover:bg-teal-50 text-teal-600 group-hover:text-teal-700',
    green: 'border-green-100 hover:bg-green-50 text-green-600 group-hover:text-green-700',
  };
  
  return (
    <div 
      onClick={onClick}
      className={`p-5 bg-white border rounded-xl cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 flex items-start gap-4 group ${colorClasses[color]}`}
    >
      <div className="shrink-0 transition-transform group-hover:scale-110">{icon}</div>
      <div>
        <h4 className="font-bold text-gray-900 group-hover:text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}