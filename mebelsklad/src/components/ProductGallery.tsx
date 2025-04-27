"use client"

import { useState, useEffect, useRef, SetStateAction } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
    name: string;
    images: { url: string; alt?: string; isMain?: boolean }[];
}

const ProductGallery = ({ product }: { product: Product }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const sliderRef = useRef<HTMLDivElement>(null);

    // Find initial main image index
    useEffect(() => {
        const mainImageIndex = product.images.findIndex(img => img.isMain);
        if (mainImageIndex !== -1) {
            setCurrentIndex(mainImageIndex);
        }
    }, [product.images]);

    // Handle thumbnail click - set as main image
    const handleThumbnailClick = (index: SetStateAction<number>) => {
        setCurrentIndex(index);
    };

    // Navigate images
    const navigateImage = (direction: number) => {
        const newIndex = (currentIndex + direction + product.images.length) % product.images.length;
        setCurrentIndex(newIndex);
    };

    // Open lightbox
    const openLightbox = () => {
        setLightboxOpen(true);
    };

    // Close lightbox
    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    // Scroll thumbnails into view when currentIndex changes
    useEffect(() => {
        if (sliderRef.current) {
            const scrollPosition = currentIndex * 90; // Approximate width of thumbnail + gap
            sliderRef.current.scrollLeft = scrollPosition;
        }
    }, [currentIndex]);

    // Handle touch events for swiping
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 70) {
            // Swipe left
            navigateImage(1);
        }

        if (touchStart - touchEnd < -70) {
            // Swipe right
            navigateImage(-1);
        }
    };

    // Handle keyboard events
    const handleKeyDown = (e: { key: string; }) => {
        if (lightboxOpen) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'ArrowRight') navigateImage(1);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lightboxOpen, currentIndex]);

    return (
        <div className="product-gallery relative">
            {/* Main Image */}
            <div
                className="relative overflow-hidden rounded-lg cursor-pointer mb-4"
                onClick={openLightbox}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <Image
                    src={product.images[currentIndex].url}
                    alt={product.images[currentIndex].alt || product.name}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto", aspectRatio: "1/1" }}
                    className="object-cover transition-opacity duration-300"
                    priority
                />

                {/* Navigation arrows for main image */}
                <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigateImage(-1);
                    }}
                    aria-label="Previous image"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigateImage(1);
                    }}
                    aria-label="Next image"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
                <div className="relative">
                    <div
                        className="thumbnails-container flex space-x-2 overflow-x-auto scrollbar-hide py-2 px-1"
                        ref={sliderRef}
                    >
                        {product.images.map((image, index) => (
                            <div
                                key={index}
                                className={`
                  flex-shrink-0 w-20 h-20 cursor-pointer transition-all duration-200
                  ${index === currentIndex
                                        ? 'ring-2 ring-blue-500 opacity-100'
                                        : 'border border-gray-200 opacity-70 hover:opacity-100'}
                `}
                                onClick={() => handleThumbnailClick(index)}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.alt || `${product.name} thumbnail ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Thumbnail slider controls */}
                    {product.images.length > 5 && (
                        <>
                            <button
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md z-10"
                                onClick={() => {
                                    if (sliderRef.current) {
                                        sliderRef.current.scrollLeft -= 90;
                                    }
                                }}
                                aria-label="Scroll thumbnails left"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md z-10"
                                onClick={() => {
                                    if (sliderRef.current) {
                                        sliderRef.current.scrollLeft += 90;
                                    }
                                }}
                                aria-label="Scroll thumbnails right"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    <div
                        className="relative max-w-4xl max-h-screen p-4"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-2 right-2 text-white p-2 rounded-full bg-gray-800 hover:bg-gray-700 z-10"
                            onClick={closeLightbox}
                            aria-label="Close lightbox"
                        >
                            <X size={24} />
                        </button>

                        {/* Lightbox navigation */}
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-gray-800 bg-opacity-60 hover:bg-opacity-80"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage(-1);
                            }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-gray-800 bg-opacity-60 hover:bg-opacity-80"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage(1);
                            }}
                            aria-label="Next image"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Lightbox image */}
                        <div className="flex items-center justify-center h-full">
                            <Image
                                src={product.images[currentIndex].url}
                                alt={product.images[currentIndex].alt || `${product.name} image ${currentIndex + 1}`}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "80vh",
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain"
                                }}
                                className="pointer-events-none"
                            />
                        </div>

                        {/* Image counter */}
                        <div className="text-white text-center mt-4">
                            {currentIndex + 1} / {product.images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductGallery;