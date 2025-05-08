// components/ProductGalleryWithLightbox.tsx
'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import type { Swiper as SwiperType } from 'swiper';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

// Import styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'yet-another-react-lightbox/styles.css';

interface Image {
    url: string | StaticImport;
    alt?: string;
}

interface ProductGalleryProps {
    images: Image[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    // Use the correct type for thumbsSwiper
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Convert image URLs to strings for the lightbox
    const lightboxSlides = images.map(image => ({
        src: typeof image.url === 'string' ? image.url : String(image.url),
        alt: image.alt || 'Product image'
    }));

    return (
        <div className="product-gallery">
            <Swiper
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Navigation, Thumbs]}
                onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className="product-slide"
                            onClick={() => setLightboxOpen(true)}
                        >
                            <Image
                                src={image.url}
                                alt={image.alt || 'Product image'}
                                fill
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div className="product-thumbnails">
                            <Image
                                src={image.url}
                                alt={image.alt || 'Product thumbnail'}
                                fill
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
            />
        </div>
    );
}