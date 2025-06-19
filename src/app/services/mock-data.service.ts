import { Injectable } from '@angular/core';
import { ApiRequest } from '../models/api-request';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  constructor() { }
  
  // Mock data for API requests using real government sectors from Tunisia
  getMockApiRequests(): Observable<ApiRequest[]> {
    return of([
      {
        id: 'req-001',
        apiId: 'new-api-1621080600000',
        apiName: 'Civil Status Data API',
        name: 'Ahmed Ben Ali',
        email: 'ahmed.benali@interior.gov.tn',
        structure: 'Ministry of Interior - Civil Status',
        secteur: 'Civil Status and Official Documents',
        service: 'Identity Verification',
        consumerId: 'consumer-001',
        message: 'We need an API to access civil status records for citizen verification purposes across multiple government services.',
        status: 'pending',
        requestDate: new Date('2025-05-15T09:30:00')
      },
      {
        id: 'req-002',
        apiId: 'new-api-1621166400000',
        apiName: 'Student Records API',
        name: 'Fatima Trabelsi',
        email: 'f.trabelsi@education.gov.tn',
        structure: 'Ministry of Education',
        secteur: 'Education',
        service: 'Academic Records',
        consumerId: 'consumer-002',
        message: 'This API will provide secure access to student academic records for authorized educational institutions.',
        status: 'pending',
        requestDate: new Date('2025-05-16T14:20:00')
      },
      {
        id: 'req-003',
        apiId: 'new-api-1620644100000',
        apiName: 'Research Publications API',
        name: 'Karim Mezraoui',
        email: 'k.mezraoui@research.gov.tn',
        structure: 'Ministry of Higher Education and Scientific Research',
        secteur: 'Higher Education and Scientific Research',
        service: 'Research Database',
        consumerId: 'consumer-003',
        message: 'An API to catalog and search all public research papers published by Tunisian universities and research centers.',
        status: 'approved',
        requestDate: new Date('2025-05-10T11:15:00')
      },
      {
        id: 'req-004',
        apiId: 'new-api-1620202800000',
        apiName: 'Patient Medical History API',
        name: 'Leila Benabdallah',
        email: 'l.benabdallah@health.gov.tn',
        structure: 'Ministry of Health',
        secteur: 'Social Affairs',
        service: 'Healthcare Records',
        consumerId: 'consumer-004',
        message: 'This API will securely provide access to patient medical records for authorized healthcare providers, improving continuity of care.',
        status: 'rejected',
        requestDate: new Date('2025-05-05T08:45:00')
      },
      {
        id: 'req-005',
        apiId: 'new-api-1621349400000',
        apiName: 'Insurance Claims API',
        name: 'Youssef Kaddour',
        email: 'y.kaddour@cnam.nat.tn',
        structure: 'National Health Insurance Fund (CNAM)',
        secteur: 'Social Affairs',
        service: 'Insurance Claims',
        consumerId: 'consumer-005',
        message: 'An API to process and track health insurance claims electronically, significantly reducing processing time.',
        status: 'pending',
        requestDate: new Date('2025-05-18T16:30:00')
      },
      {
        id: 'req-006',
        apiId: 'new-api-1621414800000',
        apiName: 'Vehicle Registration API',
        name: 'Nadia Bouazizi',
        email: 'n.bouazizi@transport.gov.tn',
        structure: 'Ministry of Transport',
        secteur: 'Transport and Vehicles',
        service: 'Vehicle Registry',
        consumerId: 'consumer-006',
        message: 'API for accessing and updating vehicle registration information, enabling automation of related services.',
        status: 'pending',
        requestDate: new Date('2025-05-19T10:00:00')
      },
      {
        id: 'req-007',
        apiId: 'new-api-1621256700000',
        apiName: 'Driver License Verification API',
        name: 'Sami Lahmar',
        email: 's.lahmar@transport.gov.tn',
        structure: 'Ministry of Transport',
        secteur: 'Transport and Vehicles',
        service: 'License Management',
        consumerId: 'consumer-007',
        message: 'An API for verifying driver license validity and status for third-party services and government agencies.',
        status: 'pending',
        requestDate: new Date('2025-05-17T13:45:00')
      },
      {
        id: 'req-008',
        apiId: 'new-api-1620817200000',
        apiName: 'Social Benefits Eligibility API',
        name: 'Mariam Jebali',
        email: 'm.jebali@social.gov.tn',
        structure: 'Ministry of Social Affairs',
        secteur: 'Social Affairs',
        service: 'Social Benefits',
        consumerId: 'consumer-008',
        message: 'This API will help determine citizen eligibility for various social benefit programs based on integrated data.',
        status: 'approved',
        requestDate: new Date('2025-05-12T09:20:00')
      }
    ]);
  }
  
  // Get statistics about API requests
  getRequestStatistics() {
    return {
      totalRequests: 8,
      pendingRequests: 5,
      approvedRequests: 2,
      rejectedRequests: 1,
      sectorDistribution: [
        { sector: 'Civil Status and Official Documents', count: 1, percentage: 12.5 },
        { sector: 'Education', count: 1, percentage: 12.5 },
        { sector: 'Higher Education and Scientific Research', count: 1, percentage: 12.5 },
        { sector: 'Social Affairs', count: 3, percentage: 37.5 },
        { sector: 'Transport and Vehicles', count: 2, percentage: 25 }
      ]
    };
  }
}
