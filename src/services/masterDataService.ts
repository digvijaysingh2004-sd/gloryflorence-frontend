import api from "./api";
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
} from "../types/api.types";

const extractArray = <T>(resData: any): T[] => {
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.items)) return resData.items;
  return [];
};

export const masterDataService = {
  // 11.1 Get Countries: GET /api/masterdata/countries
  getCountries: async (): Promise<CountryDto[]> => {
    try {
      const response = await api.get("/masterdata/countries");
      return extractArray<CountryDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch countries", err);
      return [];
    }
  },

  // 11.2 Get States: GET /api/masterdata/states
  getStates: async (): Promise<StateDto[]> => {
    try {
      const response = await api.get("/masterdata/states");
      return extractArray<StateDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch states", err);
      return [];
    }
  },

  // 11.3 Get Cities: GET /api/masterdata/cities
  getCities: async (): Promise<CityDto[]> => {
    try {
      const response = await api.get("/masterdata/cities");
      return extractArray<CityDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch cities", err);
      return [];
    }
  },

  // 11.4 Get Genders: GET /api/masterdata/genders
  getGenders: async (): Promise<GenderDto[]> => {
    try {
      const response = await api.get("/masterdata/genders");
      return extractArray<GenderDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch genders", err);
      return [];
    }
  },

  // 11.5 Get Blood Groups: GET /api/masterdata/bloodgroups
  getBloodGroups: async (): Promise<BloodGroupDto[]> => {
    try {
      const response = await api.get("/masterdata/bloodgroups");
      return extractArray<BloodGroupDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch blood groups", err);
      return [];
    }
  },

  // 11.6 Get Clinical Specializations: GET /api/masterdata/specializations
  getSpecializations: async (): Promise<SpecializationDto[]> => {
    try {
      const response = await api.get("/masterdata/specializations");
      return extractArray<SpecializationDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch specializations", err);
      return [];
    }
  },

  // 11.7 Get Categories: GET /api/masterdata/categories
  getCategories: async (): Promise<CategoryDto[]> => {
    try {
      const response = await api.get("/masterdata/categories");
      return extractArray<CategoryDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      return [];
    }
  },

  // 11.8 Get System Statuses: GET /api/masterdata/statuses
  getStatuses: async (type?: string): Promise<StatusDto[]> => {
    try {
      const response = await api.get("/masterdata/statuses", {
        params: { type },
      });
      return extractArray<StatusDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
      return [];
    }
  },

  // 11.9 Get Physiotherapists & Clinical Staff: GET /api/masterdata/physiotherapists
  getPhysiotherapists: async (): Promise<UserDto[]> => {
    try {
      const response = await api.get("/masterdata/physiotherapists");
      return extractArray<UserDto>(response.data);
    } catch (err) {
      console.error("Failed to fetch physiotherapists", err);
      return [];
    }
  },
};

export default masterDataService;
