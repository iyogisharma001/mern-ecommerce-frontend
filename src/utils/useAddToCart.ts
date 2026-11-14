import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/reducer/cartReducer";
import { RootState } from "../redux/store";
import { CartItem } from "../types/types";

// Adds to the cart without ever going over the available stock
export const useAddToCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cartReducer.cartItems);

  return (item: CartItem) => {
    if (item.stock < 1) return toast.error("Sorry, this item is sold out");

    const inCart = cartItems.find((i) => i.productId === item.productId)?.quantity || 0;
    const quantity = Math.min(inCart + item.quantity, item.stock);
    if (quantity === inCart) return toast.error(`Only ${item.stock} available`);

    dispatch(addToCart({ ...item, quantity }));
    toast.success(inCart ? "Cart updated" : "Added to cart");
  };
};
