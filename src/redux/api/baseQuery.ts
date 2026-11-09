import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { auth } from "../../firebase";

// Gets a fresh Firebase ID token (Firebase refreshes it automatically)
export const getAuthToken = async () => {
  try {
    return (await auth.currentUser?.getIdToken()) || null;
  } catch {
    return null;
  }
};

// fetchBaseQuery that sends "Authorization: Bearer <token>" on every request.
// The backend verifies this token instead of trusting ?id= in the URL.
export const authBaseQuery = (path: string) =>
  fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/${path}/`,
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  });
