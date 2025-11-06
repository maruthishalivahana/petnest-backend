import { Request, Response, NextFunction } from "express";

export const handleMulterErrors = (uploadMiddleware: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        uploadMiddleware(req, res, (err: any) => {
            if (err) {
                console.error("Upload error:", err);

                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({
                        message: "Unexpected file field",
                        error: `Field '${err.field}' is not allowed.`,
                        hint: "Valid fields: idProof, certificate, shopImage, logoUrl"
                    });
                }

                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        message: "File too large",
                        error: "File size must not exceed 5MB"
                    });
                }

                return res.status(400).json({
                    message: "File upload failed",
                    error: err.message
                });
            }
            next(); // Continue to controller
        });
    };
};
