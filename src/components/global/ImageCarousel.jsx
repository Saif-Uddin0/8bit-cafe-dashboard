import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

const ImageCarousel = ({ images = [], className = "w-full h-full object-cover" }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Normalize images array (can be array of strings or array of objects with url property)
  const imageUrls = React.useMemo(() => {
    if (!Array.isArray(images)) return [];
    return images
      .map((img) => {
        if (typeof img === "string") return img;
        if (img && typeof img === "object") return img.url;
        return null;
      })
      .filter(Boolean);
  }, [images]);

  // Automatic transition for multiple images
  useEffect(() => {
    if (imageUrls.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [imageUrls]);

  if (imageUrls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
        <ImageIcon size={28} />
      </div>
    );
  }

  if (imageUrls.length === 1) {
    return (
      <img
        src={imageUrls[0]}
        alt="Carousel Item"
        className={`${className} rounded-xl`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/150?text=No+Image";
        }}
      />
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % imageUrls.length);
  };

  return (
    <div className="relative w-full h-full group rounded-xl overflow-hidden">
      {/* Images container */}
      <div className="relative w-full h-full">
        {imageUrls.map((url, idx) => (
          <img
            key={url + idx}
            src={url}
            alt={`Slide ${idx + 1}`}
            className={`${className} absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150?text=No+Image";
            }}
          />
        ))}
      </div>

      {/* Navigation arrows - show on hover */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        aria-label="Previous image"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        aria-label="Next image"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/20 px-2 py-1 rounded-full">
        {imageUrls.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(idx);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "bg-white scale-125" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
