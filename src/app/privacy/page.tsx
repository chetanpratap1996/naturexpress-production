'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-green-600 mb-8 font-bold text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last Updated: February 12, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Introduction</h2>
            <p>
              NatureXpress ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our SaaS platform for EUDR compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Data:</strong> Name, email address, company name, and payment information (processed via Razorpay).</li>
              <li><strong>Compliance Data:</strong> GPS coordinates of farm plots, supplier details, and commodity data required for Due Diligence Statements.</li>
              <li><strong>Usage Data:</strong> Information about how you navigate the dashboard and generate reports.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. How We Use Your Data</h2>
            <p>We use your data strictly to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Generate EU Deforestation Regulation (EUDR) compliant documents.</li>
              <li>Verify land use via satellite imagery API partners (e.g., Sentinel-2).</li>
              <li>Process subscription payments.</li>
              <li>Improve our risk assessment algorithms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Data Security</h2>
            <p>
              We implement enterprise-grade security measures including encryption at rest and in transit. Your data is stored on secure servers (Supabase/AWS) compliant with GDPR standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Contact Us</h2>
            <p>
              If you have questions about this policy, please contact us at <a href="mailto:privacy@naturexpress.in" className="text-blue-600 underline">privacy@naturexpress.in</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}