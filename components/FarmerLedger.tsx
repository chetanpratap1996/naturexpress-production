'use client';

import React, { useState, useEffect } from 'react';
import { FarmerRecord } from '@/types';
import { Users, Search, Plus, FileText, CheckCircle, Upload, Leaf, MapPin, Phone, ArrowLeft, Save, Loader2, BookOpen } from 'lucide-react';

interface Props {
  onBack: () => void;
}

// Land Record Types
enum LandRecordType {
  RTC = 'RTC (Record of Rights)',
  Patta = 'Patta',
  Deed = 'Sale Deed',
  Lease = 'Lease Agreement',
  Other = 'Other',
}

const FarmerLedger: React.FC<Props> = ({ onBack }) => {
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<FarmerRecord>>({
    landOwnershipType: 'Owned',
    status: 'Active',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [landRecordType, setLandRecordType] = useState<LandRecordType>(LandRecordType.RTC);
  const [hasHarvestRights, setHasHarvestRights] = useState(false);

  // Load farmers from localStorage on mount
  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = () => {
    try {
      const saved = localStorage.getItem('naturexpress_farmers');
      if (saved) {
        setFarmers(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load farmers:', error);
    }
  };

  const saveFarmers = (updatedFarmers: FarmerRecord[]) => {
    try {
      localStorage.setItem('naturexpress_farmers', JSON.stringify(updatedFarmers));
      setFarmers(updatedFarmers);
    } catch (error) {
      console.error('Failed to save farmers:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.farmLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof FarmerRecord, value: any) => {
    setFormData((prev: Partial<FarmerRecord>) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.farmLocation || !formData.gpsCoordinates || !selectedFile || !hasHarvestRights) {
      alert('Please fill all required fields and verify harvest rights');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newFarmer: FarmerRecord = {
        id: generateId(),
        name: formData.name,
        farmLocation: formData.farmLocation,
        gpsCoordinates: formData.gpsCoordinates,
        landArea: formData.landArea || 0,
        landOwnershipType: formData.landOwnershipType || 'Owned',
        registrationNumber: formData.registrationNumber,
        certifications: formData.certifications || [],
        lastVerified: new Date().toISOString(),
        status: 'Active',
        // Custom fields for EUDR
        landRecordType: landRecordType,
        landRecordFileName: selectedFile.name,
        hasHarvestRights: hasHarvestRights,
      };

      const updatedFarmers = [newFarmer, ...farmers];
      saveFarmers(updatedFarmers);
      
      // Reset form
      setShowAddForm(false);
      setFormData({ landOwnershipType: 'Owned', status: 'Active' });
      setSelectedFile(null);
      setLandRecordType(LandRecordType.RTC);
      setHasHarvestRights(false);
      
      alert('Farmer added successfully!');
    } catch (error) {
      console.error('Failed to add farmer:', error);
      alert('Failed to add farmer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="text-green-600" size={32} />
              Farmer Knowledge Base
            </h2>
            <p className="text-gray-600 mt-1">Digital ledger linking product to land ownership proofs (RTC/Patta).</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} /> Add Farmer
          </button>
        </div>

        {showAddForm ? (
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-w-2xl mx-auto">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">New Farmer Registration</h3>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-gray-400 hover:text-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="tel" 
                      className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+91 00000 00000"
                      value={formData.registrationNumber || ''}
                      onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Village, District, State"
                      value={formData.farmLocation || ''}
                      onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Land Area (Ha) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    value={formData.landArea || ''}
                    onChange={(e) => handleInputChange('landArea', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPS Coordinates *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="12.9716° N, 77.5946° E"
                    value={formData.gpsCoordinates || ''}
                    onChange={(e) => handleInputChange('gpsCoordinates', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: Latitude, Longitude</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Ownership *</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.landOwnershipType || 'Owned'}
                    onChange={(e) => handleInputChange('landOwnershipType', e.target.value as 'Owned' | 'Leased' | 'Community')}
                  >
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                    <option value="Community">Community Land</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <FileText size={18} /> Land Ownership Proof
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-semibold text-blue-800 mb-1">Document Type *</label>
                     <select 
                        className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500"
                        value={landRecordType}
                        onChange={(e) => setLandRecordType(e.target.value as LandRecordType)}
                     >
                       {Object.values(LandRecordType).map(t => (
                         <option key={t} value={t}>{t}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-blue-800 mb-1">Upload File *</label>
                     <div className="relative">
                       <input 
                         type="file" 
                         required
                         accept=".pdf,.jpg,.jpeg,.png"
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         onChange={handleFileChange}
                       />
                       <div className="w-full bg-white border border-blue-200 rounded-md py-2 px-3 text-sm text-gray-500 flex items-center gap-2 hover:bg-blue-50 transition-colors">
                         <Upload size={14} />
                         <span className="truncate">{selectedFile ? selectedFile.name : "Choose Photo/PDF..."}</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <input 
                  type="checkbox" 
                  id="harvestRights"
                  required
                  className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                  checked={hasHarvestRights}
                  onChange={(e) => setHasHarvestRights(e.target.checked)}
                />
                <label htmlFor="harvestRights" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-semibold text-gray-900">Harvest Rights Verification *</span>
                  <br />
                  I verify that this farmer has the legal right to harvest the specified commodity on the land described above, in accordance with local laws.
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSubmitting ? 'Saving...' : 'Save to Ledger'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col min-h-[500px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                   placeholder="Search by name, location..."
                   value={searchTerm}
                   onChange={handleSearch}
                 />
               </div>
               <div className="text-sm text-gray-500 ml-auto hidden md:block">
                 Showing {filteredFarmers.length} records
               </div>
            </div>

            {/* Table / List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                    <th className="px-6 py-4 font-medium">Farmer Identity</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">GPS Coordinates</th>
                    <th className="px-6 py-4 font-medium">Land Area</th>
                    <th className="px-6 py-4 font-medium">Land Proof</th>
                    <th className="px-6 py-4 font-medium">Rights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredFarmers.map(farmer => (
                    <tr key={farmer.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                             {farmer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{farmer.name}</div>
                            <div className="text-gray-500 text-xs">{farmer.registrationNumber || 'No contact'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{farmer.farmLocation}</td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {farmer.gpsCoordinates}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {farmer.landArea} ha
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-gray-700 text-xs">
                            {(farmer as any).landRecordType || farmer.landOwnershipType}
                          </span>
                          {(farmer as any).landRecordFileName && (
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 max-w-[100px] truncate" title={(farmer as any).landRecordFileName}>
                              {(farmer as any).landRecordFileName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(farmer as any).hasHarvestRights ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                            <CheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-1 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {filteredFarmers.length === 0 && (
                     <tr>
                       <td colSpan={6} className="py-12 text-center text-gray-400">
                         <Users size={48} className="mx-auto mb-3 opacity-20" />
                         <p className="font-medium">No farmers found</p>
                         <p className="text-sm mt-1">
                           {searchTerm ? 'Try a different search term' : 'Click "Add Farmer" to get started'}
                         </p>
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `farmer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default FarmerLedger;