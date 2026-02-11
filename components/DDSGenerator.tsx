'use client';

import React, { useState } from 'react';
import { DDSRequestData, ExporterFormData } from '@/types';
import { generateTracesXML } from '@/lib/geminiService';
import { Bot, FileCode, CheckCircle, ArrowRight, Loader2, Download, Copy, ArrowLeft } from 'lucide-react';

interface Props {
  formData: ExporterFormData | null;
  companyName: string;
  onBack: () => void;
}

const DDSGenerator: React.FC<Props> = ({ formData, companyName, onBack }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tracesRef, setTracesRef] = useState<string | null>(null);
  const [xmlOutput, setXmlOutput] = useState<string | null>(null);
  
  const [requestData, setRequestData] = useState<DDSRequestData>({
    hsCode: '',
    netMassKg: 0,
    invoiceNumber: '',
    buyerName: '',
    buyerAddress: ''
  });

  const handleInputChange = (field: keyof DDSRequestData, value: any) => {
    setRequestData((prev: DDSRequestData) => ({ ...prev, [field]: value }));
  };

  const generateRefNumber = () => {
    // Simulate EU TRACES ID format: Year + Country + Random String
    const year = new Date().getFullYear().toString().slice(-2);
    const origin = formData?.exportCountry.substring(0, 2).toUpperCase() || 'XX';
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${year}${origin}${random}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const xml = await generateTracesXML(formData, requestData, companyName);
      setXmlOutput(xml);
      setTracesRef(generateRefNumber());
      setStep(2);
    } catch (error) {
      console.error('Error generating TRACES XML:', error);
      alert('Failed to generate XML. Please check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyXML = () => {
    if (xmlOutput) {
      navigator.clipboard.writeText(xmlOutput);
      alert('XML copied to clipboard!');
    }
  };

  const handleDownloadXML = () => {
    if (!xmlOutput) return;
    const element = document.createElement("a");
    const file = new Blob([xmlOutput], {type: 'application/xml'});
    element.href = URL.createObjectURL(file);
    element.download = `EUDR_DDS_${tracesRef}.xml`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="text-green-600" size={32} />
            DDS Generator (Compliance Bot)
          </h2>
          <p className="text-gray-600 mt-1">Automated XML generation for the EU TRACES Information System.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileCode size={20} /> New TRACES Submission
            </h3>
            <p className="text-green-100 text-sm mt-1">
              Enter the shipment details to generate your unique Due Diligence Statement Reference Number.
            </p>
          </div>
          
          <form onSubmit={handleGenerate} className="p-8 space-y-8">
            {/* Shipment Details */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                Shipment Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">HS Code (6-Digit)</label>
                   <input 
                     type="text" required
                     placeholder="e.g. 441400"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                     value={requestData.hsCode}
                     onChange={(e) => handleInputChange('hsCode', e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Net Mass (kg)</label>
                   <input 
                     type="number" required
                     placeholder="e.g. 5000"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                     value={requestData.netMassKg || ''}
                     onChange={(e) => handleInputChange('netMassKg', parseFloat(e.target.value))}
                   />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Invoice Number</label>
                   <input 
                     type="text" required
                     placeholder="INV-2025-001"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                     value={requestData.invoiceNumber}
                     onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                   />
                 </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">
                Buyer Details (EU Importer)
              </h4>
              <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                   <input 
                     type="text" required
                     placeholder="European Imports S.r.l"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                     value={requestData.buyerName}
                     onChange={(e) => handleInputChange('buyerName', e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Address</label>
                   <textarea 
                     required
                     rows={2}
                     placeholder="Via Roma 123, 00100 Rome, Italy"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                     value={requestData.buyerAddress}
                     onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
                   />
                 </div>
              </div>
            </div>

            {/* Context Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Data from Assessment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                   <span className="text-gray-500 block">Operator</span>
                   <span className="font-medium text-gray-900">{formData?.companyName || companyName}</span>
                </div>
                <div>
                   <span className="text-gray-500 block">Origin</span>
                   <span className="font-medium text-gray-900">{formData?.exportCountry || 'Not specified'}</span>
                </div>
                <div>
                   <span className="text-gray-500 block">Commodity</span>
                   <span className="font-medium text-gray-900">{formData?.productType || 'Not specified'}</span>
                </div>
                <div>
                   <span className="text-gray-500 block">Geolocation</span>
                   <span className={`font-medium ${formData?.geolocationData ? 'text-green-600' : 'text-red-600'}`}>
                     {formData?.geolocationData ? 'Attached' : 'Missing'}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
               <button 
                 type="submit" 
                 disabled={isGenerating}
                 className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-70"
               >
                 {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
                 {isGenerating ? 'Connecting to TRACES...' : 'Generate DDS Reference'}
               </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && tracesRef && (
        <div className="space-y-6 animate-fade-in">
           
           {/* Success Card */}
           <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <CheckCircle size={150} className="text-green-800" />
             </div>
             
             <div className="relative z-10">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Submission Successful</h3>
                <p className="text-green-700 max-w-md mx-auto mb-6">
                  Your Due Diligence Statement has been formatted and is ready for the EU Information System.
                </p>

                <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-sm inline-block max-w-sm w-full">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">DDS Reference Number</p>
                   <p className="text-3xl font-mono font-bold text-gray-900 tracking-tight">{tracesRef}</p>
                   <p className="text-xs text-gray-400 mt-2">Add this to your invoice: {requestData.invoiceNumber}</p>
                </div>
             </div>
           </div>

           {/* XML Output */}
           <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
              <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                 <span className="text-slate-300 font-mono text-sm flex items-center gap-2">
                   <FileCode size={16} /> TRACES_XML_Payload.xml
                 </span>
                 <div className="flex gap-2">
                    <button onClick={handleCopyXML} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="Copy to Clipboard">
                      <Copy size={16} />
                    </button>
                    <button onClick={handleDownloadXML} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition-colors">
                      <Download size={14} /> Download XML
                    </button>
                 </div>
              </div>
              <div className="p-6 overflow-x-auto">
                 <pre className="text-blue-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                   {xmlOutput}
                 </pre>
              </div>
           </div>

           <div className="flex justify-center">
             <button 
               onClick={() => setStep(1)}
               className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2"
             >
               Submit Another Statement <ArrowRight size={16} />
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DDSGenerator;