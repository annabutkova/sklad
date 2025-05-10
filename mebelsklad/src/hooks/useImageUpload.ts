import { useState, useEffect } from 'react';
import { ProductImage } from '@/types';

interface UseImageUploadOptions {
    initialImages?: ProductImage[];
    entityName?: string; // 'product', 'set', 'category' и т.д.
}

interface UseImageUploadResult {
    images: ProductImage[];
    setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
    imageFiles: File[];
    imagePreviews: string[];
    isUploading: boolean;
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveImage: (index: number) => void;
    handleRemovePreview: (index: number) => void;
    handleSetMainImage: (index: number) => void;
    uploadAllImages: (entityId: string, slug: string, folderSlug: string) => Promise<ProductImage[]>;
    resetUploadState: () => void;
}

export function useImageUpload({
    initialImages = [],
    entityName = 'entity'
}: UseImageUploadOptions = {}): UseImageUploadResult {
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

    // Загрузка всех файлов
    const uploadAllImages = async (
        entityId: string,
        slug: string,
        folderSlug: string
    ): Promise<ProductImage[]> => {
        if (imageFiles.length === 0) {
            return images; // Возвращаем существующие изображения, если новых нет
        }

        setIsUploading(true);

        try {
            // Создаём FormData
            const formData = new FormData();
            formData.append('folderSlug', folderSlug);
            formData.append('productSlug', slug);

            // Добавляем все файлы
            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            // Отправляем на сервер
            const response = await fetch('/api/upload-images', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Создаём массив изображений с правильными URL
            const uploadedImages: ProductImage[] = data.uploadedImages.map(
                (img: { url: string, filename: string }, index: number) => ({
                    url: img.url,
                    alt: entityName, // Можно использовать название сущности или другое значение
                    isMain: index === 0 && images.length === 0
                })
            );

            // Объединяем с существующими изображениями
            const allImages = [...images, ...uploadedImages];
            setImages(allImages);
            return allImages;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        } finally {
            setIsUploading(false);
            resetUploadState();
        }
    };

    // Сброс состояния загрузки
    const resetUploadState = () => {
        // Очищаем файлы после загрузки
        setImageFiles([]);
        // Освобождаем URL объекты для превью
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
    };

    return {
        images,
        setImages,
        imageFiles,
        imagePreviews,
        isUploading,
        handleImageSelect,
        handleRemoveImage,
        handleRemovePreview,
        handleSetMainImage,
        uploadAllImages,
        resetUploadState
    };
}