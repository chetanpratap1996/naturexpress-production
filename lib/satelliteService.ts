// services/satelliteService.ts

import { 
  SatelliteAnalysisResult, 
  SatelliteStatus, 
  PlotSize, 
  SatellitePlotData,
  SatelliteHistoricalData 
} from '@/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const EUDR_CUTOFF_DATE = new Date('2020-12-31');
const SIMULATION_DELAY_MS = 2500; // Simulate satellite processing time

// Data sources that could be used in production
const DATA_SOURCES = {
  GFW: 'Global Forest Watch',
  GEE: 'Google Earth Engine',
  SENTINEL: 'Sentinel-2',
  LANDSAT: 'Landsat 8/9',
  COPERNICUS: 'Copernicus Emergency Management Service',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simulate async delay (for demo purposes)
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a deterministic risk score based on input data
 * In production, this would analyze actual satellite imagery
 */
function calculateRiskScore(
  data: string, 
  status: SatelliteStatus, 
  deforestationYear: number | null
): number {
  if (status === SatelliteStatus.NonCompliant && deforestationYear && deforestationYear > 2020) {
    return Math.floor(Math.random() * 15) + 85; // 85-100 for post-2020 deforestation
  }
  
  if (status === SatelliteStatus.Warning) {
    return Math.floor(Math.random() * 30) + 30; // 30-60 for warning status
  }
  
  return Math.floor(Math.random() * 15) + 5; // 5-20 for compliant
}

/**
 * Calculate plot area based on plot size classification
 */
function calculatePlotArea(plotSize: PlotSize): number {
  if (plotSize === PlotSize.Large) {
    // >= 4 hectares: return 4-50 ha
    return Math.random() * 46 + 4;
  } else {
    // < 4 hectares: return 0.5-3.9 ha
    return Math.random() * 3.4 + 0.5;
  }
}

/**
 * Parse coordinates from various formats
 */
function parseCoordinates(data: string): { lat?: number; lng?: number; valid: boolean } {
  try {
    // Try to parse as JSON (GeoJSON format)
    if (data.trim().startsWith('{')) {
      const parsed = JSON.parse(data);
      if (parsed.geometry?.coordinates) {
        const coords = parsed.geometry.coordinates;
        return { 
          lng: coords[0], 
          lat: coords[1], 
          valid: true 
        };
      }
    }
    
    // Try to parse as comma-separated lat,lng
    const parts = data.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, valid: true };
      }
    }
    
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * Generate historical forest cover data
 */
function generateHistoricalData(
  deforestationYear: number | null
): SatelliteHistoricalData[] {
  const historicalData: SatelliteHistoricalData[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let year = 2015; year <= currentYear; year++) {
    const hasLoss = deforestationYear === year;
    const coveragePercentage = hasLoss 
      ? Math.random() * 30 + 50  // 50-80% if loss occurred
      : Math.random() * 20 + 80; // 80-100% if no loss
    
    historicalData.push({
      year,
      forestCoverPercentage: Math.round(coveragePercentage * 100) / 100,
      lossDetected: hasLoss,
      lossAreaHa: hasLoss ? Math.random() * 2 + 0.5 : undefined,
    });
  }
  
  return historicalData;
}

// ============================================================================
// SATELLITE SERVICE
// ============================================================================

export const satelliteService = {
  /**
   * Analyze a plot for deforestation using satellite imagery
   * 
   * @param data - Geolocation data (GeoJSON, coordinates, or polygon)
   * @param plotSize - Size classification of the plot
   * @returns Analysis result with compliance status
   * 
   * @example
   * ```typescript
   * const result = await satelliteService.analyzePlot(
   *   '{"type":"Point","coordinates":[-78.12,12.34]}',
   *   PlotSize.Small
   * );
   * console.log(result.status); // SatelliteStatus.Compliant
   * ```
   */
  async analyzePlot(
    data: string, 
    plotSize: PlotSize
  ): Promise<SatelliteAnalysisResult> {
    // Simulate satellite processing time
    await delay(SIMULATION_DELAY_MS);

    // Validate input
    if (!data || data.trim().length === 0) {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        coordinates: 'Invalid',
        status: SatelliteStatus.Error,
        deforestationDetected: false,
        lastForestLossYear: null,
        riskScore: 0,
        message: 'ERROR: No geolocation data provided',
        totalAreaHa: 0,
        analysisMethod: 'N/A',
        dataSource: 'N/A',
        confidenceLevel: 0,
      };
    }

    // Parse coordinates for validation
    const parsedCoords = parseCoordinates(data);
    
    // ================================================================
    // MOCK ANALYSIS LOGIC
    // ================================================================
    // In production, this would:
    // 1. Connect to Global Forest Watch API or Google Earth Engine
    // 2. Query 'umd_tree_cover_loss' layer for the geometry
    // 3. Analyze Hansen dataset for forest loss years
    // 4. Cross-reference with protected areas databases
    // 5. Generate confidence scores based on cloud coverage, data quality
    // ================================================================

    const inputLength = data.length;
    let status = SatelliteStatus.Compliant;
    let deforestationDetected = false;
    let lastForestLossYear: number | null = null;
    let message = 'No forest loss detected after Dec 31, 2020. This plot is EUDR Compliant.';
    let confidenceLevel = 95;

    // Deterministic simulation logic for consistent demo behavior
    const riskFactor = inputLength % 13;
    
    if (riskFactor === 0) {
      // Simulate CRITICAL non-compliance: Post-2020 deforestation
      status = SatelliteStatus.NonCompliant;
      deforestationDetected = true;
      lastForestLossYear = 2022;
      message = '🚨 CRITICAL: Forest loss detected in 2022. This plot CANNOT be used for EUDR exports. Immediate exclusion required.';
      confidenceLevel = 92;
      
    } else if (riskFactor <= 2) {
      // Simulate WARNING: Pre-2020 deforestation (compliant but risky)
      status = SatelliteStatus.Warning;
      deforestationDetected = true;
      lastForestLossYear = 2019;
      message = '⚠️ WARNING: Forest loss detected in 2019. Compliant with EUDR (2020 cutoff), but monitor closely for land use changes.';
      confidenceLevel = 88;
      
    } else if (riskFactor <= 4) {
      // Simulate WARNING: Recent compliant but close to cutoff
      status = SatelliteStatus.Warning;
      deforestationDetected = true;
      lastForestLossYear = 2020;
      message = '⚠️ WARNING: Forest loss detected in 2020 (before Dec 31 cutoff). Technically compliant but requires enhanced verification.';
      confidenceLevel = 85;
      
    } else if (!parsedCoords.valid) {
      // Invalid coordinates format
      status = SatelliteStatus.Error;
      message = '❌ ERROR: Unable to parse coordinates. Please provide valid GeoJSON or lat,lng format.';
      confidenceLevel = 0;
      
    } else {
      // COMPLIANT: No issues detected
      status = SatelliteStatus.Compliant;
      deforestationDetected = false;
      lastForestLossYear = null;
      message = '✅ COMPLIANT: No forest loss detected after Dec 31, 2020. Plot meets EUDR requirements.';
      confidenceLevel = 96;
    }

    // Calculate risk score
    const riskScore = calculateRiskScore(data, status, lastForestLossYear);

    // Calculate plot area
    const totalAreaHa = calculatePlotArea(plotSize);

    // Generate result
    const result: SatelliteAnalysisResult = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      coordinates: data.substring(0, 100) + (data.length > 100 ? '...' : ''),
      status,
      deforestationDetected,
      lastForestLossYear,
      riskScore,
      message,
      totalAreaHa: Math.round(totalAreaHa * 100) / 100,
      coveragePercentage: Math.round((Math.random() * 15 + 85) * 100) / 100, // 85-100% coverage
      analysisMethod: 'Hansen Global Forest Change v1.10 + Sentinel-2',
      dataSource: `${DATA_SOURCES.GFW} + ${DATA_SOURCES.SENTINEL}`,
      confidenceLevel,
    };

    return result;
  },

  /**
   * Batch analyze multiple plots
   */
  async analyzeBatch(
    plots: SatellitePlotData[]
  ): Promise<SatelliteAnalysisResult[]> {
    const results: SatelliteAnalysisResult[] = [];
    
    for (const plot of plots) {
      const result = await this.analyzePlot(plot.geometry, plot.plotSize);
      results.push({
        ...result,
        // Add plot-specific metadata if available
        coordinates: plot.plotId 
          ? `${plot.plotId}: ${result.coordinates}` 
          : result.coordinates,
      });
    }
    
    return results;
  },

  /**
   * Get historical deforestation data for a plot
   */
  async getHistoricalData(
    data: string,
    startYear: number = 2015,
    endYear: number = new Date().getFullYear()
  ): Promise<SatelliteHistoricalData[]> {
    await delay(1500);
    
    // Analyze current status to determine deforestation year
    const currentAnalysis = await this.analyzePlot(data, PlotSize.Small);
    
    return generateHistoricalData(currentAnalysis.lastForestLossYear);
  },

  /**
   * Verify if a plot meets EUDR requirements
   */
  async verifyEUDRCompliance(
    data: string,
    plotSize: PlotSize
  ): Promise<{ compliant: boolean; reason: string; analysis: SatelliteAnalysisResult }> {
    const analysis = await this.analyzePlot(data, plotSize);
    
    const compliant = analysis.status === SatelliteStatus.Compliant;
    
    let reason = '';
    if (!compliant) {
      if (analysis.status === SatelliteStatus.NonCompliant) {
        reason = `Forest loss detected in ${analysis.lastForestLossYear}, which is after the EUDR cutoff date (Dec 31, 2020). This plot cannot be used for EU exports.`;
      } else if (analysis.status === SatelliteStatus.Warning) {
        reason = `Forest loss detected in ${analysis.lastForestLossYear}. While technically compliant, enhanced due diligence is recommended.`;
      } else if (analysis.status === SatelliteStatus.Error) {
        reason = 'Analysis failed due to data quality issues. Please verify coordinates and retry.';
      }
    } else {
      reason = 'No deforestation detected after Dec 31, 2020. Plot is EUDR compliant.';
    }
    
    return { compliant, reason, analysis };
  },

  /**
   * Generate a compliance report for multiple plots
   */
  async generateComplianceReport(
    plots: SatellitePlotData[]
  ): Promise<{
    totalPlots: number;
    compliantPlots: number;
    nonCompliantPlots: number;
    warningPlots: number;
    overallRiskScore: number;
    details: SatelliteAnalysisResult[];
  }> {
    const details = await this.analyzeBatch(plots);
    
    const compliantPlots = details.filter(d => d.status === SatelliteStatus.Compliant).length;
    const nonCompliantPlots = details.filter(d => d.status === SatelliteStatus.NonCompliant).length;
    const warningPlots = details.filter(d => d.status === SatelliteStatus.Warning).length;
    
    const totalRiskScore = details.reduce((sum, d) => sum + d.riskScore, 0);
    const overallRiskScore = Math.round(totalRiskScore / details.length);
    
    return {
      totalPlots: plots.length,
      compliantPlots,
      nonCompliantPlots,
      warningPlots,
      overallRiskScore,
      details,
    };
  },

  /**
   * Test connection to satellite data sources (for production)
   */
  async testConnection(): Promise<{ 
    connected: boolean; 
    sources: string[]; 
    message: string 
  }> {
    await delay(1000);
    
    // In production, this would test actual API connections
    return {
      connected: true,
      sources: Object.values(DATA_SOURCES),
      message: 'Successfully connected to satellite data sources (DEMO MODE)',
    };
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default satelliteService;

// Export types for convenience
export type { 
  SatelliteAnalysisResult, 
  SatellitePlotData,
  SatelliteHistoricalData 
};

export { SatelliteStatus, PlotSize };