import { FaRegStar, FaStar, FaStarHalfStroke } from "react-icons/fa6";

type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
  // When given, the stars become buttons for picking a rating
  onChange?: (value: number) => void;
};

const Stars = ({ value = 0, size = "md", onChange }: Props) => {
  const stars = [1, 2, 3, 4, 5];

  if (onChange)
    return (
      <div className={`stars stars-${size} stars-input`} role="radiogroup" aria-label="Rating">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
          >
            {star <= value ? <FaStar /> : <FaRegStar />}
          </button>
        ))}
      </div>
    );

  return (
    <span className={`stars stars-${size}`} aria-label={`Rated ${value} out of 5`}>
      {stars.map((star) =>
        value >= star ? (
          <FaStar key={star} />
        ) : value >= star - 0.5 ? (
          <FaStarHalfStroke key={star} />
        ) : (
          <FaRegStar key={star} />
        )
      )}
    </span>
  );
};

export default Stars;
