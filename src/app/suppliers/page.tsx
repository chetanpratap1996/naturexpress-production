'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  Users, 
  Plus, 
  Search, 
  MapPin, 
  MoreHorizontal, 
  AlertTriangle,
  CheckCircle,
  Truck
} from 'lucide-react';
import { Supplier, RiskLevel } from '@/types';

export default function SupplierPage() {
  const router = useRouter();
  const { user } = useApp(); // In a real app, we'd pull suppliers from context here
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Supplier Data (Enterprise Grade)
  const [suppliers] = useState<Supplier[]>([
    {
      id: 'sup_1',
      name: 'Coorg Coffee Cooperative',
      country: 'India',
      type: 'Cooperative',
      riskTag: RiskLevel.Low,
      lastAssessmentDate: '2024-02-10',
      status: 'Active'
    },
    {
      id: 'sup_2',
      name: 'Dak Lak Farmers Union',
      country: 'Vietnam',
      type: 'Aggregator',
      riskTag: RiskLevel.High,
      lastAssessmentDate: '2024-01-25',
      status: 'Pending'
    },
    {
      id: 'sup_3',
      name: 'Silva Estate Farms',
      country: 'Brazil',
      type: 'Farmer',
      riskTag: RiskLevel.Medium,
      lastAssessmentDate: '2024-02-05',
      status: 'Active'
    }
  ]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg text-white">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Supplier Management</h1>
              <p className="text-xs text-gray-500">Track source compliance and risk</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors">
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Search Bar */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search suppliers by name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
          />
        </div>

        {/* Supplier List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-full text-gray-500">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{supplier.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={14}/> {supplier.country}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs uppercase font-medium">{supplier.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Compliance Risk</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ml-auto w-fit ${
                    supplier.riskTag === 'Low' ? 'bg-green-100 text-green-700' :
                    supplier.riskTag === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {supplier.riskTag === 'Low' && <CheckCircle size={12} />}
                    {supplier.riskTag === 'High' && <AlertTriangle size={12} />}
                    {supplier.riskTag} Risk
                  </span>
                </div>

                <div className="text-right hidden md:block">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Status</div>
                  <span className={`font-semibold text-sm ${
                    supplier.status === 'Active' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {supplier.status}
                  </span>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}