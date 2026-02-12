'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script'; // CRITICAL: Loads Razorpay
import { useApp } from '@/lib/AppContext';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Zap, 
  Shield, 
  Globe,
  Loader2
} from 'lucide-react';
import { PlanTier } from '@/types';

// Declare Razorpay on window to prevent TS errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { user, login } = useApp(); // We use login to update user state mock
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // --- RAZORPAY HANDLER ---
  const handlePayment = (tier: PlanTier, amount: number) => {
    if (!user) return;
    setLoadingTier(tier);

    // 1. In a real app, you would fetch an Order ID from your backend here.
    // const order = await fetch('/api/create-order', { method: 'POST', ... });
    
    // 2. Initialize Razorpay Options
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // REPLACE THIS LATER
      amount: amount * 100, // Amount in paise (e.g. 29900 for ₹299)
      currency: "INR",
      name: "NatureXpress",
      description: `${tier} Plan Subscription`,
      image: "https://naturexpress.in/wp-content/uploads/2025/07/Untitled-design-12-1.png", // Your Logo
      handler: function (response: any) {
        // 3. On Success
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        
        // Mock Update: Upgrade the user in local state
        // In real app: You would verify payment on backend, then update DB
        if (user) {
            // We simulate a re-login to update the plan in context
            // Note: In a real app, you'd have a specific updatePlan() function
            const updatedUser = { ...user, plan: tier };
            localStorage.setItem('nx_user', JSON.stringify(updatedUser));
            window.location.reload(); // Reload to reflect changes
        }
      },
      prefill: {
        name: user.companyName,
        email: user.email,
        contact: "9999999999" // Mock contact
      },
      theme: {
        color: "#166534" // Your Brand Green
      }
    };

    // 4. Open Payment Modal
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
    
    // Reset loading state if closed
    rzp1.on('payment.failed', function (response: any){
        alert("Payment Failed");
        setLoadingTier(null);
    });
    
    // Simulate delay for effect if script loads fast
    setTimeout(() => setLoadingTier(null), 2000); 
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Load Razorpay Script from CDN */}
      <Script 
        id="razorpay-checkout-js" 
        src="https://checkout.razorpay.com/v1/checkout.js" 
      />

      {/* Header */}
      <div className="bg-slate-900 text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <button 
          onClick={() => router.push('/dashboard')}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold z-20"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Transparent Compliance Pricing</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your export volume. Pay in INR via UPI, Card, or Netbanking.
          </p>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* 1. BASIC PLAN */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Basic</h3>
              <p className="text-sm text-slate-500 mt-1">For small coffee/spice exporters.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">₹4,999</span>
              <span className="text-slate-500">/month</span>
            </div>
            
            <button 
              onClick={() => handlePayment('Basic', 4999)}
              disabled={user?.plan === 'Basic' || !!loadingTier}
              className={`w-full py-3 border-2 rounded-xl font-bold transition-colors mb-8 flex justify-center items-center gap-2 ${
                user?.plan === 'Basic' 
                ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-default' 
                : 'border-slate-200 text-slate-900 hover:border-slate-900 hover:bg-slate-50'
              }`}
            >
              {loadingTier === 'Basic' ? <Loader2 className="animate-spin" /> : (user?.plan === 'Basic' ? 'Current Plan' : 'Select Basic')}
            </button>

            <ul className="space-y-4 mb-8 flex-1">
              <Feature text="25 Assessments per month" />
              <Feature text="50 Suppliers tracked" />
              <Feature text="Standard DDS Generation" />
              <Feature text="Email Support" />
              <Feature text="Satellite Verification (10 Checks)" />
              <Feature text="API Access" included={false} />
            </ul>
          </div>

          {/* 2. PRO PLAN (Highlighted) */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-600 p-8 flex flex-col transform md:-translate-y-4 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
              Recommended
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap size={18} className="text-green-600 fill-current" /> Pro
              </h3>
              <p className="text-sm text-slate-500 mt-1">For growing exporters needing full EUDR safety.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">₹14,999</span>
              <span className="text-slate-500">/month</span>
            </div>
            
            <button 
              onClick={() => handlePayment('Pro', 14999)}
              disabled={user?.plan === 'Pro' || !!loadingTier}
              className={`w-full py-3 rounded-xl font-bold transition-all mb-8 shadow-lg flex justify-center items-center gap-2 ${
                user?.plan === 'Pro'
                ? 'bg-slate-100 text-slate-400 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-500/30'
              }`}
            >
              {loadingTier === 'Pro' ? <Loader2 className="animate-spin" /> : (user?.plan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro')}
            </button>

            <ul className="space-y-4 mb-8 flex-1">
              <Feature text="Unlimited Assessments" />
              <Feature text="Unlimited Suppliers" />
              <Feature text="Advanced Satellite Analysis" highlight />
              <Feature text="Priority WhatsApp Support" />
              <Feature text="Custom Branding on Reports" />
              <Feature text="API Access" included={true} />
            </ul>
          </div>

          {/* 3. ENTERPRISE PLAN */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
              <p className="text-sm text-slate-500 mt-1">For large aggregators & multinational traders.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">Custom</span>
            </div>
            
            <button 
              onClick={() => window.location.href = 'mailto:sales@naturexpress.in'}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors mb-8"
            >
              Contact Sales
            </button>

            <ul className="space-y-4 mb-8 flex-1">
              <Feature text="Everything in Pro" />
              <Feature text="Dedicated Account Manager" />
              <Feature text="ERP Integration (SAP/Oracle)" />
              <Feature text="On-premise Deployment" />
              <Feature text="Custom SLA Contracts" />
            </ul>
          </div>

        </div>
      </div>

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-6 mt-16 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Secured by Razorpay</p>
        <div className="flex justify-center items-center gap-8 opacity-50 grayscale">
           <Shield size={32} />
           <Globe size={32} />
           <CheckCircle size={32} />
        </div>
      </div>

    </div>
  );
}

function Feature({ text, included = true, highlight = false }: { text: string, included?: boolean, highlight?: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-sm ${!included ? 'opacity-50' : ''}`}>
      {included ? (
        <div className={`mt-0.5 rounded-full p-0.5 ${highlight ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
          <Check size={12} strokeWidth={4} />
        </div>
      ) : (
        <div className="mt-0.5">
          <X size={14} className="text-slate-400" />
        </div>
      )}
      <span className={`${highlight ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{text}</span>
    </li>
  );
}

// Icon for trust badges
function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}