"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../components/css/Carousel.module.css";

/* ================= STATIC CATEGORY DATA ================= */

const categories = [
  {
    category_name: "Residential Planning",
    category_slug: "residential-planning",
    category_img_thumbnail: "/Service-01.png",
  },
  {
    category_name: "Commercial Development",
    category_slug: "commercial-development",
    category_img_thumbnail: "/Service-02.jpg",
  },
  {
    category_name: "Small Business",
    category_slug: "small-business",
    category_img_thumbnail: "/Service-03.jpg",
  },
  {
    category_name: "Consultant Support",
    category_slug: "consultant-support",
    category_img_thumbnail: "/Service-04.png",
  },
  {
    category_name: "Construction Delivery",
    category_slug: "construction-delivery",
    category_img_thumbnail: "/Construction-5.jpg",
  },
];

/* ================= COMPONENT ================= */

const Carousel: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const getSideCount = (width: number) => {
    if (width < 768) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const [sideCount, setSideCount] = useState(getSideCount(windowWidth));
  const [currentIndex, setCurrentIndex] = useState(sideCount);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      const newSideCount = getSideCount(width);
      setSideCount(newSideCount);
      setCurrentIndex(newSideCount);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredCategories = categories.filter(
    cat => !!cat.category_img_thumbnail
  );

  const useCarousel = filteredCategories.length >= 1;

  const originalImages = filteredCategories.map(
    cat => cat.category_img_thumbnail
  );
  const descriptions = filteredCategories.map(cat => cat.category_name);

  const images = [
    ...originalImages.slice(-sideCount),
    ...originalImages,
    ...originalImages.slice(0, sideCount),
  ];

  const texts = [
    ...descriptions.slice(-sideCount),
    ...descriptions,
    ...descriptions.slice(0, sideCount),
  ];

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  };

  useEffect(() => {
    if (!useCarousel) return;

    if (currentIndex >= originalImages.length + sideCount) {
      requestAnimationFrame(() => {
        setIsTransitioning(false);
        setCurrentIndex(sideCount);
        requestAnimationFrame(() => setIsTransitioning(true));
      });
    } else if (currentIndex < sideCount) {
      requestAnimationFrame(() => {
        setIsTransitioning(false);
        setCurrentIndex(originalImages.length + sideCount - 1);
        requestAnimationFrame(() => setIsTransitioning(true));
      });
    }
  }, [currentIndex, sideCount, originalImages.length, useCarousel]);

  useEffect(() => {
    if (!useCarousel) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [useCarousel]);

  const getTransform = (i: number) => {
    const base = "translate(-50%, -50%)";
    const diff = i - currentIndex;
    const dragOffset = isDragging ? dragDistance * 0.3 : 0;

    return `${base} translateX(${diff * 150 + dragOffset}px) scale(${
      diff === 0 ? 1 : 0.85
    }) rotateY(${diff * -25}deg)`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragDistance(e.clientX - dragStart);
  };

  const handleRelease = () => {
    if (!isDragging) return;
    if (Math.abs(dragDistance) > 50) {
      dragDistance > 0 ? prevSlide() : nextSlide();
    }
    setIsDragging(false);
    setDragDistance(0);
  };

  return (
    <div className={`${styles.carouselContainer} hidden md:block relative`}>
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-gray-800/50 rounded-full p-3"
      >
        ‹
      </button>

      <div
        className={styles.carousel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {images.map((img, i) => {
          const position = i - currentIndex;
          const index =
            (i - sideCount + filteredCategories.length) %
            filteredCategories.length;

          return (
            <Link
              key={i}
              href={`/${filteredCategories[index].category_slug}`}
              className={styles.carouselItem}
              style={{
                transform: getTransform(i),
                zIndex: 10 - Math.abs(position),
                opacity: Math.abs(position) <= sideCount ? 1 : 0,
              }}
            >
              <Image
                src={img}
                alt={texts[i]}
                width={300}
                height={420}
                className={styles.image}
              />
              {position === 0 && (
                <div className={styles.imageText}>{texts[i]}</div>
              )}
            </Link>
          );
        })}
      </div>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-gray-800/50 rounded-full p-3"
      >
        ›
      </button>
    </div>
  );
};

export default Carousel;
