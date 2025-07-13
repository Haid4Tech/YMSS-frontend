// import axiosInstance from "@/utils/axios-instance";
// import { atom } from "jotai";
// import { loadable } from "jotai/utils";
// import { GetStudentResponse } from "./student-types";

// const url = process.env.NEXT_PUBLIC_API_URL;

// /*
//   |--------------------------------------------------------------------------
//   | GET ALL ANNOUCEMENTS - JOTAI
//   |--------------------------------------------------------------------------
//   | Consuming apis to get announcements
//   |
// */
// export const allAnnoucements = atom<GetStudentResponse | null>(null);

// export const getAllAnnoucementAtom = atom(async () => {
//   try {
//     const response = await axiosInstance.get(`${url}/students`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// });

// export const allStudentLoadableAtom = loadable(getAllStudentsAtom);
