declare module "@splidejs/react-splide" {
  import { ComponentType, ReactNode } from "react";

  interface SplideProps {
    options?: Record<string, unknown>;
    hasTrack?: boolean;
    children?: ReactNode;
    className?: string;
  }

  interface SplideSlideProps {
    children?: ReactNode;
    className?: string;
  }

  interface SplideTrackProps {
    children?: ReactNode;
    className?: string;
  }

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType<SplideSlideProps>;
  export const SplideTrack: ComponentType<SplideTrackProps>;
}
