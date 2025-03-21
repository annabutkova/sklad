"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "./HomeSlider.scss";

interface SlideProps {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

interface HomeSliderProps {
  slides: SlideProps[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function HomeSlider({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: HomeSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  // Go to specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="slider">
      {/* Slides */}
      <div className="slides-wrapper">
        {slides.map((slide, index) => (
          <Link
            href={slide.buttonLink}
            key={index}
            className={`slide ${currentSlide === index ? "active" : ""}`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="slide-img"
              priority={index === 0}
            />
          </Link>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="slide-btn slide-btn--prev"
          aria-label="Previous slide"
        >
          <svg
            width="11"
            height="19"
            viewBox="0 0 11 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18L1.51472 9.51472L10 1.02944"
              stroke="#0056A3"
              strokeWidth="2"
              stroke-linecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="slide-btn slide-btn--next"
          aria-label="Next slide"
        >
          <svg
            width="11"
            height="19"
            viewBox="0 0 11 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L9.48528 9.48528L1 17.9706"
              stroke="#0056A3"
              strokeWidth="2"
              stroke-linecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Slide indicators */}
      <div className="slide-nav">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`slide-nav-btn ${
              currentSlide === index ? "active" : ""
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
