'use client';

import React, { useState } from 'react';
import { ComplianceResult, ExporterFormData, DocumentType, GeneratedDocument } from '@/types';
import { FileText, Download, Loader2, FileCheck, AlertOctagon, XCircle, Share2, Check, ArrowLeft } from 'lucide-react';
import { generateDocument } from '@/lib/geminiService';
import { jsPDF } from 'jspdf';

interface Props {
  formData: ExporterFormData;
  result: ComplianceResult;
  onBack: () => void;
}

// Document type definitions with metadata
const DOCUMENT_TYPES = [
  {
    type: 'Due Diligence Statement' as DocumentType,
    icon: <FileText className="text-purple-600" />,
    label: 'Due Diligence (DDS)',
    desc: 'Master TRACES template',
    color: 'purple',
  },
  {
    type: 'Supplier Declaration' as DocumentType,
    icon: <FileCheck className="text-blue-600" />,
    label: 'Supplier Warranty',
    desc: 'Legality & Deforestation Proof',
    color: 'blue',
  },
  {
    type: 'Risk Assessment' as DocumentType,
    icon: <AlertOctagon className="text-orange-600" />,
    label: 'Risk Assessment (RAR)',
    desc: 'Article 10 Audit Record',
    color: 'orange',
  },
  {
    type: 'GPS Report' as DocumentType,
    icon: <Check className="text-green-600" />,
    label: 'Evidence Checklist',
    desc: 'Operational data requirements',
    color: 'green',
  },
];

const DocumentationToolkit: React.FC<Props> = ({ formData, result, onBack }) => {
  const [loadingDoc, setLoadingDoc] = useState<DocumentType | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [currentDocType, setCurrentDocType] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (type: DocumentType) => {
    setLoadingDoc(type);
    setCurrentDocType(type);
    setGeneratedContent(null);
    setError(null);

    try {
      const content = await generateDocument(type, formData, result);
      setGeneratedContent(content);

      // Save to localStorage
      saveToHistory({
        id: generateId(),
        type: type,
        filename: `EUDR_${type.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        content: content,
        generatedAt: new Date().toISOString(),
        format: 'PDF',
        downloads: 0,
      });
    } catch (err) {
      console.error('Document generation error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate document. Please try again.'
      );
    } finally {
      setLoadingDoc(null);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent || !currentDocType) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - margin * 2;

      const fileName = `EUDR_${currentDocType.replace(/\s+/g, '_')}_${formData.companyName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

      // Header Bar
      doc.setFillColor(34, 197, 94); // green-600
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Logo/Title Area
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94);
      doc.text('NatureXpress', margin, 20);

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(currentDocType, margin, 30);

      // Metadata Box
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, 38, maxLineWidth, 28, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('EXPORTER:', margin + 5, 45);
      doc.text('ORIGIN:', margin + 5, 51);
      doc.text('DATE:', margin + 5, 57);
      doc.text('REFERENCE:', margin + 5, 63);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(formData.companyName, margin + 40, 45);
      doc.text(formData.exportCountry, margin + 40, 51);
      doc.text(new Date().toLocaleDateString(), margin + 40, 57);
      doc.text(`EUDR-${generateRefNumber()}`, margin + 40, 63);

      // Main Content
      let y = 80;
      const lineHeight = 6.5;

      const lines = generatedContent.split('\n');

      lines.forEach((line) => {
        let text = line.trim();
        if (text.length === 0) {
          y += 4;
          return;
        }

        // Reset defaults
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        // Handle headers
        if (text.startsWith('# ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(34, 197, 94);
          text = text.replace('# ', '');
          y += 5;
        } else if (text.startsWith('## ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          text = text.replace('## ', '');
          y += 4;
        } else if (text.startsWith('### ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          text = text.replace('### ', '');
          y += 3;
        } else if (text.startsWith('- ') || text.startsWith('* ')) {
          text = '  • ' + text.substring(2);
        } else if (text.startsWith('**') && text.endsWith('**')) {
          doc.setFont('helvetica', 'bold');
          text = text.replace(/\*\*/g, '');
        }

        // Clean markdown
        text = text.replace(/\*\*(.*?)\*\*/g, '\$1').replace(/\*(.*?)\*/g, '\$1');

        const splitText = doc.splitTextToSize(text, maxLineWidth);

        // Add new page if needed
        if (y + splitText.length * lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin + 10;
        }

        doc.text(splitText, margin, y);
        y += splitText.length * lineHeight;
      });

      // Footer with page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${totalPages} | NatureXpress EUDR Compliance Platform`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      doc.save(fileName);

      // Update download count
      incrementDownloadCount(currentDocType);
    } catch (err) {
      console.error('PDF export error:', err);
      setError('PDF export failed. Please try again.');
    }
  };

  const handleShare = () => {
    if (!generatedContent || !currentDocType) return;

    if (navigator.share) {
      navigator
        .share({
          title: `EUDR ${currentDocType}`,
          text: `EUDR Compliance Document: ${currentDocType} for ${formData.companyName}`,
        })
        .catch((err) => console.log('Share failed:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(generatedContent);
      alert('Document content copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
        {/* Sidebar Navigation */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div>
            <button
              onClick={onBack}
              className="text-sm font-bold text-gray-400 hover:text-green-600 mb-4 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} /> DASHBOARD
            </button>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              Regulatory Toolkit
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Generate mandatory compliance artifacts for EU Information Systems.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {DOCUMENT_TYPES.map((item) => (
              <button
                key={item.type}
                onClick={() => handleGenerate(item.type)}
                disabled={loadingDoc !== null}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex gap-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentDocType === item.type
                    ? 'bg-green-50 border-green-500 shadow-md ring-4 ring-green-500/10'
                    : 'bg-white border-gray-100 hover:border-green-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    currentDocType === item.type
                      ? 'bg-white shadow-sm'
                      : 'bg-gray-50'
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {item.label}
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-5 rounded-2xl text-white">
            <h4 className="font-bold text-sm mb-2">💡 Pro Tip</h4>
            <p className="text-xs text-green-100">
              All documents are AI-generated based on your assessment data and
              comply with EU Regulation 2023/1115.
            </p>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative">
          {/* Error Banner */}
          {error && (
            <div className="absolute top-6 inset-x-6 z-30 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-500" />
                <p className="text-sm font-bold text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 font-bold text-sm"
              >
                DISMISS
              </button>
            </div>
          )}

          {generatedContent ? (
            <>
              {/* Document Header */}
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">
                      {currentDocType}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold">
                      GENERATED {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                  >
                    <Download size={18} /> EXPORT PDF
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
                    title="Share document"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-12 selection:bg-green-100">
                <div className="max-w-3xl mx-auto bg-white min-h-full">
                  <div className="prose prose-lg max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-gray-800 antialiased">
                      {generatedContent}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              {loadingDoc ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                    <Loader2
                      className="absolute inset-0 m-auto text-green-600 animate-pulse"
                      size={32}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      Applying Legal Reasoning...
                    </h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                      AI is analyzing EU Regulation 2023/1115 to structure your{' '}
                      {loadingDoc}.
                    </p>
                  </div>
                  <div className="flex gap-1 justify-center">
                    <div
                      className="w-2 h-2 rounded-full bg-green-200 animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-green-600 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 opacity-40">
                  <div className="w-24 h-24 bg-gray-100 rounded-3xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                    <FileText size={48} className="text-gray-300" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-widest">
                      Document Lab
                    </h3>
                    <p className="text-gray-500 mt-2">
                      Select a legal artifact from the toolkit. Our AI engine
                      will synthesize a custom document based on your unique
                      assessment risk profile.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateRefNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${year}${random}`;
}

function saveToHistory(doc: GeneratedDocument): void {
  try {
    const existing = localStorage.getItem('naturexpress_documents');
    const documents: GeneratedDocument[] = existing ? JSON.parse(existing) : [];
    documents.unshift(doc);
    // Keep only last 50 documents
    const trimmed = documents.slice(0, 50);
    localStorage.setItem('naturexpress_documents', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save document to history:', error);
  }
}

function incrementDownloadCount(docType: DocumentType): void {
  try {
    const existing = localStorage.getItem('naturexpress_documents');
    if (!existing) return;

    const documents: GeneratedDocument[] = JSON.parse(existing);
    const updated = documents.map((doc) => {
      if (doc.type === docType) {
        return { ...doc, downloads: (doc.downloads || 0) + 1 };
      }
      return doc;
    });

    localStorage.setItem('naturexpress_documents', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update download count:', error);
  }
}

export default DocumentationToolkit;