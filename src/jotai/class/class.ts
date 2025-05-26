import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { loadable } from "jotai/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | GET ALL STUDENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get student data
  |
*/
// Get all classes
export const getAllClassAtom = atom(async () => {
  try {
    const response = await axiosInstance.get(`${url}/classes`);
    return response.data;
  } catch (error) {
    throw error;
  }
});
// Loadable atom to track class changes in state
export const allClassLoadableAtom = loadable(getAllClassAtom);

// create class
export const createClassAtom = atom(null, async (_get, _set, payload) => {
  try {
    const response = await axiosInstance.post(`${url}/classes`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create class:", error);
    throw error;
  }
});

// delete specific class
export const deleteClassAtom = atom(
  null,
  async (_get, _set, classId: number) => {
    try {
      const response = await axiosInstance.delete(`${url}/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete class:", error);
      throw error;
    }
  }
);
