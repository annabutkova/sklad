import { Category, Product, ProductImage, ProductSet } from '@/types';

export type EntityType = 'product' | 'set' | 'category';

interface UpdateEntityWithImagesOptions {
    entityType: EntityType;
    entityId: string;
    images: ProductImage[];
    entityData: Product | ProductSet | Category; // Данные сущности для обновления
}

export async function updateEntityWithImages({
    entityType,
    entityId,
    images,
    entityData
}: UpdateEntityWithImagesOptions): Promise<boolean> {
    try {
        // Определяем endpoint в зависимости от типа сущности
        const endpoint = getEndpointForEntity(entityType, entityId);

        // Создаем обновленный объект с изображениями
        const updatedData = {
            ...entityData,
            images
        };

        // Отправляем запрос на обновление
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        return response.ok;
    } catch (error) {
        console.error(`Error updating ${entityType} with images:`, error);
        return false;
    }
}

function getEndpointForEntity(entityType: EntityType, entityId: string): string {
    switch (entityType) {
        case 'product':
            return `/api/admin/products/${entityId}`;
        case 'set':
            return `/api/admin/sets/${entityId}`;
        case 'category':
            return `/api/admin/categories/${entityId}`;
        default:
            throw new Error(`Unknown entity type: ${entityType}`);
    }
}