import React from 'react';
import { ProductImage } from '@/types';

interface ImageGalleryProps {
    images: ProductImage[];
    previews: string[];
    onRemoveImage: (index: number) => void;
    onRemovePreview: (index: number) => void;
    onSetMainImage: (index: number) => void;
    isUploading?: boolean;
}

export default function ImageGallery({
    images,
    previews,
    onRemoveImage,
    onRemovePreview,
    onSetMainImage,
    isUploading = false
}: ImageGalleryProps) {
    return (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Существующие изображения */}
            {images.length > 0 && images.map((image, index) => (
                <div key={`image-${index}`} className="relative">
                    <img
                        src={image.url}
                        alt={image.alt || 'Изображение'}
                        className="h-24 w-full object-cover rounded-md"
                        onError={(e) => {
                            console.error(`Ошибка загрузки изображения: ${image.url}`);
                            e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                    />
                    {image.isMain && (
                        <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md">
                            Основное
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onRemoveImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                    >
                        ✕
                    </button>
                    <button
                        type="button"
                        onClick={() => onSetMainImage(index)}
                        className="absolute bottom-0 left-0 bg-blue-500 text-white p-1 text-xs rounded-tr-md"
                    >
                        Сделать основным
                    </button>
                </div>
            ))}

            {/* Превью новых файлов (ещё не загруженных) */}
            {previews.length > 0 && previews.map((preview, index) => (
                <div key={`preview-${index}`} className="relative">
                    <img
                        src={preview}
                        alt={`Превью ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md opacity-70"
                    />
                    <span className="absolute top-0 left-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl-md">
                        Ожидает загрузки
                    </span>
                    <button
                        type="button"
                        onClick={() => onRemovePreview(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                    >
                        ✕
                    </button>
                </div>
            ))}

            {isUploading && (
                <div className="col-span-full bg-blue-50 p-2 text-center rounded">
                    <span className="text-blue-600">Загрузка изображений...</span>
                </div>
            )}

            {images.length === 0 && previews.length === 0 && !isUploading && (
                <div className="col-span-full text-center py-4 text-gray-500">
                    Нет загруженных изображений
                </div>
            )}
        </div>
    );
}