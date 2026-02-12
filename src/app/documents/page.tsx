'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  FileJson,
  CheckCircle,
  Clock,
  Shield,
  X,
  Loader2
} from 'lucide-react';
import { GeneratedDocument } from '@/types';

export default function DocumentsPage() {
  const router = useRouter();
  const { documents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Fix for Hydration

  // --- 1. FIX: STATIC MOCK DATA (No dynamic Date.now() during render) ---
  // We use hardcoded ISO strings to ensure Server & Client see the exact same data.
  const mockDocuments: GeneratedDocument[] = [
    {
      id: 'doc_1',
      title: 'EUDR Due Diligence Statement (Traces XML)',
      type: 'DDS',
      referenceNumber: 'DDS-IND-2026-882',
      date: '2026-02-12T09:30:00Z', // Fixed date
      status: 'Draft',
      fileSize: '1.2 MB'
    },
    {
      id: 'doc_2',
      title: 'Article 10 Risk Assessment: Coorg Estate',
      type: 'Risk Assessment',
      referenceNumber: 'RA-KA-092',
      date: '2026-02-11T14:20:00Z', // Fixed date
      status: 'Final',
      fileSize: '2.4 MB'
    },
    {
      id: 'doc_3',
      title: 'Geolocation Map Data (GeoJSON)',
      type: 'Supplier Declaration', 
      referenceNumber: 'GEO-LAT-75.2',
      date: '2026-02-10T11:15:00Z', // Fixed date
      status: 'Submitted',
      fileSize: '4.8 MB'
    }
  ];

  // Prevent Hydration Mismatch by rendering only after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const allDocs = [...mockDocuments, ...documents];

  const filteredDocs = allDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- SIMULATE DOWNLOAD ---
  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert("Document downloaded successfully! (Demo)");
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Final': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('GeoJSON')) return <FileJson size={20} className="text-blue-600" />;
    if (type.includes('Risk')) return <Shield size={20} className="text-orange-600" />;
    return <FileText size={20} className="text-green-600" />;
  };

  // Prevent render until client-side hydration is complete
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Document Vault</h1>
              <p className="text-xs text-gray-500">EU Compliance Statements & Geolocation Files</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/assessment')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-black transition-colors"
          >
            <Plus size={16} /> Generate DDS
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
            />
          </div>
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm">
            <Filter size={16} /> Filter Status
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                <th className="px-6 py-4 font-semibold">Document Name</th>
                <th className="px-6 py-4 font-semibold">Reference</th>
                <th className="px-6 py-4 font-semibold">Date Created</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-200">
                        {getIcon(doc.title)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{doc.title}</div>
                        <div className="text-xs text-gray-500">{doc.type} • {doc.fileSize}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {doc.referenceNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {/* 2. FIX: FORCE CONSISTENT DATE FORMAT (DD/MM/YYYY) */}
                      {new Date(doc.date).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* PREVIEW BUTTON */}
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview Document"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {/* DOWNLOAD BUTTON */}
                      <button 
                        onClick={() => handleDownload(doc.id)}
                        disabled={downloadingId === doc.id}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Download PDF/XML"
                      >
                        {downloadingId === doc.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDocs.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No documents found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or generate a new one.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- PREVIEW MODAL --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">{getIcon(selectedDoc.title)}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedDoc.title}</h3>
                  <p className="text-xs text-gray-500">Ref: {selectedDoc.referenceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content (Fake Document) */}
            <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
              <div className="bg-white border border-gray-200 shadow-sm p-8 min-h-[400px] mx-auto max-w-[500px]">
                <div className="flex justify-between items-start mb-8">
                  <div className="text-2xl font-serif font-bold text-gray-900">DDS</div>
                  <div className="text-right text-xs text-gray-500">
                    <p>EU REGULATION 2023/1115</p>
                    <p>Date: {new Date(selectedDoc.date).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                
                <div className="space-y-6 font-serif text-sm text-gray-800">
                  <p><strong>1. Operator:</strong> {selectedDoc.type === 'DDS' ? 'NatureXpress Exporter Ltd' : 'Unknown'}</p>
                  <p><strong>2. Commodity:</strong> Coffee (HS Code 0901)</p>
                  <p><strong>3. Country of Production:</strong> India</p>
                  <p className="p-4 bg-gray-50 border border-gray-100 italic text-gray-600">
                    "I declare that the relevant commodity has been produced in accordance with the relevant legislation of the country of production and is deforestation-free."
                  </p>
                  <div className="mt-8 border-t pt-4">
                    <p className="font-bold">Signature:</p>
                    <p className="font-script text-2xl text-blue-900">Digital Signed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleDownload(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}