import { getAllSellerPendingRequests } from "../../repos/sellerRequestRepo";

export const getAllPendingRequestsService = async () => {
    try {
        const pendingRequests = await getAllSellerPendingRequests();
        if (!pendingRequests || pendingRequests.length === 0) {
            return []; // No pending requests found
        }

        return pendingRequests;
    } catch (error) {
        throw new Error("Something went wrong while fetching pending requests");
    }
}