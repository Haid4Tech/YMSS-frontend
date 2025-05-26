import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { loadable } from "jotai/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | SUBJECT API - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get student data
  |
*/
// get all subjects
export const getAllSubjectsAtom = atom(async () => {
  try {
    const response = await axiosInstance.get(`${url}/students`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const allStudentLoadableAtom = loadable(getAllSubjectsAtom);

// create subjects
export const createSubjectAtom = atom(null, async (_get, _set, payload) => {
  try {
    const response = await axiosInstance.post(`${url}/subjects`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create subject:", error);
    throw error;
  }
});
