// src/app/api/upload-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const folderSlug = formData.get('folderSlug') as string;
        const productSlug = formData.get('productSlug') as string;
        const files = formData.getAll('images') as File[];

        // Создаем директории для загрузки
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const folderDir = join(uploadDir, folderSlug);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        if (!existsSync(folderDir)) {
            await mkdir(folderDir, { recursive: true });
        }

        // Сохраняем файлы и собираем информацию о загруженных изображениях
        const uploadedImages = await Promise.all(
            files.map(async (file, index) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = `${productSlug}-${index + 1}.${file.name.split('.').pop()}`;
                const filepath = join(folderDir, filename);

                await writeFile(filepath, buffer);

                return {
                    url: `/uploads/${folderSlug}/${filename}`,
                    filename: file.name
                };
            })
        );

        return NextResponse.json({ uploadedImages });
    } catch (error) {
        console.error('Error uploading images:', error);
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
    }
}