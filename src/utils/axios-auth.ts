import axios from "axios";
import { getAuthToken } from "../redux/api/baseQuery";

// Adds the Firebase ID token to every axios request made by the app.
// Imported once in main.tsx.
axios.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
