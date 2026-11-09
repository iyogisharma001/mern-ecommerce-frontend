import axios from "axios";
import { useEffect, useState } from "react";

/*
  Replacement for 6pp's useFetchData, which
  1) uses plain fetch(), so the Authorization header can't be added, and
  2) caches by a fixed key, so opening coupon B showed coupon A's data.
  This uses axios (token added by the interceptor) and refetches when url changes.
*/
export const useAuthFetch = <T>(url: string) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    axios
      .get<T>(url, { signal: controller.signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(
          (axios.isAxiosError(err) && err.response?.data?.message) ||
            "Something went wrong"
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
};
