/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai";
import axiosInstance from "@/utils/axios-instance";
import { Religion } from "@/common/types/religion";

// Cache for religions to prevent unnecessary API calls
let religionsCache: Religion[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Atoms for state management
export const religionListAtom = atom<Religion[]>([]);
export const religionLoadingAtom = atom<boolean>(false);
export const religionErrorAtom = atom<string | null>(null);

// Helper function to check if cache is valid
const isCacheValid = (): boolean => {
  return religionsCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

// API functions
export const religionAPI = {
  getAll: atom(null, async (_get, set) => {
    // Return cached data if available and valid
    if (isCacheValid()) {
      return religionsCache!;
    }

    set(religionLoadingAtom, true);
    set(religionErrorAtom, null);

    try {
      const response = await axiosInstance.get("/religions");
      const data = response.data;
      
      // Cache the data
      religionsCache = data;
      cacheTimestamp = Date.now();
      
      set(religionListAtom, data);
      return data;
    } catch (error: any) {
      set(religionErrorAtom, error.message || "Failed to fetch religions");
      throw error;
    } finally {
      set(religionLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Religion> => {
    const response = await axiosInstance.get(`/religions/${id}`);
    return response.data;
  },
};
