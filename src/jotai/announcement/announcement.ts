/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Announcement } from "./announcement-types";

/*
  |--------------------------------------------------------------------------
  | GET ALL ANNOUNCEMENTS - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get announcements
  |
*/

// State atoms for consistent pattern
export const announcementListAtom = atom<Array<Announcement> | null>(null);
export const announcementLoadingAtom = atom<boolean>(false);
export const announcementErrorAtom = atom<string | null>(null);

export const announcementsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(announcementLoadingAtom, true);
    set(announcementErrorAtom, null);

    try {
      const response = await axiosInstance.get("/announcements");
      set(announcementListAtom, response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch announcements";
      set(announcementErrorAtom, errorMessage);
      console.error("Announcements API Error:", error);
      throw error; // Re-throw to allow handling in components
    } finally {
      set(announcementLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Announcement> => {
    const response = await axiosInstance.get(`/announcements/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/announcements", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/announcements/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/announcements/${id}`);
    return response.data;
  },
};
