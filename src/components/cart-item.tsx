import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CartItem } from "../types/types";
import { formatPrice, transformImage } from "../utils/features";

type Props = {
  cartItem: CartItem;
  incrementHandler: (cartItem: CartItem) => void;
  decrementHandler: (cartItem: CartItem) => void;
  removeHandler: (id: string) => void;
};

const CartItemRow = ({ cartItem, incrementHandler, decrementHandler, removeHandler }: Props) => {
  const { photo, productId, name, price, quantity, stock } = cartItem;

  return (
    <div className="cart-item">
      <Link to={`/product/${productId}`} className="cart-item-media">
        <img src={transformImage(photo, 200)} alt={name} />
      </Link>

      <div className="cart-item-info">
        <Link to={`/product/${productId}`} className="cart-item-name">
          {name}
        </Link>
        <span className="text-muted">{formatPrice(price)} each</span>
        {quantity >= stock && <span className="cart-item-note">Max available quantity</span>}
      </div>

      <div className="qty" aria-label={`Quantity of ${name}`}>
        <button onClick={() => decrementHandler(cartItem)} disabled={quantity <= 1} aria-label="Decrease quantity">
          <FiMinus />
        </button>
        <span>{quantity}</span>
        <button onClick={() => incrementHandler(cartItem)} disabled={quantity >= stock} aria-label="Increase quantity">
          <FiPlus />
        </button>
      </div>

      <strong className="cart-item-total">{formatPrice(price * quantity)}</strong>

      <button className="icon-btn" onClick={() => removeHandler(productId)} aria-label={`Remove ${name}`}>
        <FiTrash2 />
      </button>
    </div>
  );
};

export default CartItemRow;
