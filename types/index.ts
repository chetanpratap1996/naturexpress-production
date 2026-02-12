// types/index.ts - FINAL COMPLETE VERSION

export type PlanTier = 'Free' | 'Basic' | 'Pro' | 'Enterprise';
export enum RiskLevel { Low = 'Low', Medium = 'Medium', High = 'High' }
export enum TraceabilityLevel { None = 'None', Basic = 'Basic', Advanced = 'Advanced', Blockchain = 'Blockchain' }

// --- USER & AUTH ---
export interface UserProfile {
  id: string;
  email: string;
  companyName: string;
  plan: PlanTier;
  createdAt: string;
  onboarded: boolean;
}

// --- FORMS & ASSESSMENT ---
export interface ExporterFormData {
  // Core Info
  companyName: string;
  exportCountry: string;
  productType: string;
  
  // Assessment Logic Fields
  supplyChainType: 'Direct' | 'Indirect';
  supplierCount: number;
  hasGPS: boolean;              
  hasPolygons: boolean;         
  traceabilitySystem: boolean;  
  riskAssessmentConducted: boolean;
  deforestationFreeCert: boolean;

  // Metadata
  annualVolume?: string;
  traceabilityLevel?: TraceabilityLevel;
  geolocationData?: string;
  supplyChainComplexity?: 'Simple' | 'Moderate' | 'Complex';
}

export interface ComplianceResult {
  score: number;
  riskLevel: RiskLevel;
  timestamp: string;
  missingGaps: string[];
  recommendations: string[];
  estimatedTime: string;
  detailedBreakdown?: {
    traceabilityScore: number;
    documentationScore: number;
  };
}

// --- SATELLITE ENGINE ---
export interface SatelliteAnalysisResult {
  id: string;
  status: 'Compliant' | 'Non-Compliant' | 'Warning';
  confidence: number;
  date: string;
  
  // Advanced Fields
  coordinates?: { lat: number; lng: number };
  forestLossHectares?: number;
  baselineYear?: number;
  region?: string;
  riskLevel?: string;
  tileUrl?: string;
}

// --- FARMERS & SUPPLIERS ---
export interface FarmerRecord {
  id: string;
  name: string;
  farmLocation: string;
  gpsCoordinates: string;
  landArea: number;
  status: 'Active' | 'Pending' | 'Inactive';
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  type: 'Farmer' | 'Cooperative' | 'Aggregator';
  riskTag: RiskLevel;
  lastAssessmentDate: string;
  status: 'Active' | 'Pending' | 'Blocked';
}

// --- DOCUMENTS ---
export interface GeneratedDocument {
  id: string;
  title: string;
  type: 'DDS' | 'Risk Assessment' | 'Supplier Declaration';
  referenceNumber: string;
  date: string;
  status: 'Draft' | 'Final' | 'Submitted';
  fileSize: string;
}

export interface DDSSubmission {
  id: string;
  referenceNumber: string;
  status: 'Pending' | 'Approved';
}
export interface DDSRequestData {
  companyName: string;
  hsCode: string; // e.g., '0901' for Coffee
  countryOfProduction: string; // e.g., 'India'
  certificationScheme?: string; // e.g., 'Rainforest Alliance'
  relevantLegislation?: string; // Free text
}