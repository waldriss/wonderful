import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errors';

// Ensure storage directory exists
const STORAGE_BASE = path.join(process.cwd(), 'storage', 'documents');

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpeg', '.jpg', '.png', '.webp'];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Create storage directory for a dossier
 */
export function ensureDossierStorageDir(dossierId: string): string {
  const dossierDir = path.join(STORAGE_BASE, dossierId);
  if (!fs.existsSync(dossierDir)) {
    fs.mkdirSync(dossierDir, { recursive: true });
  }
  return dossierDir;
}

/**
 * File filter to validate uploads
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new AppError(`Type de fichier non autorisé: ${file.mimetype}. Autorisés: PDF, JPEG, PNG`, 400));
    return;
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new AppError(`Extension non autorisée: ${ext}. Autorisées: .pdf, .jpeg, .jpg, .png`, 400));
    return;
  }

  cb(null, true);
};

/**
 * Generate unique filename
 */
function generateFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const baseName = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
  return `${baseName}_${timestamp}_${random}${ext}`;
}

/**
 * Multer disk storage configuration
 * Files are stored in /storage/documents/{dossierId}/
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get dossierId from params or body
    const dossierId = req.params.dossierId || req.params.id || req.body.dossierId;
    
    if (!dossierId) {
      cb(new Error('dossierId is required for file upload'), '');
      return;
    }

    const dossierDir = ensureDossierStorageDir(dossierId);
    cb(null, dossierDir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  },
});

/**
 * Multer upload instance for single file upload
 */
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('file');

/**
 * Multer upload instance for multiple files (max 10)
 */
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
}).array('files', 10);

/**
 * Memory storage for identity documents (to process before saving)
 */
const memoryStorage = multer.memoryStorage();

export const uploadIdentityToMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for identity docs
    files: 1,
  },
}).single('file');

/**
 * Validate file utility
 */
export function validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Aucun fichier fourni' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, error: `Type de fichier non autorisé: ${file.mimetype}` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}

/**
 * Get file info from path
 */
export function getFileInfo(filePath: string): { exists: boolean; size?: number; mimeType?: string } {
  try {
    if (!fs.existsSync(filePath)) {
      return { exists: false };
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let mimeType = 'application/octet-stream';
    if (ext === '.pdf') mimeType = 'application/pdf';
    else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';

    return {
      exists: true,
      size: stats.size,
      mimeType,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Delete a file from storage
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================
// PRODUCT IMAGE UPLOAD
// ============================================

const PRODUCTS_STORAGE = path.join(process.cwd(), 'storage', 'products');

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTS = ['.jpeg', '.jpg', '.png', '.webp'];
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_BYTES: Record<string, { bytes: number[]; offset?: number }[]> = {
  'image/jpeg': [{ bytes: [0xff, 0xd8, 0xff] }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46] }],
};

const MIME_TO_EXT: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

function ensureProductStorageDir(): string {
  if (!fs.existsSync(PRODUCTS_STORAGE)) {
    fs.mkdirSync(PRODUCTS_STORAGE, { recursive: true });
  }
  return PRODUCTS_STORAGE;
}

function generateSecureFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const sanitizedBase = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 20)
    .toLowerCase();
  const uuid = uuidv4();
  return sanitizedBase ? `${sanitizedBase}-${uuid}${ext}` : `${uuid}${ext}`;
}

function validateExtensionMimeMatch(ext: string, mimeType: string): boolean {
  const allowed = MIME_TO_EXT[mimeType];
  return allowed ? allowed.includes(ext.toLowerCase()) : false;
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) => {
    const offset = sig.offset || 0;
    if (buffer.length < offset + sig.bytes.length) return false;
    return sig.bytes.every((byte, i) => buffer[offset + i] === byte);
  });
}

const productImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ensureProductStorageDir());
  },
  filename: (_req, file, cb) => {
    cb(null, generateSecureFilename(file.originalname));
  },
});

const productImageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    cb(new AppError(`Type non autorisé: ${file.mimetype}. Seules les images JPEG, PNG et WebP sont acceptées.`, 400));
    return;
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
    cb(new AppError(`Extension non autorisée: ${ext}. Autorisées: .jpeg, .jpg, .png, .webp`, 400));
    return;
  }
  if (!validateExtensionMimeMatch(ext, file.mimetype)) {
    cb(new AppError(`L'extension ${ext} ne correspond pas au type ${file.mimetype}`, 400));
    return;
  }
  const sanitized = path.basename(file.originalname);
  if (sanitized !== file.originalname || file.originalname.includes('..')) {
    cb(new AppError('Nom de fichier invalide', 400));
    return;
  }
  cb(null, true);
};

/**
 * Multer middleware for product image upload.
 * Accepts:
 *   - field "image"  : 1 file  — primary/cover image
 *   - field "images" : up to 5 — secondary carousel images
 */
export const uploadProductImage = multer({
  storage: productImageStorage,
  fileFilter: productImageFilter,
  limits: { fileSize: MAX_PRODUCT_IMAGE_SIZE, files: 6 },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

/**
 * Post-upload middleware: validates magic bytes on all uploaded product images.
 * Must run AFTER uploadProductImage.
 */
export function validateProductImageMagicBytes(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const allFiles: Express.Multer.File[] = [];
  if (filesMap?.image) allFiles.push(...filesMap.image);
  if (filesMap?.images) allFiles.push(...filesMap.images);

  for (const file of allFiles) {
    const { path: filePath, mimetype } = file;
    try {
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(12);
      fs.readSync(fd, buffer, 0, 12, 0);
      fs.closeSync(fd);
      if (!validateMagicBytes(buffer, mimetype)) {
        // Clean up all uploaded files before rejecting
        for (const f of allFiles) {
          try { fs.unlinkSync(f.path); } catch { /* ignore */ }
        }
        return next(new AppError('Le contenu du fichier ne correspond pas au type déclaré. Fichier rejeté.', 400));
      }
    } catch (error) {
      for (const f of allFiles) {
        if (fs.existsSync(f.path)) {
          try { fs.unlinkSync(f.path); } catch { /* ignore */ }
        }
      }
      if (error instanceof AppError) return next(error);
      return next(new AppError('Erreur lors de la validation du fichier', 500));
    }
  }
  next();
}

/**
 * Build the public URL path for a product image filename.
 */
export function buildProductImageUrl(filename: string | undefined | null): string | null {
  if (!filename) return null;
  return `/storage/products/${filename}`;
}

/**
 * Delete a product image file from disk.
 * Accepts the stored URL (/storage/products/foo.jpg) or just the filename.
 */
export function deleteProductImage(imageUrlOrFilename: string | null | undefined): void {
  if (!imageUrlOrFilename) return;
  const filename = path.basename(imageUrlOrFilename);
  const fullPath = path.join(PRODUCTS_STORAGE, filename);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch { /* ignore */ }
  }
}

/**
 * Delete an array of product image URLs/filenames from disk.
 */
export function deleteProductImages(urls: string[]): void {
  for (const url of urls) deleteProductImage(url);
}
