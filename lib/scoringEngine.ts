// services/scoringEngine.ts

import { 
  ExporterFormData, 
  ComplianceResult, 
  ComplianceGap,
  ComplianceRecommendation,
  RiskLevel,
  PlotSize,
  ProductType,
  TraceabilityLevel,
  SupplierType,
} from '@/types';

// ============================================================================
// RISK CONFIGURATION
// ============================================================================

/**
 * Country-level deforestation risk classification
 * Based on Global Forest Watch and FAO data
 */
const COUNTRY_RISK_MAP: Record<string, 'High' | 'Medium' | 'Low'> = {
  // High Risk - Active deforestation hotspots
  "Brazil": "High",
  "Indonesia": "High",
  "Democratic Republic of Congo": "High",
  "Bolivia": "High",
  "Peru": "High",
  "Colombia": "High",
  "Cameroon": "High",
  "Myanmar": "High",
  "Ivory Coast": "High",
  "Ghana": "High",
  "Nigeria": "High",
  "Madagascar": "High",
  
  // Medium Risk - Historical or emerging concerns
  "Malaysia": "Medium",
  "Vietnam": "Medium",
  "Thailand": "Medium",
  "Laos": "Medium",
  "Cambodia": "Medium",
  "Papua New Guinea": "Medium",
  "Ecuador": "Medium",
  "Venezuela": "Medium",
  "Paraguay": "Medium",
  "Argentina": "Medium",
  "India": "Medium",
  "Tanzania": "Medium",
  "Mozambique": "Medium",
  "Zambia": "Medium",
  "Ethiopia": "Medium",
  
  // Default for unlisted countries
  "Other": "High"
};

/**
 * Commodity-specific risk factors
 * Based on EUDR Annex and scientific literature
 */
const COMMODITY_RISK_FACTORS: Record<string, { score: number; reason: string }> = {
  'Cattle': { 
    score: 30, 
    reason: "Leading driver of deforestation globally; complex indirect supply chains make traceability challenging." 
  },
  'Soya': { 
    score: 25, 
    reason: "High risk of conversion from forests and savannahs, particularly in South America." 
  },
  'Oil Palm': { 
    score: 25, 
    reason: "Historical link to large-scale deforestation in Southeast Asia and emerging risks in Africa." 
  },
  'Wood': { 
    score: 25, 
    reason: "Direct forest degradation and illegal logging risks; complex supply chains." 
  },
  'Cocoa': { 
    score: 20, 
    reason: "Risk of expansion into protected forest areas, particularly in West Africa." 
  },
  'Coffee': { 
    score: 15, 
    reason: "Risk of encroachment into highland and cloud forests; shade coffee less risky." 
  },
  'Rubber': { 
    score: 15, 
    reason: "Emerging risk driver in Southeast Asia and Africa with plantation expansion." 
  },
  'Palm Oil': { 
    score: 25, 
    reason: "Same as Oil Palm - major deforestation driver." 
  },
  'Leather': { 
    score: 28, 
    reason: "Linked to cattle farming, major deforestation driver." 
  },
  'Other': { 
    score: 10, 
    reason: "Risk varies by specific commodity; requires individual assessment." 
  },
};

// ============================================================================
// SCORING ENGINE
// ============================================================================

/**
 * Calculate comprehensive EUDR compliance score
 * 
 * @param data - Exporter form data with all risk factors
 * @returns Complete compliance assessment with score, gaps, and recommendations
 */
export const calculateComplianceScore = (data: ExporterFormData): ComplianceResult => {
  let score = 100;
  const gaps: string[] = [];
  const actions: string[] = [];
  const structuredGaps: ComplianceGap[] = [];
  const structuredRecommendations: ComplianceRecommendation[] = [];
  
  // Initialize detailed breakdown
  const breakdown = {
    countryRisk: 0,
    commodityRisk: 0,
    supplierRisk: 0,
    traceabilityRisk: 0,
    documentationRisk: 0
  };

  // ============================================================================
  // 1. COUNTRY RISK FACTOR (Max penalty: 25 points)
  // ============================================================================
  
  const countryRisk = COUNTRY_RISK_MAP[data.exportCountry] || "High";
  const countryPenalty = countryRisk === "High" ? 25 : countryRisk === "Medium" ? 15 : 5;
  breakdown.countryRisk = countryPenalty;
  score -= countryPenalty;
  
  if (countryRisk === "High") {
    gaps.push(`Sourcing from ${data.exportCountry} (High Risk Jurisdiction)`);
    actions.push(`Conduct enhanced due diligence for ${data.exportCountry} origins, including satellite monitoring and third-party verification.`);
    
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Geographic Risk',
      severity: 'High',
      description: `${data.exportCountry} is classified as a high-risk deforestation jurisdiction`,
      impact: 'May result in increased scrutiny, delayed shipments, or rejected exports to EU',
      requiredAction: 'Enhanced due diligence required for all shipments from this country'
    });
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'High',
      category: 'Legal',
      title: 'Enhanced Due Diligence for High-Risk Country',
      description: `Implement satellite monitoring and third-party audits for all ${data.exportCountry} sources`,
      estimatedCost: 5000,
      estimatedTime: 30
    });
  }

  // ============================================================================
  // 2. COMMODITY RISK WEIGHT (Max penalty: 30 points)
  // ============================================================================
  
  const productKey = data.productType;
  const commRisk = COMMODITY_RISK_FACTORS[productKey] || COMMODITY_RISK_FACTORS['Other'];
  breakdown.commodityRisk = commRisk.score;
  score -= commRisk.score;
  
  if (commRisk.score >= 20) {
    gaps.push(`High-risk commodity: ${productKey}`);
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Commodity Risk',
      severity: commRisk.score >= 25 ? 'High' : 'Medium',
      description: commRisk.reason,
      impact: 'Higher compliance requirements and potential market access restrictions',
      requiredAction: 'Implement commodity-specific risk mitigation protocols'
    });
  }

  // ============================================================================
  // 3. SUPPLIER VERIFICATION STATUS (Max penalty: 25 points)
  // ============================================================================
  
  let supplierPenalty = 0;
  
  // Check if farm is known (prioritize new field, fallback to legacy)
  const farmKnown = data.isFarmKnown ?? data.hasSupplierList ?? false;
  
  if (!farmKnown) {
    supplierPenalty = 25;
    gaps.push("Opaque Supply Chain: Unknown Farm Origin");
    actions.push("Map supply chain upstream to identify individual production plots.");
    
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Traceability',
      severity: 'Critical',
      description: 'Farm-level origin is unknown - EUDR requires traceability to production plot',
      impact: 'Cannot legally place products on EU market without plot-level traceability',
      requiredAction: 'Conduct supply chain mapping to identify all origin farms'
    });
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'Critical',
      category: 'Traceability',
      title: 'Supply Chain Mapping Required',
      description: 'Trace all products back to origin farms and collect farmer identification data',
      estimatedCost: 10000,
      estimatedTime: 60
    });
    
  } else if (data.supplierType) {
    // Evaluate supplier type risk
    switch (data.supplierType) {
      case SupplierType.Trader:
      case SupplierType.Wholesaler:
        supplierPenalty = 15;
        gaps.push("Indirect Sourcing: Reliance on Traders/Wholesalers");
        actions.push("Obtain 'Supplier Declaration' warranties from all intermediaries.");
        
        structuredRecommendations.push({
          id: crypto.randomUUID(),
          priority: 'High',
          category: 'Documentation',
          title: 'Supplier Declarations Required',
          description: 'Collect signed supplier declarations from all traders and wholesalers',
          estimatedCost: 2000,
          estimatedTime: 14
        });
        break;
        
      case SupplierType.Smallholder:
      case SupplierType.Cooperative:
        supplierPenalty = 5; 
        // These are lower risk but still require documentation
        actions.push("Verify cooperative membership and individual farmer records.");
        break;
        
      case SupplierType.DirectFarmer:
        supplierPenalty = 0;
        // Best case - direct relationship
        break;
        
      default:
        supplierPenalty = 10;
        gaps.push("Supplier type not specified");
    }
  }
  
  breakdown.supplierRisk = supplierPenalty;
  score -= supplierPenalty;

  // ============================================================================
  // 4. DEFORESTATION RISK REGION (Max penalty: 30 points)
  // ============================================================================
  
  const isHighDefRisk = data.isHighDeforestationRisk ?? data.deforestationRiskRegion ?? false;
  
  if (isHighDefRisk) {
    const defRiskPenalty = 30;
    score -= defRiskPenalty;
    breakdown.documentationRisk += 30; 
    
    gaps.push("CRITICAL: Production overlaps with active deforestation alerts (post-2020)");
    actions.push("IMMEDIATE ACTION: Segregate non-compliant plots. Do not ship products from these plots to the EU.");
    
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Deforestation Risk',
      severity: 'Critical',
      description: 'Production area shows deforestation activity after December 31, 2020 cutoff date',
      impact: 'Products from these plots are PROHIBITED from EU market under EUDR Article 3',
      requiredAction: 'IMMEDIATE: Remove non-compliant plots from supply chain'
    });
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'Critical',
      category: 'GPS',
      title: 'Emergency Plot Segregation',
      description: 'Conduct satellite analysis to identify and exclude all plots with post-2020 deforestation',
      estimatedCost: 15000,
      estimatedTime: 7
    });
  }

  // ============================================================================
  // 5. GPS & DOCUMENTATION (Max penalty: 30 points)
  // ============================================================================
  
  let docPenalty = 0;
  
  // Check GPS availability (prioritize new field, fallback to legacy)
  const gpsAvailable = data.isGpsAvailable ?? data.hasGPSData ?? false;
  
  if (!gpsAvailable) {
    docPenalty += 30;
    gaps.push("Missing Geolocation Coordinates (Mandatory - Article 9)");
    actions.push("Collect GPS points for smallholders (<4ha) or polygon coordinates for large plots (≥4ha).");
    
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Documentation',
      severity: 'Critical',
      description: 'No geolocation data provided - mandatory under EUDR Article 9(1)(a)',
      impact: 'Cannot submit Due Diligence Statement without GPS coordinates - shipments will be blocked',
      requiredAction: 'Conduct GPS survey of all production plots using WGS 84 coordinate system'
    });
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'Critical',
      category: 'GPS',
      title: 'GPS Data Collection Program',
      description: 'Deploy mobile GPS collection tools or hire surveyor to map all plots',
      estimatedCost: 8000,
      estimatedTime: 45
    });
    
  } else {
    // GPS is available - check if proper format for plot size
    if (data.plotSize === PlotSize.Large) {
      actions.push("Verify that large plots (≥4ha) are mapped using GeoJSON Polygon format, not single GPS points.");
      
      structuredRecommendations.push({
        id: crypto.randomUUID(),
        priority: 'Medium',
        category: 'GPS',
        title: 'Polygon Mapping for Large Plots',
        description: 'Convert GPS points to polygon coordinates for all plots over 4 hectares',
        estimatedCost: 3000,
        estimatedTime: 14
      });
    }
  }
  
  breakdown.documentationRisk += docPenalty;
  score -= docPenalty;

  // ============================================================================
  // 6. TRACEABILITY DEPTH (Max penalty: 30 points)
  // ============================================================================
  
  let traceabilityPenalty = 0;
  
  if (data.traceabilityLevel === TraceabilityLevel.None) {
    traceabilityPenalty = 30;
    gaps.push("No Traceability System Implemented");
    actions.push("Implement a batch-traceability system linking exports to origin plots.");
    
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Traceability',
      severity: 'Critical',
      description: 'No traceability system in place to link products to origin farms',
      impact: 'Cannot demonstrate chain of custody - high risk of audit failure',
      requiredAction: 'Implement digital or paper-based traceability system'
    });
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'Critical',
      category: 'Traceability',
      title: 'Traceability System Implementation',
      description: 'Set up batch coding and chain-of-custody documentation system',
      estimatedCost: 12000,
      estimatedTime: 60
    });
    
  } else if (data.traceabilityLevel === TraceabilityLevel.Basic) {
    traceabilityPenalty = 15;
    gaps.push("Weak Traceability (Country/Regional Level Only)");
    actions.push("Upgrade traceability to plot-level or polygon-level precision.");
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'High',
      category: 'Traceability',
      title: 'Traceability System Upgrade',
      description: 'Enhance current system to capture plot-level origin data',
      estimatedCost: 6000,
      estimatedTime: 30
    });
    
  } else if (data.traceabilityLevel === TraceabilityLevel.Advanced || data.traceabilityLevel === TraceabilityLevel.Blockchain) {
    // Good traceability
    traceabilityPenalty = 0;
  }
  
  breakdown.traceabilityRisk = traceabilityPenalty;
  score -= traceabilityPenalty;

  // ============================================================================
  // 7. LAND RECORDS & LEGAL DOCUMENTATION (Bonus/Penalty)
  // ============================================================================
  
  if (!data.hasLandRecords) {
    gaps.push("Missing land ownership/lease documentation");
    actions.push("Collect land titles, cadastral records, or lease agreements for all plots.");
    
    structuredGaps.push({
      id: crypto.randomUUID(),
      area: 'Documentation',
      severity: 'High',
      description: 'No documented proof of legal land rights',
      impact: 'Cannot verify legal production requirement under EUDR Article 2(39)',
      requiredAction: 'Obtain and verify land title deeds or lease agreements'
    });
  }
  
  if (!data.hasThirdPartyCert) {
    actions.push("Consider obtaining third-party certification (e.g., FSC, RSPO, Rainforest Alliance) to strengthen compliance.");
    
    structuredRecommendations.push({
      id: crypto.randomUUID(),
      priority: 'Low',
      category: 'Certification',
      title: 'Third-Party Certification',
      description: 'Pursue relevant sustainability certification to enhance credibility',
      estimatedCost: 15000,
      estimatedTime: 180
    });
  }

  // ============================================================================
  // FINAL SCORE CALCULATION
  // ============================================================================
  
  score = Math.max(0, Math.round(score));

  // ============================================================================
  // RISK LEVEL CLASSIFICATION
  // ============================================================================
  
  let riskLevel = RiskLevel.Low;
  if (score < 50) {
    riskLevel = RiskLevel.High;
  } else if (score < 80) {
    riskLevel = RiskLevel.Medium;
  }

  // ============================================================================
  // TIME TO COMPLIANCE ESTIMATE
  // ============================================================================
  
  let timeToCompliance = "Ready for EU Market";
  let estimatedDays = 0;
  
  if (score < 40) {
    timeToCompliance = "6+ months";
    estimatedDays = 180;
  } else if (score < 60) {
    timeToCompliance = "3-5 months";
    estimatedDays = 120;
  } else if (score < 80) {
    timeToCompliance = "1-2 months";
    estimatedDays = 45;
  } else if (score < 95) {
    timeToCompliance = "2-4 weeks";
    estimatedDays = 21;
  }

  // ============================================================================
  // IDENTIFY STRENGTHS
  // ============================================================================
  
  const strengths: string[] = [];
  
  if (gpsAvailable) strengths.push("Geolocation data available");
  if (data.hasLandRecords) strengths.push("Land ownership documentation present");
  if (data.hasThirdPartyCert) strengths.push(`Third-party certified by ${data.certificationBody || 'recognized body'}`);
  if (data.traceabilityLevel === TraceabilityLevel.Advanced || data.traceabilityLevel === TraceabilityLevel.Blockchain) {
    strengths.push("Advanced traceability system implemented");
  }
  if (farmKnown && data.supplierType === SupplierType.DirectFarmer) {
    strengths.push("Direct relationship with origin farmers");
  }
  if (countryRisk === 'Low') {
    strengths.push("Low-risk origin country");
  }

  // ============================================================================
  // RETURN COMPREHENSIVE RESULT
  // ============================================================================
  
  return {
    id: crypto.randomUUID(),
    score,
    riskLevel,
    data,
    timestamp: new Date().toISOString(),
    
    // Structured data
    recommendations: structuredRecommendations,
    gaps: structuredGaps,
    strengths,
    
    // Simple lists for quick display
    missingGaps: gaps,
    recommendedActions: [...new Set(actions)].slice(0, 8), // Deduplicate and limit
    
    // Score details
    complianceProbability: score,
    timeToCompliance,
    estimatedTimeToCompliance: estimatedDays,
    
    // Detailed breakdown
    scoreBreakdown: {
      traceability: 100 - breakdown.traceabilityRisk,
      documentation: 100 - breakdown.documentationRisk,
      gpsData: gpsAvailable ? 100 : 0,
      certification: data.hasThirdPartyCert ? 100 : 50,
      riskMitigation: 100 - breakdown.supplierRisk - breakdown.countryRisk,
      
      // New detailed fields
      countryRisk: breakdown.countryRisk,
      commodityRisk: breakdown.commodityRisk,
      supplierRisk: breakdown.supplierRisk,
      traceabilityRisk: breakdown.traceabilityRisk,
      documentationRisk: breakdown.documentationRisk,
    },
    
    detailedBreakdown: breakdown,
    
    // Next steps (prioritized actions)
    nextSteps: structuredRecommendations
      .sort((a, b) => {
        const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5)
      .map(rec => ({
        id: rec.id,
        title: rec.title,
        completed: false,
        deadline: estimatedDays > 0 
          ? new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined
      })),
  };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default calculateComplianceScore;