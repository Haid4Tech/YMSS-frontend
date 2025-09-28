/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai";
import axiosInstance from "@/utils/axios-instance";
import { Country } from "@/common/types/country";

// Cache for countries to prevent unnecessary API calls
let countriesCache: Country[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Atoms for state management
export const countryListAtom = atom<Country[]>([]);
export const countryLoadingAtom = atom<boolean>(false);
export const countryErrorAtom = atom<string | null>(null);
export const continentListAtom = atom<string[]>([]);

// Helper function to check if cache is valid
const isCacheValid = (): boolean => {
  return countriesCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

// API functions
export const countryAPI = {
  getAll: atom(null, async (_get, set, continent?: string, search?: string) => {
    // Return cached data if available and valid
    if (isCacheValid() && !continent && !search) {
      return countriesCache!;
    }

    set(countryLoadingAtom, true);
    set(countryErrorAtom, null);

    try {
      const params = new URLSearchParams();
      if (continent) params.append("continent", continent);
      if (search) params.append("search", search);

      const response = await axiosInstance.get(
        `/countries?${params.toString()}`
      );
      
      const data = response.data;
      
      // Cache the data if it's the full list without filters
      if (!continent && !search) {
        countriesCache = data;
        cacheTimestamp = Date.now();
      }
      
      set(countryListAtom, data);
      return data;
    } catch (error: any) {
      set(countryErrorAtom, error.message || "Failed to fetch countries");
      throw error;
    } finally {
      set(countryLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Country> => {
    const response = await axiosInstance.get(`/countries/${id}`);
    return response.data;
  },

  getByContinent: atom(null, async (_get, set, continent: string) => {
    set(countryLoadingAtom, true);
    set(countryErrorAtom, null);

    try {
      const response = await axiosInstance.get(
        `/countries/continent/${continent}`
      );
      set(countryListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(
        countryErrorAtom,
        error.message || "Failed to fetch countries by continent"
      );
      throw error;
    } finally {
      set(countryLoadingAtom, false);
    }
  }),

  getContinents: atom(null, async (_get, set) => {
    set(countryLoadingAtom, true);
    set(countryErrorAtom, null);

    try {
      const response = await axiosInstance.get("/countries/continents");
      set(continentListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(countryErrorAtom, error.message || "Failed to fetch continents");
      throw error;
    } finally {
      set(countryLoadingAtom, false);
    }
  }),
};
