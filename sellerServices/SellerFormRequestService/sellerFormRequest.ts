import { SellerRequestDataSchema, SellerRequestFullData } from "../../validations/sellerRequestData.validation";
import { sendSellerRequest } from "../../repos/sellerRequestRepo";
import { getSellerRequestByUserId } from "../../repos/sellerRequestRepo";


export const createSellerFromRequestService = async (
    body: any,
    userId: string,
    files: { [fieldname: string]: Express.Multer.File[] }
) => {
    // Business logic to create a seller form request
    try {
        console.log("Service - Received body:", body);
        console.log("Service - Received files:", files);

        const existingRequest = await getSellerRequestByUserId(userId);

        // Validate the body data (without documents)
        const validationResult = SellerRequestDataSchema.safeParse(body);
        if (!validationResult.success) {
            console.error("Validation errors:", validationResult.error.issues);
            throw validationResult.error; // Throw Zod error instead of generic Error
        }

        const safeData = validationResult.data;

        if (existingRequest && existingRequest.status === "pending") {
            throw new Error("your request under pending review  wait for admin response!");
        }
        if (existingRequest && existingRequest.status === "verified") {
            throw new Error("You are already an approved seller.");
        }

        // Extract Cloudinary URLs from uploaded files
        const idProofUrl = files?.idProof?.[0]?.path;
        const certificateUrl = files?.certificate?.[0]?.path;
        const shopImageUrl = files?.shopImage?.[0]?.path;

        console.log("Extracted URLs:", { idProofUrl, certificateUrl, shopImageUrl });

        // Validate that required files are uploaded
        if (!idProofUrl || !certificateUrl) {
            throw new Error("ID proof and certificate are required");
        }

        // Create the full seller request data
        const fullRequestData: SellerRequestFullData = {
            ...safeData,
            userId: userId,
            documents: {
                idProof: idProofUrl,
                certificate: certificateUrl,
                shopImage: shopImageUrl,
            },
            verificationDate: undefined,
            verificationNotes: undefined,
        };

        // Create the seller request
        const newSellerRequest = await sendSellerRequest(fullRequestData as any);

        return newSellerRequest;

    } catch (error) {
        throw error;
    }
}