// types/index.ts
// ============================================================================
// NATUREXPRESS EUDR COMPLIANCE PLATFORM - COMPLETE TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// USER & AUTHENTICATION
// ----------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  email: string;
  companyName: string;
  plan: PlanTier;
  planExpiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  onboarded: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export type PlanTier = 'Free' | 'Basic' | 'Pro';

export interface PlanLimits {
  assessmentsPerMonth: number;
  suppliersLimit: number;
  satelliteChecks: number;
  documentGeneration: number;
  aiAdvisor: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export const PLAN_FEATURES: Record<PlanTier, PlanLimits> = {
  Free: {
    assessmentsPerMonth: 3,
    suppliersLimit: 5,
    satelliteChecks: 0,
    documentGeneration: 5,
    aiAdvisor: false,
    apiAccess: false,
    prioritySupport: false,
  },
  Basic: {
    assessmentsPerMonth: 25,
    suppliersLimit: 50,
    satelliteChecks: 10,
    documentGeneration: 100,
    aiAdvisor: false,
    apiAccess: false,
    prioritySupport: false,
  },
  Pro: {
    assessmentsPerMonth: 999,
    suppliersLimit: 999,
    satelliteChecks: 999,
    documentGeneration: 999,
    aiAdvisor: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

// ----------------------------------------------------------------------------
// RISK ASSESSMENT & COMPLIANCE ENUMS
// ----------------------------------------------------------------------------

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum ProductType {
  Cattle = 'Cattle',
  Soya = 'Soya',
  OilPalm = 'Oil Palm',
  Wood = 'Wood',
  Cocoa = 'Cocoa',
  Coffee = 'Coffee',
  Rubber = 'Rubber',
  PalmOil = 'Palm Oil',
  Leather = 'Leather',
  Other = 'Other',
}

export enum TraceabilityLevel {
  None = 'None',
  Basic = 'Basic',        // Country/region level
  Advanced = 'Advanced',  // Plot-level with full chain of custody
  Blockchain = 'Blockchain', // Immutable records
}

export enum SupplierType {
  DirectFarmer = 'Direct Farmer',
  Smallholder = 'Smallholder',
  Cooperative = 'Cooperative',
  Trader = 'Trader',
  Wholesaler = 'Wholesaler',
  Processor = 'Processor',
  Unknown = 'Unknown',
}

export enum PlotSize {
  Small = 'Small',  // < 4 hectares
  Large = 'Large',  // >= 4 hectares
}

// ----------------------------------------------------------------------------
// EXPORTER FORM DATA
// ----------------------------------------------------------------------------

export interface ExporterFormData {
  // Company Information
  companyName: string;
  exportCountry: string;
  productType: string;
  annualVolume: string;
  
  // Compliance Capabilities
  hasSupplierList: boolean;
  hasGPSData: boolean;
  hasLandRecords: boolean;
  hasThirdPartyCert: boolean;
  
  // Optional Details
  geolocationData?: string;
  supplierCount?: number;
  certificationBody?: string;
  certificationDate?: string;
  
  // Additional Risk Factors
  deforestationRiskRegion?: boolean;
  supplyChainComplexity?: 'Simple' | 'Moderate' | 'Complex';
  traceabilitySystem?: string;
  
  // ============================================================================
  // ENHANCED FIELDS FOR SCORING ENGINE
  // ============================================================================
  
  // Farm & Supplier Verification
  isFarmKnown?: boolean;          // Do you know the origin farm?
  supplierType?: SupplierType;    // Type of supplier relationship
  
  // Deforestation Risk
  isHighDeforestationRisk?: boolean; // Is production in high-risk deforestation zone?
  
  // GPS & Location
  isGpsAvailable?: boolean;       // Alias for hasGPSData (for backward compatibility)
  plotSize?: PlotSize;            // Size classification of plots
  
  // Traceability Depth
  traceabilityLevel?: TraceabilityLevel; // Depth of traceability system
}

// ----------------------------------------------------------------------------
// COMPLIANCE ASSESSMENT TYPES
// ----------------------------------------------------------------------------

export interface ComplianceGap {
  id: string;
  area: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  requiredAction: string;
  recommendation?: string;
}

export interface ComplianceRecommendation {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Documentation' | 'Traceability' | 'GPS' | 'Certification' | 'Legal';
  title: string;
  description: string;
  estimatedCost?: number;
  estimatedTime?: number; // in days
}

export interface ComplianceScoreBreakdown {
  traceability: number;
  documentation: number;
  gpsData: number;
  certification: number;
  riskMitigation: number;
  
  // Enhanced breakdown for scoring engine
  countryRisk?: number;
  commodityRisk?: number;
  supplierRisk?: number;
  traceabilityRisk?: number;
  documentationRisk?: number;
}

export interface ActionItem {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
}

export interface ComplianceResult {
  id: string;
  score: number;
  riskLevel: RiskLevel;
  data: ExporterFormData;
  timestamp: string;
  
  // Analysis Details
  recommendations: ComplianceRecommendation[];
  gaps: ComplianceGap[];
  strengths: string[];
  
  // Scoring Breakdown
  scoreBreakdown: ComplianceScoreBreakdown;
  
  // Action Items
  nextSteps: ActionItem[];
  estimatedTimeToCompliance?: number; // in days
  
  // ============================================================================
  // ENHANCED FIELDS FOR SCORING ENGINE OUTPUT
  // ============================================================================
  
  // Simple Gap & Action Lists (for quick display)
  missingGaps?: string[];           // Array of gap descriptions
  recommendedActions?: string[];    // Array of action descriptions
  
  // Probability & Time Estimates
  complianceProbability?: number;   // 0-100 score
  timeToCompliance?: string;        // "Ready", "2-4 weeks", "3-5 months", etc.
  
  // Detailed Risk Breakdown
  detailedBreakdown?: {
    countryRisk: number;
    commodityRisk: number;
    supplierRisk: number;
    traceabilityRisk: number;
    documentationRisk: number;
  };
}

// ----------------------------------------------------------------------------
// SUPPLIERS
// ----------------------------------------------------------------------------

export interface Supplier {
  id: string;
  name: string;
  location: string;
  country: string;
  productType: string;
  
  // GPS & Location Data
  gpsAvailable: boolean;
  gpsCoordinates?: string;
  landArea?: number; // in hectares
  landRecords?: boolean;
  
  // Risk Assessment
  riskTag: RiskLevel;
  riskFactors?: string[];
  lastVerified?: string;
  
  // Compliance Documents
  documents?: SupplierDocument[];
  
  // Contact & Notes
  contactPerson?: string;
  email?: string;
  phone?: string;
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

export interface SupplierDocument {
  id: string;
  type: 'Certificate' | 'GPS Report' | 'Land Record' | 'Other';
  filename: string;
  uploadedAt: string;
  url?: string;
  verified: boolean;
}

// ----------------------------------------------------------------------------
// FARMERS & LAND RECORDS
// ----------------------------------------------------------------------------

export interface FarmerRecord {
  id: string;
  name: string;
  farmLocation: string;
  country?: string;
  gpsCoordinates: string;
  
  // Land Details
  landArea: number; // in hectares
  landOwnershipType: 'Owned' | 'Leased' | 'Community';
  registrationNumber?: string;
  
  // EUDR-specific fields
  landRecordType?: string; // RTC, Patta, Deed, etc.
  landRecordFileName?: string;
  hasHarvestRights?: boolean;
  cropScientificName?: string;
  
  // Certifications
  certifications?: Certification[];
  
  // Verification
  lastVerified: string;
  verifiedBy?: string;
  status: 'Active' | 'Pending' | 'Inactive';
  
  // Deforestation Check
  deforestationCheckPassed?: boolean;
  lastDeforestationCheck?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
}

// ----------------------------------------------------------------------------
// SATELLITE ANALYSIS TYPES
// ----------------------------------------------------------------------------

export enum SatelliteStatus {
  Compliant = 'Compliant',
  Warning = 'Warning',
  NonCompliant = 'NonCompliant',
  Processing = 'Processing',
  Error = 'Error',
}

export interface SatelliteAnalysisResult {
  id: string;
  timestamp: string;
  coordinates: string;
  status: SatelliteStatus;
  deforestationDetected: boolean;
  lastForestLossYear: number | null;
  riskScore: number; // 0-100
  message: string;
  totalAreaHa: number;
  coveragePercentage?: number;
  analysisMethod?: string;
  dataSource?: string;
  confidenceLevel?: number;
}

export interface SatellitePlotData {
  geometry: string; // GeoJSON or coordinate string
  plotSize: PlotSize;
  plotId?: string;
  farmerId?: string;
  commodity?: string;
}

export interface SatelliteHistoricalData {
  year: number;
  forestCoverPercentage: number;
  lossDetected: boolean;
  lossAreaHa?: number;
}

export interface SatelliteVerification {
  id: string;
  coordinates: string;
  verificationDate: string;
  
  // Analysis Results
  deforestationDetected: boolean;
  riskScore: number; // 0-100
  confidence: number; // 0-100
  
  // Details
  details: string;
  alertLevel: 'None' | 'Low' | 'Medium' | 'High';
  forestCoverChange?: number; // percentage
  
  // Imagery
  satelliteProvider?: 'Sentinel' | 'Landsat' | 'Planet';
  imageDate?: string;
  imageUrl?: string;
  
  // Metadata
  createdAt: string;
}

// ----------------------------------------------------------------------------
// DDS & TRACES SUBMISSION
// ----------------------------------------------------------------------------

export interface DDSRequestData {
  // Shipment Details
  hsCode: string;
  netMassKg: number;
  invoiceNumber: string;
  shipmentDate?: string;
  
  // Buyer Information
  buyerName: string;
  buyerAddress: string;
  buyerCountry?: string;
  buyerEORI?: string; // EU Economic Operator Registration and Identification
  
  // Additional Details
  portOfEntry?: string;
  transportMode?: 'Sea' | 'Air' | 'Land' | 'Rail' | string;
}

export interface DDSSubmission {
  id: string;
  referenceNumber: string;
  requestData: DDSRequestData;
  formData: ExporterFormData;
  xmlOutput: string;
  
  // Status
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  submittedAt?: string;
  approvedAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------------
// DOCUMENTS & GENERATION
// ----------------------------------------------------------------------------

export interface GeneratedDocument {
  id: string;
  type: DocumentType;
  filename: string;
  generatedAt: string;
  
  // Content
  content?: string;
  url?: string;
  
  // Related Entities
  assessmentId?: string;
  supplierId?: string;
  ddsId?: string;
  
  // Metadata
  format: 'PDF' | 'XML' | 'DOCX' | 'XLSX';
  size?: number; // in bytes
  downloads: number;
}

export type DocumentType = 
  | 'Due Diligence Statement'
  | 'Supplier Declaration'
  | 'Risk Assessment'
  | 'GPS Report'
  | 'DDS'
  | 'Traceability Report'
  | 'Compliance Certificate';

// ----------------------------------------------------------------------------
// PRICING & SUBSCRIPTIONS
// ----------------------------------------------------------------------------

export interface PricingPlan {
  tier: PlanTier;
  name: string;
  price: number;
  currency: 'USD' | 'EUR';
  billingPeriod: 'monthly' | 'annual';
  features: string[];
  limits: PlanLimits;
  stripePriceId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
}

// ----------------------------------------------------------------------------
// NOTIFICATIONS & ALERTS
// ----------------------------------------------------------------------------

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ComplianceAlert {
  id: string;
  severity: RiskLevel;
  category: 'Supplier' | 'Document' | 'Assessment' | 'Subscription';
  title: string;
  description: string;
  requiresAction: boolean;
  dueDate?: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// API RESPONSES
// ----------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// FORM VALIDATION
// ----------------------------------------------------------------------------

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: ValidationError[];
}

// ----------------------------------------------------------------------------
// DASHBOARD STATISTICS
// ----------------------------------------------------------------------------

export interface DashboardStats {
  // Overview
  totalAssessments: number;
  averageReadiness: number;
  totalSuppliers: number;
  highRiskSuppliers: number;
  
  // Recent Activity
  recentAssessments: ComplianceResult[];
  pendingActions: ActionItem[];
  upcomingDeadlines: ActionItem[];
  
  // Compliance Metrics
  documentationComplete: number; // percentage
  supplierCoverage: number; // percentage
  gpsDataAvailable: number; // percentage
  
  // Usage Stats
  assessmentsThisMonth: number;
  assessmentsRemaining: number;
  satelliteChecksUsed: number;
  satelliteChecksRemaining: number;
}

// ----------------------------------------------------------------------------
// STORAGE KEYS
// ----------------------------------------------------------------------------

export const STORAGE_KEYS = {
  USER: 'naturexpress_user',
  REPORTS: 'naturexpress_reports',
  DOCUMENTS: 'naturexpress_documents',
  SUPPLIERS: 'naturexpress_suppliers',
  FARMERS: 'naturexpress_farmers',
  DDS_SUBMISSIONS: 'naturexpress_dds',
  NOTIFICATIONS: 'naturexpress_notifications',
  PREFERENCES: 'naturexpress_preferences',
} as const;

// ----------------------------------------------------------------------------
// UTILITY TYPES
// ----------------------------------------------------------------------------

export type Timestamp = string; // ISO 8601 format
export type UUID = string;
export type EmailAddress = string;
export type Currency = 'USD' | 'EUR' | 'GBP';

// Partial update types
export type PartialUpdate<T> = Partial<T> & { id: string };

// Filter types
export interface FilterOptions {
  search?: string;
  riskLevel?: RiskLevel;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ----------------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------------

export const RISK_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.Low]: 'green',
  [RiskLevel.Medium]: 'yellow',
  [RiskLevel.High]: 'red',
};

export const PRODUCT_TYPES = [
  'Coffee',
  'Wood',
  'Cocoa',
  'Rubber',
  'Palm Oil',
  'Leather',
  'Furniture',
  'Handicrafts',
  'Cattle',
  'Soya',
  'Other',
] as const;

export const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden',
] as const;

export const EUDR_COMPLIANCE_DEADLINE = '2025-12-30';
export const EUDR_CUTOFF_DATE = '2020-12-31';

// ----------------------------------------------------------------------------
// TYPE GUARDS
// ----------------------------------------------------------------------------

export function isHighRisk(level: RiskLevel): boolean {
  return level === RiskLevel.High;
}

export function isPaidPlan(plan: PlanTier): boolean {
  return plan === 'Basic' || plan === 'Pro';
}

export function hasFeatureAccess(userPlan: PlanTier, feature: keyof PlanLimits): boolean {
  return PLAN_FEATURES[userPlan][feature] === true;
}

export function isSatelliteCompliant(status: SatelliteStatus): boolean {
  return status === SatelliteStatus.Compliant;
}

export function requiresImmediateAction(gap: ComplianceGap): boolean {
  return gap.severity === 'Critical' || gap.severity === 'High';
}

// ----------------------------------------------------------------------------
// COMPATIBILITY EXPORTS
// ----------------------------------------------------------------------------

// Re-export for backward compatibility and service integration
export type {
  SatelliteAnalysisResult as SatelliteResult,
  SatellitePlotData as PlotData,
  SatelliteHistoricalData as HistoricalData,
};