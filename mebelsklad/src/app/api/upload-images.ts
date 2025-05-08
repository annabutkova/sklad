import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import formidable from 'formidable';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile {
  url: string;
  filename: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const { fields, files } = await parseForm(req);
    const folderSlug = Array.isArray(fields.folderSlug)
      ? fields.folderSlug[0]
      : fields.folderSlug || 'default';

    // Create folder if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads', folderSlug as string);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process uploaded files
    const uploadedImages = files.images
      ? await saveUploadedFiles(files.images, uploadDir, folderSlug as string)
      : [];

    res.status(200).json({
      message: 'Images uploaded successfully',
      uploadedImages
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ message: 'Error handling file upload' });
  }
}

// Helper function to parse form with formidable
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields, files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable();

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

// Helper function to save uploaded files
const saveUploadedFiles = async (
  fileData: formidable.File | formidable.File[],
  uploadDir: string,
  folderSlug: string
): Promise<UploadedFile[]> => {
  // Ensure we have an array of files
  const files = Array.isArray(fileData) ? fileData : [fileData];
  const savedFiles: UploadedFile[] = [];

  for (const file of files) {
    // Create a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalFilename || 'unknown');
    const newFilename = `image-${timestamp}-${randomString}${ext}`;

    // Set the destination path
    const destPath = path.join(uploadDir, newFilename);

    // Move the file (using fs.copyFile and then fs.unlink because fs.rename doesn't work across devices)
    await fs.promises.copyFile(file.filepath, destPath);
    await fs.promises.unlink(file.filepath);

    // Add to saved files array
    savedFiles.push({
      url: `/uploads/${folderSlug}/${newFilename}`,
      filename: file.originalFilename || newFilename
    });
  }

  return savedFiles;
};
