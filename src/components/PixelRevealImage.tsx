"use client";

import { useEffect, useRef, useState } from "react";

interface PixelRevealImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  pixelSize?: number;       // Starting pixel block size (higher = more pixelated)
  duration?: number;        // Total animation duration in ms
  className?: string;
  delay?: number;           // Delay before animation starts in ms
}

/**
 * PixelRevealImage — renders an image with a canvas-based pixel-reveal animation.
 * The image starts as large colour blocks (pixelated) and gradually resolves
 * into crisp full detail, triggered when the element enters the viewport.
 */
export default function PixelRevealImage({
  src,
  alt,
  width,
  height,
  pixelSize = 32,
  duration = 1400,
  className = "",
  delay = 0,
}: PixelRevealImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load and cache the image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
    };
    return () => {
      img.onload = null;
    };
  }, [src]);

  // Observe when canvas enters viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !revealed) {
          setTimeout(() => startAnimation(), delay);
        }
      },
      { threshold: 0.25 }
    );
    observerRef.current.observe(canvas);

    return () => observerRef.current?.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, delay]);

  function drawPixelated(ctx: CanvasRenderingContext2D, img: HTMLImageElement, blockSize: number) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Draw image at full size first
    ctx.drawImage(img, 0, 0, w, h);

    if (blockSize <= 1) return; // Fully revealed — keep crisp

    // Sample pixel colour in each block and fill with that solid colour
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    ctx.clearRect(0, 0, w, h);

    for (let y = 0; y < h; y += blockSize) {
      for (let x = 0; x < w; x += blockSize) {
        const bw = Math.min(blockSize, w - x);
        const bh = Math.min(blockSize, h - y);
        // Sample the center pixel of the block
        const cx = Math.min(x + Math.floor(bw / 2), w - 1);
        const cy = Math.min(y + Math.floor(bh / 2), h - 1);
        const idx = (cy * w + cx) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3] / 255;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(x, y, bw, bh);
      }
    }
  }

  function startAnimation() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setRevealed(true);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 → 1

      // Exponential easing: pixel block shrinks quickly at start, slowly at end
      // blockSize goes from pixelSize → 1
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentBlock = Math.max(1, Math.round(pixelSize * (1 - eased)));

      drawPixelated(ctx, img, currentBlock);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Final: draw the crisp full image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={alt}
    >
      {/* Fallback image (hidden visually — canvas renders on top) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: "block" }}
      />
    </div>
  );
}
