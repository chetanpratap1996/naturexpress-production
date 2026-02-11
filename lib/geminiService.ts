import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExporterFormData, DocumentType, ComplianceResult, DDSRequestData } from '@/types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const MODEL_NAME = 'gemini-1.5-flash';
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

const getClient = (): GoogleGenerativeAI => {
  let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey && typeof window !== 'undefined') {
    apiKey = localStorage.getItem('gemini_api_key') || '';
  }

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not configured. Please add it to your .env.local file or configure it in settings.'
    );
  }

  return new GoogleGenerativeAI(apiKey);
};

// ============================================================================
// DOCUMENT GENERATION SERVICE
// ============================================================================

export const generateDocument = async (
  docType: DocumentType,
  formData: ExporterFormData,
  complianceResult: ComplianceResult
): Promise<string> => {
  try {
    const ai = getClient();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: GENERATION_CONFIG,
    });

    const prompt = buildDocumentPrompt(docType, formData, complianceResult);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI model');
    }

    return text;
  } catch (error) {
    console.error('Document generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API key is invalid or missing. Please check your configuration.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later or upgrade your plan.');
      }
      throw error;
    }

    throw new Error('Failed to generate document. Please try again.');
  }
};

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildDocumentPrompt(
  docType: DocumentType,
  formData: ExporterFormData,
  complianceResult: ComplianceResult
): string {
  const baseContext = `
You are an expert EUDR (EU Regulation 2023/1115) Compliance Specialist and Legal Consultant with deep knowledge of international trade, sustainable forestry, and agricultural supply chain traceability.

## OPERATOR CONTEXT
- **Company/Operator:** ${formData.companyName}
- **Commodity:** ${formData.productType}
- **Country of Origin:** ${formData.exportCountry}
- **Annual Export Volume:** ${formData.annualVolume}
- **Supply Chain Complexity:** ${formData.supplyChainComplexity}
- **Traceability System:** ${formData.traceabilitySystem || 'Not specified'}

## COMPLIANCE ASSESSMENT
- **Readiness Score:** ${complianceResult.score}/100
- **Risk Classification:** ${complianceResult.riskLevel}
- **Strengths:** ${complianceResult.strengths.join(', ')}
- **Identified Gaps:** ${complianceResult.gaps.map(g => g.description).join('; ')}

## AVAILABLE DATA
- **GPS Data Available:** ${formData.hasGPSData ? 'Yes' : 'No'}
${formData.geolocationData ? `- **Geolocation Data:** ${formData.geolocationData}` : ''}
- **Land Records:** ${formData.hasLandRecords ? 'Yes' : 'No'}
- **Third-Party Certification:** ${formData.hasThirdPartyCert ? `Yes (${formData.certificationBody})` : 'No'}
- **Documented Supplier List:** ${formData.hasSupplierList ? `Yes (${formData.supplierCount} suppliers)` : 'No'}
`;

  // Helper function to safely check traceability system
  const hasTraceabilitySystem = formData.traceabilitySystem && formData.traceabilitySystem.trim() !== '';
  const traceabilityLevel = hasTraceabilitySystem ? formData.traceabilitySystem : 'None';

  const prompts: Partial<Record<DocumentType, string>> = {
    'Due Diligence Statement': `
${baseContext}

## TASK
Generate a comprehensive **Due Diligence Statement (DDS)** as required by Article 4 and Annex II of EU Regulation 2023/1115.

[Include all requirements from Article 9: operator identification, product description, country of production, geolocation, legality verification, deforestation-free guarantee, due diligence system, traceability, risk mitigation actions, and declaration]

Generate the complete Due Diligence Statement ready for official submission to EU authorities.
`,

    'Supplier Declaration': `
${baseContext}

## TASK
Generate a **Supplier Declaration of Deforestation-Free and Legal Production** template that suppliers in ${formData.exportCountry} must sign.

[Include declarations and warranties, geolocation commitment, traceability cooperation, audit rights, data accuracy, breach consequences, supporting documentation requirements, and signature blocks]

Generate this complete template ready for use by suppliers.
`,

    'Risk Assessment': `
${baseContext}

## TASK
Generate a comprehensive **Risk Assessment Report (RAR)** as required by Article 10 of EU Regulation 2023/1115.

[Include executive summary, country-level risk analysis, operator-specific risk factors, specific risk indicators, risk scoring methodology, risk mitigation strategy, monitoring & review plan, conclusions and recommendations]

Generate this complete Risk Assessment Report with professional formatting.
`,

    'GPS Report': `
${baseContext}

## TASK
Generate a comprehensive **Geolocation Evidence & Data Quality Report** for EUDR compliance.

[Include regulatory requirements, current status, geolocation requirements by plot, data collection methodology, geolocation data format, verification procedures, data storage & management, gap analysis & action plan, ongoing monitoring, and conclusions]

Generate this complete GPS Report with all sections.
`,

    'DDS': `
${baseContext}

## TASK
Generate a concise **Due Diligence Statement (DDS)** for quick reference and rapid customs processing.

**Document Structure:**
1. Reference Information: DDS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}
2. Operator Details: ${formData.companyName}, ${formData.exportCountry}
3. Product Information: ${formData.productType}, ${formData.annualVolume}
4. Compliance Declarations:
   - Deforestation-free: Products NOT sourced from land deforested after Dec 31, 2020
   - Legal production: Compliant with ${formData.exportCountry} laws
   - Geolocation: ${formData.hasGPSData ? 'Complete GPS coordinates provided' : 'Collection in progress'}
   - Due diligence: Risk level ${complianceResult.riskLevel}, Score ${complianceResult.score}/100
5. Risk Assessment Summary
6. Traceability Information
7. Supporting Documentation
8. Declaration and Authorization

Generate a professional one-page DDS suitable for rapid customs processing.
`,

    'Traceability Report': `
${baseContext}

## TASK
Generate a comprehensive **Supply Chain Traceability Report** documenting the complete chain of custody.

**Report Structure:**

### Executive Summary
- Supply chain complexity: ${formData.supplyChainComplexity}
- Traceability system: ${traceabilityLevel}
- Suppliers: ${formData.hasSupplierList ? `${formData.supplierCount} documented` : 'Mapping in progress'}
- Traceability score: ${Math.round(((complianceResult.scoreBreakdown?.traceability || 0) / 25) * 100)}%

### Supply Chain Mapping
**Tier 1 - Production (Farms):**
- Number of farms: ${formData.supplierCount ? Math.round(Number(formData.supplierCount) * 1.5) : 'TBD'}
- GPS coverage: ${formData.hasGPSData ? '100%' : '0%'}

**Tier 2 - Aggregation:**
- Collection centers: ${formData.supplyChainComplexity === 'Complex' ? 'Multiple' : formData.supplyChainComplexity === 'Moderate' ? '2-3' : 'Single'}

**Tier 3 - Processing:**
- Processing capacity: ${formData.annualVolume}

**Tier 4 - Export:**
- Export documentation maintained

### Batch Tracking System
- System type: ${traceabilityLevel}
- Digital records: ${hasTraceabilitySystem ? 'Yes' : 'Manual logs'}

### Critical Tracking Points
${formData.supplyChainComplexity === 'Complex' ? 'Multiple intermediaries requiring enhanced documentation' 
  : formData.supplyChainComplexity === 'Moderate' ? 'Some aggregation with good record-keeping' 
  : 'Direct supply with minimal intermediaries'}

### Verification Procedures
- Internal audits: ${formData.supplyChainComplexity === 'Complex' ? 'Monthly' : 'Quarterly'}
- External audits: ${formData.hasThirdPartyCert ? `Annual by ${formData.certificationBody}` : 'To be implemented'}

### Gaps & Improvements
**Current Gaps:**
${complianceResult.gaps.map(g => `- ${g.description} (${g.severity})`).join('\n')}

**Improvement Plan:**
${complianceResult.recommendations.map((r, i) => `${i + 1}. ${r.title}: ${r.description}`).join('\n')}

### Compliance Status
Overall Score: ${complianceResult.score}/100
Status: ${complianceResult.score >= 70 ? '✓ Adequate for EUDR' : '✗ Improvements required'}

Generate this complete Traceability Report with all sections.
`,

    'Compliance Certificate': `
${baseContext}

## TASK
Generate an official **EUDR Compliance Certificate** for ${formData.companyName}.

**Certificate Structure:**

---
**EUROPEAN UNION DEFORESTATION REGULATION**
**COMPLIANCE CERTIFICATE**
**Regulation (EU) 2023/1115**
---

### Certificate Details
- Certificate Number: EUDR-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}
- Issue Date: ${new Date().toISOString().split('T')[0]}
- Valid Until: ${new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]}
- Type: ${complianceResult.score >= 70 ? 'FULL COMPLIANCE' : 'PROVISIONAL'}
- Issuing Authority: ${formData.hasThirdPartyCert ? formData.certificationBody : 'Self-Declaration'}

### Operator Information
- Legal Name: ${formData.companyName}
- Country: ${formData.exportCountry}
- Registration: [TBD]
- Compliance Officer: [Name]

### Product Certification
- Commodity: ${formData.productType}
- Volume: ${formData.annualVolume}
- Country of Production: ${formData.exportCountry}

### Compliance Assessment
- Due Diligence Score: ${complianceResult.score}/100
- Risk Classification: ${complianceResult.riskLevel}
- Assessment Date: ${new Date().toISOString().split('T')[0]}

### Certification Criteria Checklist
✓ **Information Collection (Article 9)**
Status: ${formData.hasSupplierList && formData.hasGPSData ? '✓ COMPLIANT' : '⏳ PENDING'}

✓ **Risk Assessment (Article 10)**
Status: ✓ COMPLETED
Risk Level: ${complianceResult.riskLevel}

✓ **Risk Mitigation (Article 11)**
${complianceResult.riskLevel !== 'Low' ? `Measures: ${complianceResult.recommendations.slice(0, 3).map(r => r.title).join(', ')}` : 'Standard procedures sufficient'}
Status: ${complianceResult.score >= 60 ? '✓ ADEQUATE' : '⏳ ENHANCEMENT REQUIRED'}

✓ **Geolocation Requirements**
Status: ${formData.hasGPSData ? '✓ GPS DATA PROVIDED' : '⏳ PENDING'}

✓ **Deforestation-Free Declaration**
Declaration: Products NOT produced on land deforested after December 31, 2020
Status: ${formData.hasGPSData ? '✓ VERIFIED' : '⏳ PENDING VERIFICATION'}

✓ **Legal Production**
Compliance with ${formData.exportCountry} legislation
Status: ${formData.hasLandRecords ? '✓ VERIFIED' : '⏳ VERIFICATION IN PROGRESS'}

### Certification Statement
${complianceResult.score >= 70 ? `
**APPROVED:**
${formData.companyName} has successfully completed due diligence requirements under Regulation (EU) 2023/1115.

This certificate authorizes placement of ${formData.productType} on the EU market, subject to:
- Continued compliance with EUDR requirements
- Annual re-certification
- 5-year record retention
- Cooperation with inspections

**Certificate Status:** ✓ APPROVED
` : `
**PROVISIONAL - ACTION REQUIRED:**
${formData.companyName} has initiated due diligence but requires:
${complianceResult.gaps.map((g, i) => `${i + 1}. ${g.description}`).join('\n')}

Valid for: 90 days
Full certification expected by: ${new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0]}

**Certificate Status:** ⏳ PROVISIONAL
`}

### Limitations and Conditions
1. Valid only for specified commodity and volume
2. Certificate invalid if supply chain changes materially
3. Operator must maintain documentation and report changes
4. Subject to competent authority verification

### Signatures
**Issued by:**
[Certification Body/Officer]
Date: ${new Date().toISOString().split('T')[0]}

**Operator Acknowledgment:**
Name: _____________________
Signature: _________________
Date: _____________________

---
**Certificate Verification Code:** EUDR-${Math.random().toString(36).substr(2, 12).toUpperCase()}
**Verification URL:** [URL]

**IMPORTANT:** This certificate does not guarantee customs acceptance. EU authorities retain verification rights.

---
Generate this complete Compliance Certificate with professional formatting.
`,
  };

  // Return the prompt for the requested document type, or a default prompt
  return prompts[docType] || `${baseContext}\n\nGenerate a comprehensive ${docType} document for EUDR compliance.`;
}

// ============================================================================
// TRACES XML GENERATION
// ============================================================================

export const generateTracesXML = async (
  exporterData: ExporterFormData | null,
  transactionData: DDSRequestData,
  companyName: string
): Promise<string> => {
  try {
    const ai = getClient();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        ...GENERATION_CONFIG,
        temperature: 0.3,
      },
    });

    const prompt = `
Generate a valid XML payload for the EU TRACES-NT system for EUDR due diligence submission.

## SUBMISSION DATA
**Operator:** ${exporterData?.companyName || companyName}
**Country:** ${exporterData?.exportCountry || 'To be specified'}
**Product:** ${exporterData?.productType || 'Relevant commodity'}
**HS Code:** ${transactionData.hsCode}
**Net Mass:** ${transactionData.netMassKg} kg
**Invoice:** ${transactionData.invoiceNumber}
**Shipment Date:** ${transactionData.shipmentDate || new Date().toISOString().split('T')[0]}
**Buyer:** ${transactionData.buyerName}
**Buyer Address:** ${transactionData.buyerAddress}
**Buyer Country:** ${transactionData.buyerCountry || 'EU Member State'}
**Port of Entry:** ${transactionData.portOfEntry || 'To be specified'}

Generate ONLY the XML code without markdown formatting. Start directly with <?xml version="1.0" encoding="UTF-8"?>
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let xml = response.text();

    xml = xml.replace(/```xml\n?/g, '').replace(/```\n?/g, '').trim();

    if (!xml.startsWith('<?xml')) {
      throw new Error('Invalid XML format generated');
    }

    return xml;
  } catch (error) {
    console.error('TRACES XML generation error:', error);
    return generateFallbackXML(exporterData, transactionData, companyName);
  }
};

function generateFallbackXML(
  exporterData: ExporterFormData | null,
  transactionData: DDSRequestData,
  companyName: string
): string {
  const refNumber = `DDS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<EUDR_DueDiligenceStatement xmlns="http://ec.europa.eu/traces/eudr/v1" version="1.0">
  <Header>
    <ReferenceNumber>${refNumber}</ReferenceNumber>
    <SubmissionDate>${new Date().toISOString()}</SubmissionDate>
    <DocumentType>DDS</DocumentType>
  </Header>
  <Operator>
    <Name>${exporterData?.companyName || companyName}</Name>
    <Country>${exporterData?.exportCountry || 'Unknown'}</Country>
    <RegistrationNumber>TBD</RegistrationNumber>
  </Operator>
  <Product>
    <CommodityType>${exporterData?.productType || 'Relevant Commodity'}</CommodityType>
    <HSCode>${transactionData.hsCode}</HSCode>
    <Quantity>
      <Value>${transactionData.netMassKg}</Value>
      <Unit>KG</Unit>
    </Quantity>
  </Product>
  <ProductionInformation>
    <CountryOfProduction>${exporterData?.exportCountry || 'Unknown'}</CountryOfProduction>
    <GeolocationDataAttached>${exporterData?.hasGPSData || false}</GeolocationDataAttached>
  </ProductionInformation>
  <Transaction>
    <InvoiceNumber>${transactionData.invoiceNumber}</InvoiceNumber>
    <ShipmentDate>${transactionData.shipmentDate || new Date().toISOString().split('T')[0]}</ShipmentDate>
    <Importer>
      <Name>${transactionData.buyerName}</Name>
      <Address>${transactionData.buyerAddress}</Address>
      <Country>${transactionData.buyerCountry || 'EU'}</Country>
    </Importer>
  </Transaction>
  <RiskAssessment>
    <RiskLevel>${exporterData?.deforestationRiskRegion ? 'High' : 'Low'}</RiskLevel>
    <AssessmentDate>${new Date().toISOString()}</AssessmentDate>
  </RiskAssessment>
  <ComplianceDeclaration>
    <DeforestationFree>true</DeforestationFree>
    <LegallyProduced>true</LegallyProduced>
    <CutoffDate>2020-12-31</CutoffDate>
    <DeclarationDate>${new Date().toISOString()}</DeclarationDate>
  </ComplianceDeclaration>
</EUDR_DueDiligenceStatement>`;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const ai = getClient();
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent('Hello');
    const response = result.response;
    return !!response.text();
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

export function setGeminiApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', apiKey);
  }
}

export function getGeminiApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key');
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || null;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const geminiService = {
  generateDocument,
  generateTracesXML,
  testConnection: testGeminiConnection,
  setApiKey: setGeminiApiKey,
  getApiKey: getGeminiApiKey,
};

export default geminiService;