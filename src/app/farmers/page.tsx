'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  BookOpen, 
  Search, 
  Plus, 
  MapPin, 
  Tractor, 
  FileCheck, 
  MoreVertical 
} from 'lucide-react';
import { FarmerRecord } from '@/types';

export default function FarmerLedgerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data for SaaS Demo
  const farmers: FarmerRecord[] = [
    {
      id: 'frm_1',
      name: 'Rajesh Kumar',
      farmLocation: 'Coorg, Karnataka',
      gpsCoordinates: '12.4244, 75.7382',
      landArea: 4.5,
      status: 'Active'
    },
    {
      id: 'frm_2',
      name: 'Sarah Silva',
      farmLocation: 'Minas Gerais, Brazil',
      gpsCoordinates: '-18.5122, -44.5550',
      landArea: 12.2,
      status: 'Active'
    },
    {
      id: 'frm_3',
      name: 'Nguyen Van Minh',
      farmLocation: 'Dak Lak, Vietnam',
      gpsCoordinates: '12.6667, 108.0500',
      landArea: 2.1,
      status: 'Pending'
    }
  ];

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farmLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Farmer Ledger</h1>
              <p className="text-xs text-gray-500">Land rights & polygon management</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors">
            <Plus size={16} /> Add Farmer
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by farmer name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-sm"
          />
        </div>

        {/* List */}
        <div className="grid gap-4">
          {filteredFarmers.map((farmer) => (
            <div key={farmer.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-50 text-teal-700 rounded-full">
                  <Tractor size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{farmer.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={14}/> {farmer.farmLocation}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{farmer.gpsCoordinates}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 md:gap-12 pl-14 md:pl-0">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Land Size</div>
                  <div className="font-bold text-gray-900">{farmer.landArea} ha</div>
                </div>
                
                <div>
                   <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Status</div>
                   <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                     farmer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {farmer.status === 'Active' && <FileCheck size={12} />}
                     {farmer.status}
                   </span>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}