// src/components/shop/SpecificationsTable.tsx
import React from 'react';
import SpecificationRow from './SpecificationRow';

interface Specifications {
    material?: {
        karkas?: string;
        fasad?: string;
        ruchki?: string;
        obivka?: string;
        spinka?: string;
    };
    style?: {
        style?: string;
        color?: {
            karkas?: string;
            fasad?: string;
            ruchki?: string;
            obivka?: string;
            spinka?: string;
        };
    };
    dimensions?: {
        width?: number;
        height?: number;
        depth?: number;
        length?: number;
    };
    bedSize?: string;
    content?: {
        polki?: number;
        yashiki?: number;
        shtanga?: number;
    };
    warranty?: {
        duration?: number;
        lifetime?: number;
        production?: string;
    };
}

interface SpecificationsTableProps {
    specifications: Specifications;
    className?: string;
    sectionHeaderClassName?: string;
}

const SpecificationsTable: React.FC<SpecificationsTableProps> = ({
    specifications,
    className = "product-page_table",
    sectionHeaderClassName = "text-lg font-semibold text-gray-800 mt-4 mb-2"
}) => {
    const hasData = (
        (specifications.material && Object.values(specifications.material).some(v => v)) ||
        (specifications.style && (
            specifications.style.style ||
            (specifications.style.color && Object.values(specifications.style.color).some(v => v))
        )) ||
        (specifications.dimensions && Object.values(specifications.dimensions).some(v => typeof v === 'number' && v > 0)) ||
        specifications.bedSize ||
        (specifications.content && Object.values(specifications.content).some(v => typeof v === 'number' && v > 0)) ||
        (specifications.warranty && Object.values(specifications.warranty).some(v => v))
    );

    if (!hasData) {
        return null; // Если нет данных, не показываем блок
    }

    const hasMaterialData = specifications.material && Object.values(specifications.material).some(v => v);

    const hasStyleData = specifications.style && (
        specifications.style.style ||
        (specifications.style.color && Object.values(specifications.style.color).some(v => v))
    );

    const hasDimensionsData = (
        (specifications.dimensions && (
            (typeof specifications.dimensions.width === 'number' && specifications.dimensions.width > 0) ||
            (typeof specifications.dimensions.height === 'number' && specifications.dimensions.height > 0) ||
            (typeof specifications.dimensions.depth === 'number' && specifications.dimensions.depth > 0) ||
            (typeof specifications.dimensions.length === 'number' && specifications.dimensions.length > 0)
        )) ||
        specifications.bedSize
    );

    const hasContentData = specifications.content && (
        (typeof specifications.content.polki === 'number' && specifications.content.polki > 0) ||
        (typeof specifications.content.yashiki === 'number' && specifications.content.yashiki > 0) ||
        (typeof specifications.content.shtanga === 'number' && specifications.content.shtanga > 0)
    );

    const hasWarrantyData = specifications.warranty && Object.values(specifications.warranty).some(v => v);

    return (
        <div className={className}>
            {/* Материалы - с групповым заголовком */}
            {hasMaterialData && (
                <>
                    <h3 className={sectionHeaderClassName}>Материалы</h3>
                    {specifications.material?.karkas && (
                        <SpecificationRow label="Материал каркаса" value={specifications.material.karkas} />
                    )}
                    {specifications.material?.fasad && (
                        <SpecificationRow label="Материал фасада" value={specifications.material.fasad} />
                    )}
                    {specifications.material?.ruchki && (
                        <SpecificationRow label="Материал ручек" value={specifications.material.ruchki} />
                    )}
                    {specifications.material?.obivka && (
                        <SpecificationRow label="Материал обивки" value={specifications.material.obivka} />
                    )}
                    {specifications.material?.spinka && (
                        <SpecificationRow label="Материал спинки" value={specifications.material.spinka} />
                    )}
                </>
            )}

            {/* Стиль и цвета - с групповым заголовком */}
            {hasStyleData && (
                <>
                    <h3 className={sectionHeaderClassName}>Стиль</h3>
                    {specifications.style?.style && (
                        <SpecificationRow label="Стиль" value={specifications.style.style} />
                    )}
                    {specifications.style?.color?.karkas && (
                        <SpecificationRow label="Цвет каркаса" value={specifications.style.color.karkas} />
                    )}
                    {specifications.style?.color?.fasad && (
                        <SpecificationRow label="Цвет фасада" value={specifications.style.color.fasad} />
                    )}
                    {specifications.style?.color?.ruchki && (
                        <SpecificationRow label="Цвет ручек" value={specifications.style.color.ruchki} />
                    )}
                    {specifications.style?.color?.obivka && (
                        <SpecificationRow label="Цвет обивки" value={specifications.style.color.obivka} />
                    )}
                    {specifications.style?.color?.spinka && (
                        <SpecificationRow label="Цвет спинки" value={specifications.style.color.spinka} />
                    )}
                </>
            )}

            {hasDimensionsData && specifications.dimensions &&
                ((typeof specifications.dimensions.width === 'number' && specifications.dimensions.width > 0) &&
                    (typeof specifications.dimensions.height === 'number' && specifications.dimensions.height > 0) &&
                    ((typeof specifications.dimensions.depth === 'number' && specifications.dimensions.depth > 0) ||
                        (typeof specifications.dimensions.length === 'number' && specifications.dimensions.length > 0))) && (
                    <>
                        <h3 className={sectionHeaderClassName}>Габариты</h3>

                        {typeof specifications.dimensions.width === 'number' && specifications.dimensions.width > 0 && (
                            <SpecificationRow label="Ширина, см" value={specifications.dimensions.width} />
                        )}
                        {typeof specifications.dimensions.height === 'number' && specifications.dimensions.height > 0 && (
                            <SpecificationRow label="Высота, см" value={specifications.dimensions.height} />
                        )}
                        {typeof specifications.dimensions.depth === 'number' && specifications.dimensions.depth > 0 && (
                            <SpecificationRow label="Глубина, см" value={specifications.dimensions.depth} />
                        )}
                        {typeof specifications.dimensions.length === 'number' && specifications.dimensions.length > 0 && (
                            <SpecificationRow label="Длина, см" value={specifications.dimensions.length} />
                        )}
                        {specifications.bedSize && (
                            <SpecificationRow label="Размер спального места (Ш х Д), см" value={specifications.bedSize} />
                        )}
                    </>
                )}

            {/* Наполнение - с групповым заголовком */}
            {hasContentData && (
                <>
                    <h3 className={sectionHeaderClassName}>Наполнение</h3>
                    {typeof specifications.content?.polki === 'number' && specifications.content.polki > 0 && (
                        <SpecificationRow label="Полки" value={specifications.content.polki + " шт"} />
                    )}
                    {typeof specifications.content?.yashiki === 'number' && specifications.content.yashiki > 0 && (
                        <SpecificationRow label="Ящики" value={specifications.content.yashiki + " шт"} />
                    )}
                    {typeof specifications.content?.shtanga === 'number' && specifications.content.shtanga > 0 && (
                        <SpecificationRow label="Штанги" value={specifications.content.shtanga + " шт"} />
                    )}
                </>
            )}

            {/* Гарантия - с групповым заголовком */}
            {hasWarrantyData && (
                <>
                    <h3 className={sectionHeaderClassName}>Гарантия</h3>
                    {typeof specifications.warranty?.duration === 'number' && specifications.warranty.duration > 0 && (
                        <SpecificationRow label="Гарантия на фурнитуру" value={`${specifications.warranty.duration} месяцев`} />
                    )}
                    {specifications.warranty?.production && (
                        <SpecificationRow label="Производство" value={specifications.warranty.production} />
                    )}
                    {typeof specifications.warranty?.lifetime === 'number' && specifications.warranty.lifetime > 0 && (
                        <SpecificationRow label="Срок службы" value={`${specifications.warranty.lifetime} лет`} />
                    )}
                </>
            )}
        </div>
    );
};

export default SpecificationsTable;