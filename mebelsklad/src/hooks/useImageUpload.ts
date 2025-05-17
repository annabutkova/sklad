// src/hooks/useImageUpload.ts
import { useState, useEffect } from 'react';
import { ProductImage } from '@/types';

interface UseImageUploadOptions {
    initialImages?: ProductImage[];
    entityName?: string;
}

export function useImageUpload({
    initialImages = [],
    entityName = 'entity'
}: UseImageUploadOptions = {}) {
    const [images, setImages] = useState<ProductImage[]>(initialImages);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Очищаем превью при размонтировании компонента
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    // Обработчик выбора изображений
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Сохраняем файлы для последующей загрузки
        const newFiles = Array.from(files);
        setImageFiles(prev => [...prev, ...newFiles]);

        // Создаём URL превью для отображения
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    // Удаление существующего изображения
    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Удаление превью и файла
    const handleRemovePreview = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Установка главного изображения
    const handleSetMainImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({
            ...img,
            isMain: i === index
        })));
    };

    // Сброс состояния загрузки
    const resetUploadState = () => {
        setIsUploading(false);
        setImageFiles([]);
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
    };

    return {
        images,
        setImages,
        imageFiles,
        imagePreviews,
        isUploading,
        setIsUploading,
        handleImageSelect,
        handleRemoveImage,
        handleRemovePreview,
        handleSetMainImage,
        resetUploadState
    };
}