// src/app/api/upload-images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const folderSlug = formData.get('folderSlug') as string || 'default';
        const productSlug = formData.get('productSlug') as string || '';
        const files = formData.getAll('images') as File[];

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public/uploads', folderSlug);
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            console.log('Directory already exists or cannot be created');
        }

        // Get existing files to determine next file number
        let existingFiles: string[] = [];
        try {
            existingFiles = await readdir(uploadDir);
        } catch (error) {
            console.log('Error reading directory or directory does not exist');
        }

        // Check if a base file (without number) exists
        const baseFileExists = productSlug
            ? existingFiles.some(file => file.startsWith(`${productSlug}.`))
            : existingFiles.some(file => file.startsWith('file.'));

        // Filter files with same slug prefix and get the highest number
        const slugPrefix = productSlug ? `${productSlug}-` : 'file-';
        const fileNumberRegex = new RegExp(`^${slugPrefix}(\\d+)\\.(\\w+)$`);

        let maxNumber = 0;
        existingFiles.forEach(file => {
            const match = file.match(fileNumberRegex);
            if (match) {
                const fileNumber = parseInt(match[1], 10);
                maxNumber = Math.max(maxNumber, fileNumber);
            }
        });

        const uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const buffer = await file.arrayBuffer();

            // Get file extension
            const fileExtension = file.name.split('.').pop();

            let filename;

            // If this is the first file and no base file exists yet, use the base name
            if (i === 0 && !baseFileExists) {
                filename = productSlug
                    ? `${productSlug}.${fileExtension}`
                    : `file.${fileExtension}`;
            } else {
                // Otherwise, use numbered naming
                maxNumber++;
                filename = productSlug
                    ? `${productSlug}-${maxNumber}.${fileExtension}`
                    : `file-${maxNumber}.${fileExtension}`;
            }

            const filePath = path.join(uploadDir, filename);

            // Write the file
            await writeFile(filePath, Buffer.from(buffer));

            // Add to uploaded images
            uploadedImages.push({
                url: `/uploads/${folderSlug}/${filename}`,
                alt: file.name,
                filename: file.name
            });
        }

        return NextResponse.json({
            message: 'Images uploaded successfully',
            uploadedImages
        });
    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json(
            { error: 'Error uploading images' },
            { status: 500 }
        );
    }
}