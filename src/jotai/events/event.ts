/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { Event } from "./event-types";
import { atom } from "jotai";

/*
  |--------------------------------------------------------------------------
  | EVENTS API - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to create events data
  |
*/

// State atoms for consistent pattern
export const eventListAtom = atom<Array<Event> | null>(null);
export const eventLoadingAtom = atom<boolean>(false);
export const eventErrorAtom = atom<string | null>(null);

export const eventsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(eventLoadingAtom, true);
    set(eventErrorAtom, null);

    try {
      const response = await axiosInstance.get("/events");
      set(eventListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(eventErrorAtom, error.message || "Failed to fetch events");
    } finally {
      set(eventLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Event> => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/events", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  },
};
