import api from './api';
import type {
  CountryDto,
  StateDto,
  CityDto,
  GenderDto,
  BloodGroupDto,
  SpecializationDto,
  CategoryDto,
  StatusDto,
  UserDto,
} from '../types/api.types';

// Offline fallback mock data for Master Data
const MOCK_COUNTRIES: CountryDto[] = [
  { id: 1, name: 'India', code: 'IN', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 2, name: 'United States', code: 'US', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 3, name: 'Australia', code: 'AU', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 4, name: 'United Kingdom', code: 'GB', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
];

const MOCK_GENDERS: GenderDto[] = [
  { id: 1, name: 'Male', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 2, name: 'Female', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 3, name: 'Other', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
];

const MOCK_BLOOD_GROUPS: BloodGroupDto[] = [
  { id: 1, name: 'A+', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 2, name: 'A-', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 3, name: 'B+', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 4, name: 'B-', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 5, name: 'O+', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 6, name: 'O-', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 7, name: 'AB+', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 8, name: 'AB-', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
];

const MOCK_SPECIALIZATIONS: SpecializationDto[] = [
  { id: 1, name: 'Orthopedic Physiotherapy', description: 'Musculoskeletal system', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 2, name: 'Neurological Rehabilitation', description: 'Brain and nervous system', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 3, name: 'Sports Physiotherapy', description: 'Athletic injuries and conditioning', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 4, name: 'Pediatric Physiotherapy', description: 'Children developmental conditions', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
  { id: 5, name: 'Cardiopulmonary Rehabilitation', description: 'Heart and lung disorders', isActive: true, createdAt: '2026-09-08T00:00:00Z' },
];

const MOCK_PHYSIOTHERAPISTS: UserDto[] = [
  { id: 3, username: 'therapist', email: 'therapist@gloryflorence.com', role: 'Physiotherapist', isActive: true, firstName: 'John', lastName: 'Therapist', createdAt: '2026-09-08T10:00:00Z' },
  { id: 4, username: 'doctor', email: 'doctor@gloryflorence.com', role: 'Doctor', isActive: true, firstName: 'Sarah', lastName: 'Doctor', createdAt: '2026-09-08T10:00:00Z' },
  { id: 1, username: 'admin', email: 'admin@gloryflorence.com', role: 'Super Admin', isActive: true, firstName: 'System', lastName: 'Administrator', createdAt: '2026-09-08T10:00:00Z' },
];

export const masterDataService = {
  // 11.1 Get Countries: GET /api/masterdata/countries
  getCountries: async (): Promise<CountryDto[]> => {
    try {
      const response = await api.get('/masterdata/countries');
      return Array.isArray(response.data) ? response.data : response.data?.items || MOCK_COUNTRIES;
    } catch {
      console.warn('[Offline Mode] Returning mock countries');
      return MOCK_COUNTRIES;
    }
  },

  // 11.2 Get States: GET /api/masterdata/states
  getStates: async (): Promise<StateDto[]> => {
    try {
      const response = await api.get('/masterdata/states');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    } catch {
      console.warn('[Offline Mode] Returning empty states array');
      return [];
    }
  },

  // 11.3 Get Cities: GET /api/masterdata/cities
  getCities: async (): Promise<CityDto[]> => {
    try {
      const response = await api.get('/masterdata/cities');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    } catch {
      console.warn('[Offline Mode] Returning empty cities array');
      return [];
    }
  },

  // 11.4 Get Genders: GET /api/masterdata/genders
  getGenders: async (): Promise<GenderDto[]> => {
    try {
      const response = await api.get('/masterdata/genders');
      return Array.isArray(response.data) ? response.data : response.data?.items || MOCK_GENDERS;
    } catch {
      console.warn('[Offline Mode] Returning mock genders');
      return MOCK_GENDERS;
    }
  },

  // 11.5 Get Blood Groups: GET /api/masterdata/bloodgroups
  getBloodGroups: async (): Promise<BloodGroupDto[]> => {
    try {
      const response = await api.get('/masterdata/bloodgroups');
      return Array.isArray(response.data) ? response.data : response.data?.items || MOCK_BLOOD_GROUPS;
    } catch {
      console.warn('[Offline Mode] Returning mock blood groups');
      return MOCK_BLOOD_GROUPS;
    }
  },

  // 11.6 Get Clinical Specializations: GET /api/masterdata/specializations
  getSpecializations: async (): Promise<SpecializationDto[]> => {
    try {
      const response = await api.get('/masterdata/specializations');
      return Array.isArray(response.data) ? response.data : response.data?.items || MOCK_SPECIALIZATIONS;
    } catch {
      console.warn('[Offline Mode] Returning mock specializations');
      return MOCK_SPECIALIZATIONS;
    }
  },

  // 11.7 Get Categories: GET /api/masterdata/categories
  getCategories: async (): Promise<CategoryDto[]> => {
    try {
      const response = await api.get('/masterdata/categories');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    } catch {
      console.warn('[Offline Mode] Returning empty categories');
      return [];
    }
  },

  // 11.8 Get System Statuses: GET /api/masterdata/statuses
  getStatuses: async (type?: string): Promise<StatusDto[]> => {
    try {
      const response = await api.get('/masterdata/statuses', { params: { type } });
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    } catch {
      console.warn('[Offline Mode] Returning empty statuses');
      return [];
    }
  },

  // 11.9 Get Physiotherapists & Clinical Staff: GET /api/masterdata/physiotherapists
  getPhysiotherapists: async (): Promise<UserDto[]> => {
    try {
      const response = await api.get('/masterdata/physiotherapists');
      return Array.isArray(response.data) ? response.data : response.data?.items || MOCK_PHYSIOTHERAPISTS;
    } catch {
      console.warn('[Offline Mode] Returning mock physiotherapists');
      return MOCK_PHYSIOTHERAPISTS;
    }
  },
};

export default masterDataService;
