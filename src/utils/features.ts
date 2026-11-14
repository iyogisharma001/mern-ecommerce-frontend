import { MessageResponse } from "../types/api-types";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { SerializedError } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";

type ResType =
  | {
      data: MessageResponse;
    }
  | {
      error: FetchBaseQueryError | SerializedError;
    };

export const responseToast = (
  res: ResType,
  navigate: NavigateFunction | null,
  url: string
) => {
  if ("data" in res) {
    toast.success(res.data.message);
    if (navigate) navigate(url);
  } else {
    const error = res.error as FetchBaseQueryError;
    const messageResponse = error.data as MessageResponse;
    toast.error(messageResponse.message);
  }
};

export const getLastMonths = () => {
  const currentDate = moment();

  currentDate.date(1);

  const last6Months: string[] = [];
  const last12Months: string[] = [];

  for (let i = 0; i < 6; i++) {
    const monthDate = currentDate.clone().subtract(i, "months");
    const monthName = monthDate.format("MMMM");
    last6Months.unshift(monthName);
  }

  for (let i = 0; i < 12; i++) {
    const monthDate = currentDate.clone().subtract(i, "months");
    const monthName = monthDate.format("MMMM");
    last12Months.unshift(monthName);
  }

  return {
    last12Months,
    last6Months,
  };
};

// Resizes Cloudinary images on the fly; other URLs are returned unchanged
export const transformImage = (url = "", width = 200) =>
  url.includes("res.cloudinary.com")
    ? url.replace("upload/", `upload/dpr_auto/w_${width}/`)
    : url;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// 169999 -> "₹1,69,999"
export const formatPrice = (amount: number) => inr.format(amount || 0);

export const formatDate = (date?: string) =>
  date ? moment(date).format("D MMM YYYY") : "";

// "smartphones" -> "Smartphones"
export const titleCase = (text = "") =>
  text.replace(/\b\w/g, (c) => c.toUpperCase());

// Short, readable order number from a Mongo id
export const shortId = (id = "") => `#${id.slice(-8).toUpperCase()}`;
