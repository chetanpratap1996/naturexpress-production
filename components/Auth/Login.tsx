import React, { useState } from 'react';
import { Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onLogin: (email: string, company: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate slight network delay handled by parent or service
    await onLogin(email, company);
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-100 relative">
             <Sprout className="text-brand-600 absolute top-3" size={32} />
             <div className="absolute bottom-4 w-8 h-4 border-b-2 border-brand-600 rounded-b-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to <span className="text-brand-600">Naturexpress</span></h2>
          <p className="text-gray-500 mt-2">Sign in to access your EUDR compliance dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Acme Exports Ltd."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-100"
          >
            {isLoading ? 'Signing In...' : 'Get Started'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trusted by exporters in</h4>
          <div className="flex gap-2 text-sm text-gray-600 flex-wrap">
            <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12} className="text-brand-600"/> Brazil</span>
            <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12} className="text-brand-600"/> Indonesia</span>
            <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12} className="text-brand-600"/> Vietnam</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;