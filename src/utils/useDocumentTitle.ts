import { useEffect } from "react";
import { STORE } from "../config";

// Sets the browser tab title: "Cart | ShopSphere"
export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${STORE.name}` : `${STORE.name} | ${STORE.tagline}`;
  }, [title]);
};
