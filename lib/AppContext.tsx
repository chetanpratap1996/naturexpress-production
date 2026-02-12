'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ExporterFormData, 
  ComplianceResult, 
  UserProfile, 
  GeneratedDocument, 
  Supplier,
  FarmerRecord,
  SatelliteAnalysisResult,
  DDSSubmission
} from '@/types';

interface AppContextType {
  // User Management
  user: UserProfile | null;
  login: (email: string, companyName: string) => void;
  logout: () => void;
  
  // Assessment Management
  currentAssessment: ComplianceResult | null;
  currentFormData: ExporterFormData | null;
  setCurrentAssessment: (result: ComplianceResult, formData: ExporterFormData) => void;
  assessments: Array<{ formData: ExporterFormData; result: ComplianceResult; timestamp: string }>;
  
  // Document Management
  documents: GeneratedDocument[];
  addDocument: (doc: GeneratedDocument) => void;
  
  // Supplier Management
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Farmer Management
  farmers: FarmerRecord[];
  addFarmer: (farmer: FarmerRecord) => void;
  
  // Satellite Analysis
  satelliteResults: SatelliteAnalysisResult[];
  addSatelliteResult: (result: SatelliteAnalysisResult) => void;
  
  // DDS Submissions
  ddsSubmissions: DDSSubmission[];
  addDDSSubmission: (submission: DDSSubmission) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentAssessment, setCurrentAssessmentState] = useState<ComplianceResult | null>(null);
  const [currentFormData, setCurrentFormDataState] = useState<ExporterFormData | null>(null);
  const [assessments, setAssessments] = useState<Array<{ formData: ExporterFormData; result: ComplianceResult; timestamp: string }>>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [satelliteResults, setSatelliteResults] = useState<SatelliteAnalysisResult[]>([]);
  const [ddsSubmissions, setDDSSubmissions] = useState<DDSSubmission[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nx_user');
    const savedAssessments = localStorage.getItem('nx_assessments');
    const savedDocuments = localStorage.getItem('nx_documents');
    const savedSuppliers = localStorage.getItem('nx_suppliers');
    const savedFarmers = localStorage.getItem('nx_farmers');
    const savedSatellite = localStorage.getItem('nx_satellite');
    const savedDDS = localStorage.getItem('nx_dds');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAssessments) setAssessments(JSON.parse(savedAssessments));
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedFarmers) setFarmers(JSON.parse(savedFarmers));
    if (savedSatellite) setSatelliteResults(JSON.parse(savedSatellite));
    if (savedDDS) setDDSSubmissions(JSON.parse(savedDDS));
  }, []);

  // User Functions
  const login = (email: string, companyName: string) => {
    const newUser: UserProfile = {
      id: Date.now().toString(),
      email,
      companyName,
      plan: 'Free', // Start with Free plan
      createdAt: new Date().toISOString(),
      onboarded: false,
    };
    setUser(newUser);
    localStorage.setItem('nx_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setCurrentAssessmentState(null);
    setCurrentFormDataState(null);
    localStorage.removeItem('nx_user');
  };

  // Assessment Functions
  const setCurrentAssessment = (result: ComplianceResult, formData: ExporterFormData) => {
    setCurrentAssessmentState(result);
    setCurrentFormDataState(formData);
    
    const newAssessment = {
      formData,
      result: { ...result, timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newAssessment, ...assessments];
    setAssessments(updated);
    localStorage.setItem('nx_assessments', JSON.stringify(updated));
  };

  // Document Functions
  const addDocument = (doc: GeneratedDocument) => {
    const updated = [doc, ...documents];
    setDocuments(updated);
    localStorage.setItem('nx_documents', JSON.stringify(updated));
  };

  // Supplier Functions
  const addSupplier = (supplier: Supplier) => {
    const updated = [supplier, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem('nx_suppliers', JSON.stringify(updated));
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const updated = suppliers.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    setSuppliers(updated);
    localStorage.setItem('nx_suppliers', JSON.stringify(updated));
  };

  const deleteSupplier = (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    localStorage.setItem('nx_suppliers', JSON.stringify(updated));
  };

  // Farmer Functions
  const addFarmer = (farmer: FarmerRecord) => {
    const updated = [farmer, ...farmers];
    setFarmers(updated);
    localStorage.setItem('nx_farmers', JSON.stringify(updated));
  };

  // Satellite Functions
  const addSatelliteResult = (result: SatelliteAnalysisResult) => {
    const updated = [result, ...satelliteResults];
    setSatelliteResults(updated);
    localStorage.setItem('nx_satellite', JSON.stringify(updated));
  };

  // DDS Functions
  const addDDSSubmission = (submission: DDSSubmission) => {
    const updated = [submission, ...ddsSubmissions];
    setDDSSubmissions(updated);
    localStorage.setItem('nx_dds', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        currentAssessment,
        currentFormData,
        setCurrentAssessment,
        assessments,
        documents,
        addDocument,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        farmers,
        addFarmer,
        satelliteResults,
        addSatelliteResult,
        ddsSubmissions,
        addDDSSubmission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}