import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Storage for profile pictures
const profilePicStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "petnest/profiles", // folder name in cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"],
        resource_type: "image",
    } as any
});

// Storage for documents (seller verification documents)
const documentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "petnest/documents", // folder name in cloudinary
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
        resource_type: "auto", // allows both images and PDFs
    } as any
});

// Upload middleware for profile pictures
const upload = multer({
    storage: profilePicStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB file size limit
    fileFilter: (req, file, cb: FileFilterCallback) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed."));
        }
    }
});

// Upload middleware for documents (allows larger files and PDFs)
export const documentUpload = multer({
    storage: documentStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit for documents
    fileFilter: (req, file, cb: FileFilterCallback) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed."));
        }
    }
});

export default upload;
