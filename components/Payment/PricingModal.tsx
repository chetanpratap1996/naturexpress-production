import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

const PricingModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade }) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    await onUpgrade();
    setProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="bg-brand-900 p-8 text-white text-center">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
          <p className="text-brand-200 mt-2">Unlock unlimited AI generation and history.</p>
        </div>

        <div className="p-8">
          <div className="flex justify-center items-baseline mb-8">
            <span className="text-5xl font-extrabold text-gray-900">$49</span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="text-green-500 shrink-0" size={20} />
              <span>Unlimited AI Document Generations</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="text-green-500 shrink-0" size={20} />
              <span>Full History & Cloud Storage</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="text-green-500 shrink-0" size={20} />
              <span>Priority Legal Compliance Updates</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check className="text-green-500 shrink-0" size={20} />
              <span>Advanced Risk Assessment Models</span>
            </li>
          </ul>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing ? (
              'Processing Payment...'
            ) : (
              <>
                <ShieldCheck size={20} /> Upgrade Now
              </>
            )}
          </button>
          <p className="text-xs text-center text-gray-400 mt-4">Secure 256-bit SSL encrypted payment. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
