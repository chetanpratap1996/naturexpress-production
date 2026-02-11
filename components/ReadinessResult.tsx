'use client';

import React, { useState } from 'react';
import { ComplianceResult, RiskLevel, ExporterFormData } from '@/types';
import {
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  FileText,
  Download,
  TrendingUp,
  Gauge,
  BarChart2,
  ThumbsUp,
  AlertCircle,
  Target,
  Award,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { jsPDF } from 'jspdf';

interface Props {
  result: ComplianceResult;
  formData: ExporterFormData;
  onProceed: () => void;
  onRetake: () => void;
}

const ReadinessResult: React.FC<Props> = ({ result, formData, onProceed, onRetake }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const isHighRisk = result.riskLevel === RiskLevel.High;
  const isMedRisk = result.riskLevel === RiskLevel.Medium;
  const isLowRisk = result.riskLevel === RiskLevel.Low;

  // Pie chart data
  const pieData = [
    { name: 'Achieved', value: result.score },
    { name: 'Gap', value: 100 - result.score },
  ];

  const COLORS = isHighRisk
    ? ['#ef4444', '#fee2e2']
    : isMedRisk
    ? ['#eab308', '#fef3c7']
    : ['#22c55e', '#dcfce7'];

  // Score breakdown for bar chart
  const breakdownData = [
    { name: 'Traceability', val: result.scoreBreakdown?.traceability || 0, max: 25 },
    { name: 'Documentation', val: result.scoreBreakdown?.documentation || 0, max: 20 },
    { name: 'GPS Data', val: result.scoreBreakdown?.gpsData || 0, max: 25 },
    { name: 'Certification', val: result.scoreBreakdown?.certification || 0, max: 15 },
    { name: 'Risk Mitigation', val: result.scoreBreakdown?.riskMitigation || 0, max: 15 },
  ];

  const handleDownloadReport = async () => {
    setIsDownloading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // Header
      doc.setFillColor(34, 197, 94); // green-600
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('NatureXpress', margin, 15);
      doc.setFontSize(12);
      doc.text('EUDR Readiness Audit Report', margin, 23);

      // Company Info Box
      let y = 45;
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 30, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPANY:', margin + 5, y + 8);
      doc.text('DATE:', margin + 5, y + 15);
      doc.text('COMMODITY:', margin + 5, y + 22);

      doc.setFont('helvetica', 'normal');
      doc.text(formData.companyName, margin + 35, y + 8);
      doc.text(new Date().toLocaleDateString(), margin + 35, y + 15);
      doc.text(`${formData.productType} from ${formData.exportCountry}`, margin + 35, y + 22);

      // Readiness Score
      y += 45;
      doc.setFillColor(
        isHighRisk ? 254 : isMedRisk ? 254 : 220,
        isHighRisk ? 226 : isMedRisk ? 243 : 252,
        isHighRisk ? 226 : isMedRisk ? 199 : 231
      );
      doc.rect(margin, y, pageWidth - margin * 2, 40, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Overall Readiness Score', margin + 10, y + 12);

      doc.setFontSize(36);
      doc.setTextColor(
        isHighRisk ? 239 : isMedRisk ? 234 : 34,
        isHighRisk ? 68 : isMedRisk ? 179 : 197,
        isHighRisk ? 68 : isMedRisk ? 8 : 94
      );
      doc.text(`${result.score}/100`, margin + 10, y + 32);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${result.riskLevel.toUpperCase()} RISK`, pageWidth - margin - 40, y + 32);

      // Score Breakdown
      y += 55;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Score Breakdown', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      breakdownData.forEach((item) => {
        doc.text(`${item.name}:`, margin + 5, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.val}/${item.max}`, pageWidth - margin - 30, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
      });

      // Gaps
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Identified Gaps', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      result.gaps.forEach((gap) => {
        const lines = doc.splitTextToSize(`• ${gap.description}`, pageWidth - margin * 2 - 10);
        doc.text(lines, margin + 5, y);
        y += lines.length * 5 + 2;
      });

      // Action Plan
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 30;
      }

      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Action Plan', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      result.recommendations.forEach((rec, i) => {
        const text = doc.splitTextToSize(`${i + 1}. ${rec.title}: ${rec.description}`, pageWidth - margin * 2 - 10);
        
        if (y + text.length * 5 > pageHeight - 30) {
          doc.addPage();
          y = 30;
        }
        
        doc.text(text, margin + 5, y);
        y += text.length * 5 + 4;
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${totalPages} | Generated by NatureXpress EUDR Compliance Platform`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `EUDR_Audit_${formData.companyName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-2 ${
              isHighRisk
                ? 'bg-red-100 text-red-800'
                : isMedRisk
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {isHighRisk ? (
              <AlertTriangle size={16} />
            ) : isMedRisk ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            Assessment Complete
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Readiness Diagnostic
          </h2>
          <p className="text-lg text-gray-600">
            Analysis for{' '}
            <span className="text-green-600 font-bold">{formData.companyName}</span>
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 text-center relative overflow-hidden h-full flex flex-col justify-center">
              {/* Top accent bar */}
              <div
                className={`absolute top-0 inset-x-0 h-2 ${
                  isHighRisk
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : isMedRisk
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
              ></div>

              {/* Pie Chart */}
              <div className="w-56 h-56 mx-auto relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={95}
                      startAngle={90}
                      endAngle={450}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-6xl font-black ${
                      isHighRisk
                        ? 'text-red-600'
                        : isMedRisk
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {result.score}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    / 100
                  </span>
                </div>
              </div>

              {/* Risk Badge */}
              <div
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mx-auto border-2 shadow-lg ${
                  isHighRisk
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isMedRisk
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                <ShieldAlert size={18} />
                {result.riskLevel.toUpperCase()} RISK
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-black text-gray-900">{result.gaps.length}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase">Gaps</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    {result.recommendations.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium uppercase">Actions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Breakdown */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <BarChart2 className="text-green-600" size={24} />
                Score Breakdown
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownData} layout="vertical">
                    <XAxis type="number" domain={[0, 25]} hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#6b7280' }}
                    />
                    <RechartsTooltip
                      formatter={(value: any, name: any, props: any) =>
                        `${value}/${props.payload.max} points`
                      }
                    />
                    <Bar dataKey="val" radius={[0, 8, 8, 0]}>
                      {breakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.val / entry.max > 0.7
                              ? '#22c55e'
                              : entry.val / entry.max > 0.4
                              ? '#eab308'
                              : '#ef4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Based on EU Regulation 2023/1115 Article 10 compliance criteria
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="text-green-700" size={20} />
                  <h4 className="font-bold text-green-900">Strengths</h4>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                      <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600" />
                      <span>{strength}</span>
                    </li>
                  ))}
                  {result.strengths.length === 0 && (
                    <li className="text-sm text-green-700 italic">No strengths identified yet</li>
                  )}
                </ul>
              </div>

              {/* Gaps */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-red-700" size={20} />
                  <h4 className="font-bold text-red-900">Critical Gaps</h4>
                </div>
                <ul className="space-y-2">
                  {result.gaps.slice(0, 3).map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                      <span>{gap.description}</span>
                    </li>
                  ))}
                  {result.gaps.length === 0 && (
                    <li className="text-sm text-red-700 italic">All criteria met!</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Action Roadmap */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <Target className="text-green-600" size={24} />
                Recommended Action Plan
              </h3>
              <div className="space-y-4">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        rec.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : rec.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : rec.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{rec.title}</p>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            rec.priority === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : rec.priority === 'High'
                              ? 'bg-orange-100 text-orange-700'
                              : rec.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      {rec.estimatedTime && (
                        <p className="text-xs text-gray-500 mt-2">
                          ⏱️ Estimated: {rec.estimatedTime} days
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 text-white rounded-3xl shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center">
                  <Award size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Assessment Complete</h4>
                  <p className="text-gray-400 text-sm">
                    Download your report or proceed to the toolkit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Download size={18} />
                  {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={onProceed}
                  className="flex-1 md:flex-initial px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 shadow-xl shadow-green-600/30 transition-all flex items-center gap-2"
                >
                  Open Toolkit
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Retake Button */}
        <div className="text-center pt-4">
          <button
            onClick={onRetake}
            className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest flex items-center gap-2 mx-auto"
          >
            ← Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadinessResult;