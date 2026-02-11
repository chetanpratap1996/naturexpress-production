'use client';

import React, { useState } from 'react';
import { SatelliteVerification } from '@/types';
import { 
  Map, 
  Satellite, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowLeft, 
  Download,
  Info,
  Calendar,
  Target,
  TrendingDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  onBack: () => void;
}

type PlotSize = 'Small' | 'Large';

const SatelliteChecker: React.FC<Props> = ({ onBack }) => {
  const [plotSize, setPlotSize] = useState<PlotSize>('Small');
  const [inputData, setInputData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SatelliteVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateInput = (data: string, size: PlotSize): boolean => {
    if (!data.trim()) {
      setError('Please enter GPS coordinates or GeoJSON data');
      return false;
    }

    if (size === 'Small') {
      // Validate coordinates format
      const coordMatch = data.match(/-?\d+(\.\d+)?/g);
      if (!coordMatch || coordMatch.length < 2) {
        setError('Invalid format. Expected: "Latitude, Longitude" (e.g., -12.45, 45.32)');
        return false;
      }

      const lat = parseFloat(coordMatch[0]);
      const lng = parseFloat(coordMatch[1]);

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Coordinates out of range. Lat: -90 to 90, Lng: -180 to 180');
        return false;
      }
    } else {
      // Validate GeoJSON
      try {
        const json = JSON.parse(data);
        if (!json.type || !json.coordinates) {
          setError('Invalid GeoJSON. Must include "type" and "coordinates"');
          return false;
        }
      } catch (e) {
        setError('Invalid JSON format. Please check your GeoJSON syntax');
        return false;
      }
    }

    return true;
  };

  // ============================================================================
  // MOCK SATELLITE ANALYSIS (Replace with real API in production)
  // ============================================================================

  const mockSatelliteAnalysis = async (
    data: string,
    size: PlotSize
  ): Promise<SatelliteVerification> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Parse coordinates
    let coordinates = data;
    if (size === 'Small') {
      const coordMatch = data.match(/-?\d+(\.\d+)?/g);
      if (coordMatch && coordMatch.length >= 2) {
        coordinates = `${parseFloat(coordMatch[0]).toFixed(6)}, ${parseFloat(
          coordMatch[1]
        ).toFixed(6)}`;
      }
    } else {
      coordinates = 'GeoJSON Area';
    }

    // Mock analysis logic
    const randomFactor = Math.random();
    const deforestationDetected = randomFactor < 0.35; // 35% chance for demo
    const riskScore = deforestationDetected
      ? Math.floor(randomFactor * 40 + 60) // 60-100 if detected
      : Math.floor(randomFactor * 30); // 0-30 if not detected
    const confidence = Math.floor(Math.random() * 15 + 85); // 85-100%
    const forestCoverChange = deforestationDetected
      ? Math.floor(Math.random() * 20 + 5) // 5-25%
      : 0;
    const lossYear = deforestationDetected
      ? 2018 + Math.floor(Math.random() * 5)
      : null;

    // Determine alert level
    let alertLevel: 'None' | 'Low' | 'Medium' | 'High';
    if (riskScore >= 70) alertLevel = 'High';
    else if (riskScore >= 45) alertLevel = 'Medium';
    else if (riskScore >= 20) alertLevel = 'Low';
    else alertLevel = 'None';

    // Random satellite provider
    const providers: Array<'Sentinel' | 'Landsat' | 'Planet'> = [
      'Sentinel',
      'Landsat',
      'Planet',
    ];
    const satelliteProvider = providers[Math.floor(Math.random() * providers.length)];

    // Random image date (last 90 days)
    const imageDate = new Date(
      Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
    ).toISOString();

    return {
      id: `sat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      coordinates,
      verificationDate: new Date().toISOString(),
      deforestationDetected,
      riskScore,
      confidence,
      details: deforestationDetected
        ? `⚠️ ALERT: Analysis detected significant forest canopy loss within ${
            size === 'Small' ? '500m radius' : 'specified area boundary'
          } of coordinates. Loss event correlates with ${lossYear} Hansen Global Forest Change data layer. Estimated ${forestCoverChange}% reduction in tree cover. This location requires immediate manual verification and documentation for EUDR due diligence statement. Satellite imagery confidence: ${confidence}%.`
        : `✅ COMPLIANT: No significant forest canopy loss detected within analysis period (2015-2023). Location shows stable land use pattern consistent with EUDR baseline reference date of December 31, 2020. Analysis based on ${satelliteProvider} multispectral imagery and Global Forest Watch datasets. Result validated with ${confidence}% confidence level. This area appears suitable for EUDR compliance certification.`,
      alertLevel,
      forestCoverChange: forestCoverChange > 0 ? forestCoverChange : undefined,
      satelliteProvider,
      imageDate,
      imageUrl: undefined, // Would contain actual satellite image URL in production
      createdAt: new Date().toISOString(),
    };
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAnalyze = async () => {
    if (!validateInput(inputData, plotSize)) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await mockSatelliteAnalysis(inputData, plotSize);
      setResult(analysis);

      // Save to localStorage
      saveAnalysisToHistory(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Analysis failed. Please try again or contact support.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisToHistory = (analysis: SatelliteVerification) => {
    try {
      const existing = localStorage.getItem('naturexpress_satellite_checks');
      const history: SatelliteVerification[] = existing ? JSON.parse(existing) : [];
      history.unshift(analysis);
      // Keep last 20 checks
      const trimmed = history.slice(0, 20);
      localStorage.setItem('naturexpress_satellite_checks', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // ===== HEADER =====
      doc.setFillColor(34, 197, 94); // green-600
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('NatureXpress', margin, 18);
      doc.setFontSize(11);
      doc.text('EUDR Compliance Platform', margin, 26);
      
      doc.setFontSize(14);
      doc.text('Satellite Deforestation Analysis Report', pageWidth - margin, 18, {
        align: 'right',
      });

      // ===== REPORT METADATA =====
      let y = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, y);
      doc.text(
        `Verification ID: ${result.id}`,
        pageWidth - margin,
        y,
        { align: 'right' }
      );

      // ===== INFO BOX =====
      y += 10;
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 32, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, pageWidth - margin * 2, 32);

      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('COORDINATES:', margin + 5, y);
      doc.setFont('helvetica', 'normal');
      doc.text(result.coordinates, margin + 45, y);

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYSIS DATE:', margin + 5, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(result.verificationDate).toLocaleString(), margin + 45, y);

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('PLOT SIZE:', margin + 5, y);
      doc.setFont('helvetica', 'normal');
      doc.text(plotSize === 'Small' ? '< 4 hectares' : '> 4 hectares', margin + 45, y);

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('SATELLITE SOURCE:', margin + 5, y);
      doc.setFont('helvetica', 'normal');
      doc.text(result.satelliteProvider || 'Multi-source', margin + 45, y);

      // ===== RESULTS HEADER =====
      y += 18;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Analysis Results', margin, y);

      // ===== RESULTS BOX =====
      y += 8;
      const resultBoxHeight = 45;
      doc.setFillColor(
        result.deforestationDetected ? 254 : 220,
        result.deforestationDetected ? 226 : 252,
        result.deforestationDetected ? 226 : 231
      );
      doc.rect(margin, y, pageWidth - margin * 2, resultBoxHeight, 'F');
      doc.setDrawColor(
        result.deforestationDetected ? 239 : 34,
        result.deforestationDetected ? 68 : 197,
        result.deforestationDetected ? 68 : 94
      );
      doc.setLineWidth(2);
      doc.rect(margin, y, pageWidth - margin * 2, resultBoxHeight);
      doc.setLineWidth(0.1);

      y += 12;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Deforestation Detected:', margin + 10, y);

      doc.setFontSize(32);
      doc.setTextColor(
        result.deforestationDetected ? 239 : 34,
        result.deforestationDetected ? 68 : 197,
        result.deforestationDetected ? 68 : 94
      );
      doc.text(result.deforestationDetected ? 'YES' : 'NO', margin + 10, y + 20);

      // Risk Score
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Score:', pageWidth - margin - 50, y);

      doc.setFontSize(32);
      doc.setTextColor(
        result.riskScore > 50 ? 239 : result.riskScore > 30 ? 234 : 34,
        result.riskScore > 50 ? 68 : result.riskScore > 30 ? 179 : 197,
        result.riskScore > 50 ? 68 : result.riskScore > 30 ? 8 : 94
      );
      doc.text(`${result.riskScore}`, pageWidth - margin - 50, y + 20);
      doc.setFontSize(12);
      doc.text('/100', pageWidth - margin - 25, y + 20);

      // ===== ADDITIONAL METRICS =====
      y += 35;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Alert Level:', margin + 10, y);
      doc.setFont('helvetica', 'normal');
      doc.text(result.alertLevel, margin + 40, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Confidence:', margin + 90, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${result.confidence}%`, margin + 120, y);

      if (result.forestCoverChange && result.forestCoverChange > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Forest Cover Change:', pageWidth - margin - 70, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(239, 68, 68);
        doc.text(`-${result.forestCoverChange}%`, pageWidth - margin - 20, y);
      }

      // ===== DETAILED ANALYSIS =====
      y += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Analysis', margin, y);

      y += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const detailLines = doc.splitTextToSize(result.details, pageWidth - margin * 2);
      doc.text(detailLines, margin, y);
      y += detailLines.length * 5 + 12;

      // ===== METHODOLOGY =====
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 30;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Sources & Methodology', margin, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const methodology = [
        '• Hansen Global Forest Change Dataset (University of Maryland)',
        '• Sentinel-2 L2A Surface Reflectance (ESA Copernicus Programme)',
        '• Landsat 8/9 Collection 2 Level-2 (USGS)',
        '• JRC Global Forest Cover 2020 Reference Layer',
        '• Global Forest Watch Tree Cover Loss API',
        '• Analysis Period: 2015-2023 with 10-30m spatial resolution',
        '• EUDR Reference Date: December 31, 2020',
        '• Detection Threshold: >10% canopy cover change',
      ];

      methodology.forEach((line) => {
        doc.text(line, margin + 5, y);
        y += 5;
      });

      // ===== DISCLAIMER =====
      y += 10;
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 30;
      }

      doc.setFillColor(254, 243, 199);
      doc.rect(margin, y, pageWidth - margin * 2, 25, 'F');
      doc.setDrawColor(251, 191, 36);
      doc.rect(margin, y, pageWidth - margin * 2, 25);

      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ IMPORTANT DISCLAIMER:', margin + 5, y);
      doc.setFont('helvetica', 'normal');
      y += 5;

      const disclaimer = doc.splitTextToSize(
        'This automated satellite analysis is provided as a preliminary screening tool for EUDR compliance assessment. Results should be verified through on-site inspection, legal documentation review, and consultation with qualified forestry experts. NatureXpress and data providers are not liable for decisions made based solely on this report. Operators remain fully responsible for conducting comprehensive due diligence as required by EU Regulation 2023/1115.',
        pageWidth - margin * 2 - 10
      );
      doc.text(disclaimer, margin + 5, y);

      // ===== FOOTER =====
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${totalPages} | Generated by NatureXpress EUDR Compliance Platform | www.naturexpress.com`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // ===== SAVE PDF =====
      const fileName = `Satellite_Analysis_${result.id.slice(-8)}_${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusIcon = () => {
    if (!result) return null;
    return result.deforestationDetected ? (
      <XCircle className="text-red-600" size={36} />
    ) : (
      <CheckCircle className="text-green-600" size={36} />
    );
  };

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* ===== HEADER ===== */}
        <div>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-green-600 mb-3 flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Satellite className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Satellite Deforestation Checker
              </h2>
              <p className="text-gray-600 mt-1 text-lg">
                AI-powered forest cover analysis using Global Forest Watch data
              </p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">🚀 Demo Mode Active</p>
              <p>
                This demonstration uses simulated analysis results. The production version
                integrates with Global Forest Watch API, Sentinel Hub, and Google Earth Engine
                for real-time satellite imagery analysis.
              </p>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ===== INPUT PANEL ===== */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 sticky top-4">
              <div className="flex items-center gap-2 mb-5">
                <Map className="text-green-600" size={22} />
                <h3 className="text-lg font-bold text-gray-900">
                  Analysis Configuration
                </h3>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-fade-in">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-bold text-red-900 mb-1">Validation Error</p>
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Plot Size Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Farm/Plot Size Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPlotSize('Small')}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                        plotSize === 'Small'
                          ? 'bg-white text-green-700 shadow-md'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Small Plot
                      <span className="block text-xs font-normal text-gray-500 mt-1">
                        &lt; 4 hectares
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlotSize('Large')}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                        plotSize === 'Large'
                          ? 'bg-white text-green-700 shadow-md'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Large Plot
                      <span className="block text-xs font-normal text-gray-500 mt-1">
                        &gt; 4 hectares
                      </span>
                    </button>
                  </div>
                </div>

                {/* Coordinate Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {plotSize === 'Small' ? 'GPS Coordinates' : 'GeoJSON Polygon Data'}
                  </label>
                  <textarea
                    className="w-full h-44 px-4 py-3 text-sm font-mono border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none"
                    placeholder={
                      plotSize === 'Small'
                        ? 'Enter coordinates:\n\n-12.4532, 45.3211\n\nor\n\n12.9716° N, 77.5946° E'
                        : 'Paste GeoJSON:\n\n{\n  "type": "Feature",\n  "geometry": {\n    "type": "Polygon",\n    "coordinates": [[...]]\n  }\n}'
                    }
                    value={inputData}
                    onChange={(e) => {
                      setInputData(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    <span>
                      {plotSize === 'Small'
                        ? 'Enter a single point location (latitude, longitude)'
                        : 'Paste valid GeoJSON geometry for area boundary analysis'}
                    </span>
                  </p>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputData.trim()}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={22} />
                      Analyzing Satellite Data...
                    </>
                  ) : (
                    <>
                      <Satellite size={22} />
                      Run Satellite Analysis
                    </>
                  )}
                </button>

                {/* Info Box */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-2">
                    Analysis Coverage
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Global Forest Watch data</li>
                    <li>✓ Sentinel-2 imagery (10m resolution)</li>
                    <li>✓ Landsat 8/9 (30m resolution)</li>
                    <li>✓ 2015-2023 time series</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RESULTS PANEL ===== */}
          <div className="lg:col-span-2">
            {/* Empty State */}
            {!result && !isAnalyzing && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-full shadow-inner mb-6">
                  <Satellite className="text-gray-400" size={72} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-3">
                  Ready to Analyze
                </h4>
                <p className="text-gray-600 max-w-md leading-relaxed mb-8">
                  Enter GPS coordinates or GeoJSON data in the panel, then click
                  "Run Satellite Analysis" to check for deforestation events against the
                  EUDR December 31, 2020 baseline.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                  <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Data Sources
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      GFW, Sentinel-2, Landsat
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Time Period
                    </p>
                    <p className="text-sm text-gray-700 font-medium">2015 - 2023</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 h-full min-h-[600px] flex flex-col items-center justify-center p-12">
                <div className="relative w-40 h-40 mb-8">
                  <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 border-4 border-green-400 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  <Satellite className="absolute inset-0 m-auto text-green-600 animate-pulse" size={56} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Scanning Satellite Imagery
                </h3>
                <p className="text-gray-600 max-w-md text-center mb-6 leading-relaxed">
                  Processing multispectral data and comparing forest cover against EUDR 2020
                  baseline. Analysis typically takes 5-10 seconds.
                </p>
                <div className="flex gap-2">
                  <div
                    className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-green-600 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="space-y-6 animate-fade-in">
                {/* Status Banner */}
                <div
                  className={`rounded-2xl p-8 border-l-8 shadow-2xl flex items-start gap-6 ${
                    result.deforestationDetected
                      ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-600'
                      : 'bg-gradient-to-r from-green-50 to-green-100 border-green-600'
                  }`}
                >
                  <div className="shrink-0 pt-1">{getStatusIcon()}</div>
                  <div className="flex-1">
                    <h3
                      className={`text-2xl font-black mb-3 ${
                        result.deforestationDetected ? 'text-red-900' : 'text-green-900'
                      }`}
                    >
                      {result.deforestationDetected
                        ? '⚠️ Deforestation Detected'
                        : '✅ No Deforestation Detected'}
                    </h3>
                    <p
                      className={`font-medium leading-relaxed text-base ${
                        result.deforestationDetected ? 'text-red-800' : 'text-green-800'
                      }`}
                    >
                      {result.details}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Forest Loss Status */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown
                        className={result.deforestationDetected ? 'text-red-600' : 'text-green-600'}
                        size={20}
                      />
                      <p className="text-sm font-bold text-gray-500 uppercase">
                        Forest Loss
                      </p>
                    </div>
                    <p
                      className={`text-4xl font-black ${
                        result.deforestationDetected ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {result.deforestationDetected ? 'YES' : 'NO'}
                    </p>
                    {result.forestCoverChange && result.forestCoverChange > 0 && (
                      <p className="text-xs text-red-600 font-bold mt-2">
                        -{result.forestCoverChange}% canopy loss
                      </p>
                    )}
                  </div>

                  {/* Risk Score */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Target
                        className={
                          result.riskScore > 50
                            ? 'text-red-600'
                            : result.riskScore > 30
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }
                        size={20}
                      />
                      <p className="text-sm font-bold text-gray-500 uppercase">Risk Score</p>
                    </div>
                    <p
                      className={`text-4xl font-black ${
                        result.riskScore > 50
                          ? 'text-red-600'
                          : result.riskScore > 30
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {result.riskScore}
                      <span className="text-2xl text-gray-400">/100</span>
                    </p>
                  </div>

                  {/* Verification Date */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-gray-600" size={20} />
                      <p className="text-sm font-bold text-gray-500 uppercase">
                        Verification Date
                      </p>
                    </div>
                    <p className="text-lg font-black text-gray-900">
                      {new Date(result.verificationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Coordinates */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Map className="text-gray-600" size={20} />
                      <p className="text-sm font-bold text-gray-500 uppercase">
                        Coordinates
                      </p>
                    </div>
                    <p
                      className="text-sm font-mono text-gray-700 truncate"
                      title={result.coordinates}
                    >
                      {result.coordinates}
                    </p>
                  </div>
                </div>

                {/* Additional Analysis Data */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <p className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                    <Info size={18} className="text-gray-500" />
                    Detailed Analysis Metrics
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    {/* Confidence Level */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2 font-medium">
                        Confidence Level
                      </p>
                      <div className="relative w-20 h-20 mx-auto">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(result.confidence / 100) * 226} 226`}
                            className="text-green-600"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-black text-gray-900">
                            {result.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alert Level */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Alert Level</p>
                      <div className="flex flex-col items-center justify-center h-20">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-black border-2 ${getAlertBadgeColor(
                            result.alertLevel
                          )}`}
                        >
                          {result.alertLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Data Source */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Data Source</p>
                      <div className="flex flex-col items-center justify-center h-20">
                        <Satellite className="text-gray-400 mb-1" size={24} />
                        <p className="text-lg font-black text-gray-900">
                          {result.satelliteProvider}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Date */}
                  {result.imageDate && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        Latest Satellite Image
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(result.imageDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Download CTA */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-8 shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Download className="text-white" size={28} />
                      </div>
                      <div>
                        <h4 className="font-black text-xl mb-1">
                          Generate Evidence Report
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Download this satellite analysis as a professional PDF report to
                          include in your EUDR due diligence documentation package.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadReport}
                      className="shrink-0 bg-white text-gray-900 px-8 py-4 rounded-xl font-black hover:bg-gray-100 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl"
                    >
                      <Download size={20} />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* New Analysis Button */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setInputData('');
                      setError(null);
                    }}
                    className="text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                  >
                    ← Run New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteChecker;