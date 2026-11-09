import { createApi } from "@reduxjs/toolkit/query/react";
import { authBaseQuery } from "./baseQuery";
import {
  BarResponse,
  LineResponse,
  PieResponse,
  StatsResponse,
} from "../../types/api-types";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: authBaseQuery("dashboard"),
  endpoints: (builder) => ({
    // The string arg (user id) is no longer sent - the server reads the user
    // from the Bearer token. It is kept so callers compile and so RTK caches
    // per user.
    stats: builder.query<StatsResponse, string>({
      query: () => "stats",
      keepUnusedDataFor: 0,
    }),
    pie: builder.query<PieResponse, string>({
      query: () => "pie",
      keepUnusedDataFor: 0,
    }),
    bar: builder.query<BarResponse, string>({
      query: () => "bar",
      keepUnusedDataFor: 0,
    }),
    line: builder.query<LineResponse, string>({
      query: () => "line",
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useBarQuery, useStatsQuery, useLineQuery, usePieQuery } =
  dashboardApi;
