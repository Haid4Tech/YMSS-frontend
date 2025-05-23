import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { loadable } from "jotai/utils";
import { CreateParentProp } from "./parenttypes";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | CREATE NEW PARENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to create parent data
  |
*/
export const createParentsAtom = atom(null, async (_get, _set, payload) => {
  try {
    const response = await axiosInstance.post(`${url}/parents`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create parent:", error);
    throw error;
  }
});
