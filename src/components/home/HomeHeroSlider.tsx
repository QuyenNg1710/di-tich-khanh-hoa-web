"use client";

import { useEffect, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface HeroSlide {
  id: number;
  title: string;
  imageUrl: string | null;
}

interface Props {
  slides: HeroSlide[];
}

export default function HomeHeroSlider({ slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleSlides = slides.length > 1;
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (!hasMultipleSlides) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, slides.length]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <div className="relative h-[360px] overflow-hidden bg-slate-800 md:h-[500px]">
      {slides.length > 0 ? (
        slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-[center_28%] transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            style={
              slide.imageUrl
                ? {
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.18), rgba(15, 23, 42, 0.18)), url(${slide.imageUrl})`,
                  }
                : undefined
            }
          >
            {!slide.imageUrl && (
              <div className="absolute inset-0 bg-gradient-to-r from-teal-800 via-teal-600 to-amber-500" />
            )}
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-800 via-teal-600 to-amber-500" />
      )}

      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg md:text-5xl font-heading">
            {activeSlide?.title || "Di tích Khánh Hòa"}
          </h1>
        </div>
      </div>

      {hasMultipleSlides && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-5 top-1/2 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded border border-white/70 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
            aria-label="Ảnh trước"
          >
            <LuChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-5 top-1/2 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded border border-white/70 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25"
            aria-label="Ảnh tiếp theo"
          >
            <LuChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Chuyển đến ảnh ${index + 1}: ${slide.title}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
