import { FarmerRecord } from '@/types';

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

const STORAGE_KEY = 'naturexpress_farmers';

// ============================================================================
// MOCK INITIAL DATA (for demo purposes)
// ============================================================================

const INITIAL_FARMERS: FarmerRecord[] = [
  {
    id: 'farmer-demo-001',
    name: 'Rajesh Kumar',
    farmLocation: 'Kodagu District, Karnataka',
    country: 'India',
    gpsCoordinates: '12.4244, 75.7382',
    landArea: 2.5,
    landOwnershipType: 'Owned',
    registrationNumber: '+91 98765 43210',
    certifications: [
      {
        id: 'cert-001',
        name: 'Organic India Certification',
        issuingBody: 'Control Union',
        issueDate: '2023-01-15',
        expiryDate: '2025-01-15',
        certificateNumber: 'ORG-IN-2023-12345',
      },
    ],
    lastVerified: '2024-11-15',
    verifiedBy: 'NatureXpress Team',
    status: 'Active',
    deforestationCheckPassed: true,
    lastDeforestationCheck: '2024-10-01',
    createdAt: '2023-11-15T00:00:00.000Z',
    updatedAt: '2024-11-15T00:00:00.000Z',
    notes: 'Coffee farmer with excellent traceability records',
    // EUDR-specific fields
    landRecordType: 'RTC (Record of Rights)',
    landRecordFileName: 'rajesh_rtc_2024.pdf',
    hasHarvestRights: true,
    cropScientificName: 'Coffea canephora (Robusta)',
  },
  {
    id: 'farmer-demo-002',
    name: 'Lakshmi Devi',
    farmLocation: 'Wayanad District, Kerala',
    country: 'India',
    gpsCoordinates: '11.6854, 76.1320',
    landArea: 1.8,
    landOwnershipType: 'Owned',
    registrationNumber: '+91 98989 12345',
    certifications: [
      {
        id: 'cert-002',
        name: 'Rainforest Alliance',
        issuingBody: 'Rainforest Alliance',
        issueDate: '2023-06-01',
        expiryDate: '2026-06-01',
        certificateNumber: 'RA-2023-67890',
      },
    ],
    lastVerified: '2024-09-20',
    verifiedBy: 'Field Auditor - Kerala',
    status: 'Active',
    deforestationCheckPassed: true,
    lastDeforestationCheck: '2024-08-15',
    createdAt: '2024-01-20T00:00:00.000Z',
    notes: 'Black pepper cultivation with sustainable practices',
    // EUDR-specific fields
    landRecordType: 'Patta',
    landRecordFileName: 'lakshmi_patta_scan.jpg',
    hasHarvestRights: true,
    cropScientificName: 'Piper nigrum (Black Pepper)',
  },
  {
    id: 'farmer-demo-003',
    name: 'Carlos Silva',
    farmLocation: 'Minas Gerais',
    country: 'Brazil',
    gpsCoordinates: '-19.9167, -43.9345',
    landArea: 5.2,
    landOwnershipType: 'Owned',
    registrationNumber: '+55 31 98765-4321',
    certifications: [
      {
        id: 'cert-003',
        name: 'Fair Trade Certified',
        issuingBody: 'Fair Trade USA',
        issueDate: '2022-03-10',
        expiryDate: '2025-03-10',
        certificateNumber: 'FT-BR-2022-11223',
      },
    ],
    lastVerified: '2024-10-05',
    verifiedBy: 'Brazil Compliance Team',
    status: 'Active',
    deforestationCheckPassed: true,
    lastDeforestationCheck: '2024-09-01',
    createdAt: '2022-11-01T00:00:00.000Z',
    notes: 'Large-scale coffee producer, excellent record-keeping',
    // EUDR-specific fields
    landRecordType: 'Deed',
    landRecordFileName: 'carlos_land_deed.pdf',
    hasHarvestRights: true,
    cropScientificName: 'Coffea arabica',
  },
];

// ============================================================================
// FARMER SERVICE
// ============================================================================

export const farmerService = {
  /**
   * Get all farmers from localStorage
   */
  getFarmers(): FarmerRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with demo data on first load
        this.initializeStorage();
        return INITIAL_FARMERS;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load farmers:', error);
      return [];
    }
  },

  /**
   * Get a single farmer by ID
   */
  getFarmerById(id: string): FarmerRecord | null {
    const farmers = this.getFarmers();
    return farmers.find((f) => f.id === id) || null;
  },

  /**
   * Add a new farmer
   */
  addFarmer(farmer: Omit<FarmerRecord, 'id' | 'createdAt'>): FarmerRecord {
    try {
      const farmers = this.getFarmers();
      const newFarmer: FarmerRecord = {
        ...farmer,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      farmers.unshift(newFarmer);
      this.saveFarmers(farmers);
      return newFarmer;
    } catch (error) {
      console.error('Failed to add farmer:', error);
      throw new Error('Failed to add farmer to system');
    }
  },

  /**
   * Update an existing farmer
   */
  updateFarmer(id: string, updates: Partial<FarmerRecord>): FarmerRecord | null {
    try {
      const farmers = this.getFarmers();
      const index = farmers.findIndex((f) => f.id === id);
      
      if (index === -1) {
        console.error('Farmer not found:', id);
        return null;
      }

      const updatedFarmer: FarmerRecord = {
        ...farmers[index],
        ...updates,
        id: farmers[index].id, // Preserve original ID
        createdAt: farmers[index].createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
      };

      farmers[index] = updatedFarmer;
      this.saveFarmers(farmers);
      return updatedFarmer;
    } catch (error) {
      console.error('Failed to update farmer:', error);
      throw new Error('Failed to update farmer information');
    }
  },

  /**
   * Delete a farmer
   */
  deleteFarmer(id: string): boolean {
    try {
      const farmers = this.getFarmers();
      const filtered = farmers.filter((f) => f.id !== id);
      
      if (filtered.length === farmers.length) {
        console.error('Farmer not found for deletion:', id);
        return false;
      }

      this.saveFarmers(filtered);
      return true;
    } catch (error) {
      console.error('Failed to delete farmer:', error);
      throw new Error('Failed to delete farmer from system');
    }
  },

  /**
   * Search farmers by name or location
   */
  searchFarmers(query: string): FarmerRecord[] {
    const farmers = this.getFarmers();
    const lowerQuery = query.toLowerCase();
    
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.farmLocation.toLowerCase().includes(lowerQuery) ||
        f.cropScientificName?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Filter farmers by status
   */
  filterByStatus(status: 'Active' | 'Pending' | 'Inactive'): FarmerRecord[] {
    const farmers = this.getFarmers();
    return farmers.filter((f) => f.status === status);
  },

  /**
   * Get farmers requiring verification
   */
  getFarmersRequiringVerification(): FarmerRecord[] {
    const farmers = this.getFarmers();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return farmers.filter((f) => {
      const lastVerified = new Date(f.lastVerified);
      return lastVerified < thirtyDaysAgo || f.status === 'Pending';
    });
  },

  /**
   * Get farmers with missing documentation
   */
  getFarmersWithMissingDocs(): FarmerRecord[] {
    const farmers = this.getFarmers();
    return farmers.filter(
      (f) =>
        !f.landRecordFileName ||
        !f.hasHarvestRights ||
        !f.deforestationCheckPassed
    );
  },

  /**
   * Upload land record file (mock implementation)
   * In production, this would upload to AWS S3, Google Cloud Storage, etc.
   */
  async uploadLandRecord(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];

      if (file.size > maxSize) {
        reject(new Error('File size exceeds 10MB limit'));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Invalid file type. Only PDF and images are allowed'));
        return;
      }

      // Simulate upload delay
      setTimeout(() => {
        // In production, this would be the actual cloud storage URL
        const mockUrl = `https://storage.naturexpress.com/land-records/${Date.now()}-${file.name}`;
        resolve(mockUrl);
      }, 2000);
    });
  },

  /**
   * Verify farmer's land records
   */
  verifyFarmer(id: string, verifiedBy: string): FarmerRecord | null {
    return this.updateFarmer(id, {
      lastVerified: new Date().toISOString(),
      verifiedBy,
      status: 'Active',
    });
  },

  /**
   * Run deforestation check
   */
  async runDeforestationCheck(id: string): Promise<boolean> {
    // Simulate satellite analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock result (85% pass rate)
    const passed = Math.random() > 0.15;

    this.updateFarmer(id, {
      deforestationCheckPassed: passed,
      lastDeforestationCheck: new Date().toISOString(),
    });

    return passed;
  },

  /**
   * Add certification to farmer
   */
  addCertification(
    farmerId: string,
    certification: {
      name: string;
      issuingBody: string;
      issueDate: string;
      expiryDate?: string;
      certificateNumber?: string;
    }
  ): FarmerRecord | null {
    const farmer = this.getFarmerById(farmerId);
    if (!farmer) return null;

    const newCert = {
      id: this.generateId(),
      ...certification,
    };

    const existingCerts = farmer.certifications || [];
    
    return this.updateFarmer(farmerId, {
      certifications: [...existingCerts, newCert],
    });
  },

  /**
   * Get statistics
   */
  getStatistics() {
    const farmers = this.getFarmers();
    
    return {
      total: farmers.length,
      active: farmers.filter((f) => f.status === 'Active').length,
      pending: farmers.filter((f) => f.status === 'Pending').length,
      inactive: farmers.filter((f) => f.status === 'Inactive').length,
      withGPS: farmers.filter((f) => f.gpsCoordinates).length,
      withLandRecords: farmers.filter((f) => f.landRecordFileName).length,
      withCertifications: farmers.filter(
        (f) => f.certifications && f.certifications.length > 0
      ).length,
      deforestationCompliant: farmers.filter((f) => f.deforestationCheckPassed)
        .length,
      totalLandArea: farmers.reduce((sum, f) => sum + (f.landArea || 0), 0),
    };
  },

  /**
   * Export farmers to CSV
   */
  exportToCSV(): string {
    const farmers = this.getFarmers();
    
    const headers = [
      'ID',
      'Name',
      'Location',
      'Country',
      'GPS Coordinates',
      'Land Area (ha)',
      'Ownership Type',
      'Contact',
      'Status',
      'Crop',
      'Last Verified',
      'Deforestation Check',
      'Land Record Type',
      'Has Harvest Rights',
    ];

    const rows = farmers.map((f) => [
      f.id,
      f.name,
      f.farmLocation,
      f.country || '',
      f.gpsCoordinates,
      f.landArea.toString(),
      f.landOwnershipType,
      f.registrationNumber || '',
      f.status,
      f.cropScientificName || '',
      f.lastVerified,
      f.deforestationCheckPassed ? 'Passed' : 'Failed',
      f.landRecordType || '',
      f.hasHarvestRights ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  },

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Initialize storage with demo data
   */
  initializeStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FARMERS));
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  },

  /**
   * Save farmers to localStorage
   */
  saveFarmers(farmers: FarmerRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farmers));
    } catch (error) {
      console.error('Failed to save farmers:', error);
      throw new Error('Failed to save farmers to storage');
    }
  },

  /**
   * Generate unique ID
   */
  generateId(): string {
    return `farmer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Clear all farmers (for testing/demo reset)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Reset to initial demo data
   */
  resetToDemo(): void {
    this.clearAll();
    this.initializeStorage();
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default farmerService;

// Named exports for convenience
export const {
  getFarmers,
  getFarmerById,
  addFarmer,
  updateFarmer,
  deleteFarmer,
  searchFarmers,
  filterByStatus,
  uploadLandRecord,
  verifyFarmer,
  runDeforestationCheck,
  getStatistics,
  exportToCSV,
} = farmerService;