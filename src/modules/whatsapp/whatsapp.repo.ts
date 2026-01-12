import Seller from '@database/models/seller.model';
import Pet from '@database/models/pet.model';
import User from '@database/models/user.model';

export class WhatsAppRepository {
    /**
     * Get seller with WhatsApp number by seller ID
     * SECURITY: Only for backend use, never expose to frontend
     */
    async getSellerWithWhatsApp(sellerId: string) {
        return await Seller.findById(sellerId)
            .select('whatsappNumber brandName userId totalWhatsappClicks')
            .populate({
                path: 'userId',
                select: 'name'
            })
            .lean();
    }

    /**
     * Get pet details for WhatsApp message generation
     */
    async getPetDetails(petId: string) {
        return await Pet.findById(petId)
            .select('name breedName category sellerId whatsappClicks')
            .lean();
    }

    /**
     * Increment seller's total WhatsApp clicks
     */
    async incrementSellerWhatsAppClicks(sellerId: string) {
        return await Seller.findByIdAndUpdate(
            sellerId,
            { $inc: { totalWhatsappClicks: 1 } },
            { new: true }
        );
    }

    /**
     * Increment pet's WhatsApp clicks
     */
    async incrementPetWhatsAppClicks(petId: string) {
        return await Pet.findByIdAndUpdate(
            petId,
            { $inc: { whatsappClicks: 1 } },
            { new: true }
        );
    }

    /**
     * Get buyer details (optional, for tracking)
     */
    async getBuyerDetails(buyerId: string) {
        return await User.findById(buyerId)
            .select('name email')
            .lean();
    }
}
