import axios from "axios";
import { atom } from "jotai";
import { loadable } from "jotai/utils";
import { GetStudentResponse } from "./studenttypes";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | GET ALL STUDENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get student data
  |
*/
export const allStudentsResult = atom<GetStudentResponse | null>(null);

export const getAllStudentsAtom = atom(async () => {
  try {
    const response = await axios.get(`${url}/students`);
    return response.data;
    // set(allStudentsResult, response.data);
  } catch (error) {
    throw error;
  }
});

export const allStudentLoadableAtom = loadable(getAllStudentsAtom);
