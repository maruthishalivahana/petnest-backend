import { verifySellerRequestService } from "../../AdminServices/verifySellerRequestService/verifySellerRequest";
import { Request, Response } from "express";
import { z } from "zod";


const paramsSchema = z.object({
    sellerRequestId: z.string(),
    status: z.enum(["pending", "verified", "rejected", "suspended"])
});

const bodySchema = z.object({
    notes: z.string().max(500).optional()
});

const verifySellerRequestController = async (req: Request, res: Response) => {
    try {
        console.log("verifySellerRequestController called");
        console.log("Params:", req.params);
        console.log("Body:", req.body);
        console.log("User:", req.user);

        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const { sellerRequestId, status } = paramsSchema.parse(req.params);
        const { notes } = bodySchema.parse(req.body);

        if (!sellerRequestId) {
            return res.status(400).json({
                message: "Invalid seller request id"
            })
        }

        const verifyResult = await verifySellerRequestService(sellerRequestId, status, notes);

        return res.status(200).json({
            message: `Seller request status updated to ${status}`,
            verifyResult: verifyResult
        })

    } catch (error) {
        console.error("Error verifying seller request:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues
            });
        }

        const errorMessage = (error as Error).message;

        // Business logic errors (return 400 instead of 500)
        if (
            errorMessage.includes("already verified") ||
            errorMessage.includes("already rejected") ||
            errorMessage.includes("not found") ||
            errorMessage.includes("cannot reject") ||
            errorMessage.includes("cannot set") ||
            errorMessage.includes("Invalid status")
        ) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        // Unexpected server errors
        return res.status(500).json({
            message: "Failed to verify seller request",
            error: errorMessage
        });
    }
}
export default verifySellerRequestController;