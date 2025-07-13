import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { loadable } from "jotai/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | GET EXAMS DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get exams data
  |
*/
export const getAllExamsAtom = atom(async () => {
  try {
    const response = await axiosInstance.get(`${url}/exams`);
    return response.data;
  } catch (error) {
    throw error;
  }
});
export const allExamsLoadableAtom = loadable(getAllExamsAtom);

/*
  |--------------------------------------------------------------------------
  | GET INDIVIDUAL EXAMS DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get a single exams data
  |
*/
export const examsIdAtom = atom<number>(0);
export const getIndividualExamAtom = atom(async () => {
  try {
    const response = await axiosInstance.get(`${url}/exams/${examsIdAtom}`);
    return response.data;
  } catch (error) {
    throw error;
  }
});
