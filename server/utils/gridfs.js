import mongoose from 'mongoose';
import { Readable } from 'stream';

/**
 * Returns the active MongoDB GridFSBucket instance.
 * Uses standard 'fs' bucket (creating fs.files and fs.chunks in MongoDB).
 */
export const getGridFSBucket = () => {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB database connection is not ready for GridFS.');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'fs'
  });
};

/**
 * Stores a PDF Buffer in MongoDB GridFS.
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {Object} metadata - Custom metadata (e.g., userId, originalName)
 * @returns {Promise<{ fileId: mongoose.Types.ObjectId, filename: string, length: number }>}
 */
export const uploadToGridFS = (buffer, filename, metadata = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      const safeFilename = (filename || 'resume.pdf')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .slice(-120);

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = bucket.openUploadStream(safeFilename, {
        contentType: 'application/pdf',
        metadata: {
          ...metadata,
          uploadedAt: new Date()
        }
      });

      uploadStream.on('error', (error) => {
        reject(error);
      });

      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          filename: safeFilename,
          length: buffer.length
        });
      });

      readableStream.pipe(uploadStream);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Opens a download stream from GridFS for a given fileId.
 * @param {string|mongoose.Types.ObjectId} fileId
 * @returns {GridFSBucketReadStream}
 */
export const downloadFromGridFS = (fileId) => {
  const bucket = getGridFSBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(objectId);
};

/**
 * Checks if a file exists in GridFS.
 * @param {string|mongoose.Types.ObjectId} fileId
 * @returns {Promise<boolean>}
 */
export const checkGridFSFileExists = async (fileId) => {
  if (!fileId) return false;
  try {
    const bucket = getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    const files = await bucket.find({ _id: objectId }).toArray();
    return files.length > 0;
  } catch {
    return false;
  }
};

/**
 * Deletes a file from GridFS.
 * @param {string|mongoose.Types.ObjectId} fileId
 * @returns {Promise<boolean>}
 */
export const deleteFromGridFS = async (fileId) => {
  if (!fileId) return false;
  try {
    const bucket = getGridFSBucket();
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    await bucket.delete(objectId);
    return true;
  } catch (err) {
    console.warn('GridFS delete notice:', err.message);
    return false;
  }
};
