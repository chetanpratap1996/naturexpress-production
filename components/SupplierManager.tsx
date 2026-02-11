'use client';

import React, { useState, useEffect } from 'react';
import { Supplier, RiskLevel } from '@/types';
import { 
  Plus, 
  Users, 
  MapPin, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  X,
  Edit2,
  Trash2,
  FileText,
  Mail,
  Phone,
  MapPinned,
  Calendar,
  Filter,
  Download,
  Upload,
  Eye,
  XCircle
} from 'lucide-react';

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

const SupplierManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    location: '',
    country: '',
    productType: 'Coffee',
    gpsAvailable: false,
    gpsCoordinates: '',
    landArea: 0,
    landRecords: false,
    riskTag: RiskLevel.Medium,
    contactPerson: '',
    email: '',
    phone: '',
    notes: '',
  });

  // ============================================================================
  // LOAD SUPPLIERS
  // ============================================================================

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, filterRisk]);

  const loadSuppliers = () => {
    try {
      setIsLoading(true);
      const saved = localStorage.getItem('naturexpress_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSuppliers(parsed);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSuppliers = (updatedSuppliers: Supplier[]) => {
    try {
      localStorage.setItem('naturexpress_suppliers', JSON.stringify(updatedSuppliers));
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error('Failed to save suppliers:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filterSuppliers = () => {
    let filtered = suppliers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.productType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk filter
    if (filterRisk !== 'All') {
      filtered = filtered.filter((s) => s.riskTag === filterRisk);
    }

    setFilteredSuppliers(filtered);
  };

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const handleAdd = () => {
    if (!formData.name || !formData.location || !formData.productType) {
      alert('Please fill in all required fields');
      return;
    }

    const newSupplier: Supplier = {
      id: generateId(),
      name: formData.name,
      location: formData.location,
      country: formData.country || '',
      productType: formData.productType,
      gpsAvailable: formData.gpsAvailable || false,
      gpsCoordinates: formData.gpsCoordinates,
      landArea: formData.landArea,
      landRecords: formData.landRecords || false,
      riskTag: formData.riskTag || RiskLevel.Medium,
      lastVerified: new Date().toISOString(),
      documents: [],
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSupplier, ...suppliers];
    saveSuppliers(updated);
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (!selectedSupplier || !formData.name) {
      alert('Please fill in required fields');
      return;
    }

    const updated = suppliers.map((s) =>
      s.id === selectedSupplier.id
        ? {
            ...s,
            ...formData,
            updatedAt: new Date().toISOString(),
          }
        : s
    );

    saveSuppliers(updated);
    resetForm();
    setShowEditModal(false);
    setSelectedSupplier(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    const updated = suppliers.filter((s) => s.id !== id);
    saveSuppliers(updated);
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData(supplier);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      country: '',
      productType: 'Coffee',
      gpsAvailable: false,
      gpsCoordinates: '',
      landArea: 0,
      landRecords: false,
      riskTag: RiskLevel.Medium,
      contactPerson: '',
      email: '',
      phone: '',
      notes: '',
    });
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const generateId = (): string => {
    return `supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case RiskLevel.Low:
        return 'bg-green-100 text-green-700 border-green-300';
      case RiskLevel.Medium:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case RiskLevel.High:
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const exportToCSV = () => {
    if (suppliers.length === 0) {
      alert('No suppliers to export');
      return;
    }

    const headers = [
      'Name',
      'Location',
      'Product Type',
      'GPS Available',
      'GPS Coordinates',
      'Risk Level',
      'Contact',
      'Email',
      'Phone',
    ];

    const rows = suppliers.map((s) => [
      s.name,
      s.location,
      s.productType,
      s.gpsAvailable ? 'Yes' : 'No',
      s.gpsCoordinates || 'N/A',
      s.riskTag,
      s.contactPerson || 'N/A',
      s.email || 'N/A',
      s.phone || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Supplier Management</h2>
                <p className="text-gray-600 mt-1">
                  Track and verify compliance across your supply chain
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Plus size={20} />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Suppliers</p>
            <p className="text-3xl font-black text-gray-900">{suppliers.length}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
            <p className="text-sm font-medium text-green-700 mb-1">Low Risk</p>
            <p className="text-3xl font-black text-green-900">
              {suppliers.filter((s) => s.riskTag === RiskLevel.Low).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
            <p className="text-sm font-medium text-yellow-700 mb-1">Medium Risk</p>
            <p className="text-3xl font-black text-yellow-900">
              {suppliers.filter((s) => s.riskTag === RiskLevel.Medium).length}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
            <p className="text-sm font-medium text-red-700 mb-1">High Risk</p>
            <p className="text-3xl font-black text-red-900">
              {suppliers.filter((s) => s.riskTag === RiskLevel.High).length}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, location, or product..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Risk Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'All')}
              >
                <option value="All">All Risk Levels</option>
                <option value={RiskLevel.Low}>Low Risk</option>
                <option value={RiskLevel.Medium}>Medium Risk</option>
                <option value={RiskLevel.High}>High Risk</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterRisk !== 'All') && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filterRisk !== 'All' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                  Risk: {filterRisk}
                  <button onClick={() => setFilterRisk('All')}>
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading suppliers...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {suppliers.length === 0 ? 'No Suppliers Yet' : 'No Results Found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {suppliers.length === 0
                  ? 'Get started by adding your first supplier to the system'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {suppliers.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Add First Supplier
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                      GPS Data
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                      Land Records
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-sm">
                              {supplier.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {supplier.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={12} />
                              {supplier.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 font-medium">
                          {supplier.productType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {supplier.gpsAvailable ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <CheckCircle size={14} />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
                            <XCircle size={14} />
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {supplier.landRecords ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <FileText size={14} />
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 ${getRiskColor(
                            supplier.riskTag
                          )}`}
                        >
                          <Shield size={14} />
                          {supplier.riskTag.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit supplier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete supplier"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
                setSelectedSupplier(null);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-black text-gray-900 mb-6">
              {showEditModal ? 'Edit Supplier' : 'Register New Supplier'}
            </h3>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Location & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="City, Region"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  value={formData.productType}
                  onChange={(e) =>
                    setFormData({ ...formData, productType: e.target.value })
                  }
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* GPS & Land Records */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <input
                    type="checkbox"
                    id="gps-check"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={formData.gpsAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, gpsAvailable: e.target.checked })
                    }
                  />
                  <label htmlFor="gps-check" className="text-sm font-medium text-gray-700 cursor-pointer">
                    GPS Data Available
                  </label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <input
                    type="checkbox"
                    id="land-check"
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    checked={formData.landRecords}
                    onChange={(e) =>
                      setFormData({ ...formData, landRecords: e.target.checked })
                    }
                  />
                  <label htmlFor="land-check" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Land Records Available
                  </label>
                </div>
              </div>

              {/* GPS Coordinates (conditional) */}
              {formData.gpsAvailable && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    GPS Coordinates
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm"
                    placeholder="12.9716, 77.5946"
                    value={formData.gpsCoordinates}
                    onChange={(e) =>
                      setFormData({ ...formData, gpsCoordinates: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Risk Level */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  value={formData.riskTag}
                  onChange={(e) =>
                    setFormData({ ...formData, riskTag: e.target.value as RiskLevel })
                  }
                >
                  <option value={RiskLevel.Low}>Low Risk</option>
                  <option value={RiskLevel.Medium}>Medium Risk</option>
                  <option value={RiskLevel.High}>High Risk</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="border-t-2 border-gray-100 pt-5">
                <h4 className="text-sm font-bold text-gray-700 mb-4">
                  Contact Information (Optional)
                </h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Contact Person Name"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  placeholder="Additional notes or comments..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                    setSelectedSupplier(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleEdit : handleAdd}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  {showEditModal ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;