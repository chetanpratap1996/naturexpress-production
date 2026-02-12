'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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

        <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Effective Date: February 12, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using NatureXpress, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Service Description</h2>
            <p>
              NatureXpress provides software tools to assist in EUDR compliance. <strong>We do not provide legal advice.</strong> The Due Diligence Statements generated are based on the data you provide. You are solely responsible for the accuracy of the data submitted to EU authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account credentials. NatureXpress is not liable for any loss or damage arising from your failure to protect your password.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Payment & Refunds</h2>
            <p>
              Subscription services are billed in advance. Refunds are processed according to our Refund Policy (within 7 days of initial purchase if no reports were generated).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Limitation of Liability</h2>
            <p>
              In no event shall NatureXpress be liable for any indirect, incidental, or consequential damages arising out of your use of the service, including fines or penalties from regulatory bodies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}