import { updateSellerRequestStatus, getSellerById } from "../../repos/sellerRequestRepo";

export const verifySellerRequestService = async (sellerRequestId: string,
    status: 'pending' | 'verified' | 'rejected' | 'suspended', notes?: string) => {

    const allowed = ["pending", "verified", "rejected", "suspended"];
    if (!allowed.includes(status)) {
        throw new Error("Invalid status value");
    }

    const sellerRequest = await getSellerById(sellerRequestId);
    if (!sellerRequest) {
        throw new Error("Seller request not found");
    }

    if (sellerRequest.status === "verified" && status === "verified") {
        throw new Error("Seller is already verified.");
    }

    if (sellerRequest.status === "rejected" && status === "rejected") {
        throw new Error("Seller request is already rejected.");
    }

    if (sellerRequest.status === "verified" && status === "rejected") {
        throw new Error("You cannot reject a seller who is already verified.");
    }

    if (status === "pending") {
        throw new Error("Admin cannot set seller request to pending.");
    }

    const updatedRequest = await updateSellerRequestStatus(sellerRequestId, status, notes);
    return updatedRequest;
}