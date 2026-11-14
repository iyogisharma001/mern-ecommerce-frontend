import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { transformImage } from "../utils/features";

const ImageGallery = ({ images, alt }: { images: string[]; alt: string }) => {
  const [active, setActive] = useState(0);

  // New product -> start from the first photo
  useEffect(() => {
    setActive(0);
  }, [images]);

  if (!images.length) return <div className="gallery-main gallery-empty" />;

  const go = (step: number) =>
    setActive((i) => (i + step + images.length) % images.length);

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={transformImage(images[active], 900)} alt={`${alt} - photo ${active + 1}`} />
        {images.length > 1 && (
          <>
            <button className="gallery-nav prev" onClick={() => go(-1)} aria-label="Previous photo">
              <FaChevronLeft />
            </button>
            <button className="gallery-nav next" onClick={() => go(1)} aria-label="Next photo">
              <FaChevronRight />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={src}
              className={i === active ? "active" : ""}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
            >
              <img src={transformImage(src, 160)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
