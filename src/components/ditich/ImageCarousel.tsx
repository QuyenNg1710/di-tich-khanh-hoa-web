"use client";

import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/splide/css";

interface Props {
  images: { id: number; url: string; moTa?: string | null }[];
  fallback?: string;
}

export default function ImageCarousel({ images, fallback }: Props) {
  const allImages = images.length > 0
    ? images
    : fallback
      ? [{ id: 0, url: fallback, moTa: null }]
      : [];

  if (allImages.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl flex items-center justify-center text-6xl">
        🏛️
      </div>
    );
  }

  if (allImages.length === 1) {
    return (
      <div className="aspect-[4/3] rounded-2xl overflow-hidden">
        <img
          src={allImages[0].url}
          alt={allImages[0].moTa || ""}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <Splide
      hasTrack={false}
      options={{
        type: "loop",
        perPage: 1,
        autoplay: true,
        interval: 4000,
        pauseOnHover: true,
        pagination: true,
        arrows: true,
        speed: 600,
        classes: {
          pagination: "splide__pagination custom-pagination",
          arrow: "splide__arrow custom-arrow",
        },
      }}
    >
      <div className="relative rounded-2xl overflow-hidden">
        <SplideTrack>
          {allImages.map((img) => (
            <SplideSlide key={img.id}>
              <div className="aspect-[4/3]">
                <img
                  src={img.url}
                  alt={img.moTa || ""}
                  className="w-full h-full object-cover"
                />
              </div>
            </SplideSlide>
          ))}
        </SplideTrack>
      </div>

      <style jsx global>{`
        .custom-pagination {
          bottom: 12px !important;
          gap: 6px;
        }
        .custom-pagination .splide__pagination__page {
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.5);
          border: none;
          opacity: 1;
          transition: all 0.3s;
        }
        .custom-pagination .splide__pagination__page.is-active {
          background: white;
          transform: scale(1.3);
        }
        .custom-arrow {
          background: rgba(0,0,0,0.3) !important;
          width: 36px !important;
          height: 36px !important;
          opacity: 0;
          transition: opacity 0.3s !important;
        }
        .custom-arrow svg {
          fill: white !important;
          width: 16px !important;
          height: 16px !important;
        }
        .custom-arrow:hover {
          background: rgba(0,0,0,0.5) !important;
        }
        .splide:hover .custom-arrow {
          opacity: 1;
        }
      `}</style>
    </Splide>
  );
}
