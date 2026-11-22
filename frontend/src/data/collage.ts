export interface CollageImage {
  id: string;
  src: string;
  alt: string;
  style: "polaroid" | "golden" | "arch" | "pinned" | "canvas";
  aspect: "square" | "portrait" | "landscape" | "tall";
  rotation?: string;
}

export const fallbackCollageImages: string[] = [
  "/images/collage/photo-01.png",
  "/images/collage/photo-02.png",
  "/images/collage/photo-03.png",
  "/images/collage/photo-04.png",
  "/images/collage/photo-05.png",
  "/images/collage/photo-06.png",
  "/images/collage/photo-07.jpg",
  "/images/collage/photo-08.png",
  "/images/collage/photo-09.jpg",
  "/images/collage/photo-10.png",
  "/images/collage/photo-11.jpg",
  "/images/collage/photo-12.png",
];
