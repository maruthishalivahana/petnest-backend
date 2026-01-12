import { WhatsAppRepository } from './whatsapp.repo';
import { GenerateWhatsAppLinkDTO, TrackWhatsAppClickDTO } from './whatsapp.types';

export class WhatsAppService {
    private repo: WhatsAppRepository;

    constructor() {
        this.repo = new WhatsAppRepository();
    }

    /**
     * Generate WhatsApp deep link with prefilled message
     * SECURITY: Phone number is NEVER exposed to frontend
     */
    async generateWhatsAppLink(data: GenerateWhatsAppLinkDTO) {
        try {
            const { sellerId, petId } = data;

            // Fetch seller and pet details
            const [seller, pet] = await Promise.all([
                this.repo.getSellerWithWhatsApp(sellerId),
                this.repo.getPetDetails(petId)
            ]);

            // Validate seller exists
            if (!seller) {
                return {
                    success: false,
                    message: 'Seller not found'
                };
            }

            // Validate pet exists
            if (!pet) {
                return {
                    success: false,
                    message: 'Pet not found'
                };
            }

            // Validate seller has WhatsApp number
            if (!seller.whatsappNumber) {
                return {
                    success: false,
                    message: 'Seller WhatsApp number not available'
                };
            }

            // Validate pet belongs to seller
            if (String(pet.sellerId) !== String(sellerId)) {
                return {
                    success: false,
                    message: 'Pet does not belong to this seller'
                };
            }

            // Extract seller name
            const sellerName = seller.brandName || (seller.userId as any)?.name || 'Seller';
            const petName = pet.name;
            const petBreed = pet.breedName;
            const petCategory = pet.category;

            // Generate prefilled message
            const message = this.generateMessage(sellerName, petName, petBreed, petCategory);

            // Encode message for URL
            const encodedMessage = encodeURIComponent(message);

            // Clean phone number (remove spaces, dashes, etc.)
            const cleanPhone = this.cleanPhoneNumber(seller.whatsappNumber);

            // Generate WhatsApp deep link
            const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

            // Generate tracking ID (combination of sellerId and petId)
            const trackingId = `${sellerId}_${petId}`;

            return {
                success: true,
                data: {
                    whatsappLink,
                    trackingId
                }
            };
        } catch (error) {
            console.error('Error generating WhatsApp link:', error);
            throw new Error(`Failed to generate WhatsApp link: ${error}`);
        }
    }

    /**
     * Track WhatsApp click
     * Increment both seller and pet click counts
     */
    async trackWhatsAppClick(data: TrackWhatsAppClickDTO) {
        try {
            const { sellerId, petId } = data;

            // Validate IDs
            if (!sellerId || !petId) {
                return {
                    success: false,
                    message: 'Seller ID and Pet ID are required'
                };
            }

            // Increment clicks in parallel
            await Promise.all([
                this.repo.incrementSellerWhatsAppClicks(sellerId),
                this.repo.incrementPetWhatsAppClicks(petId)
            ]);

            return {
                success: true,
                message: 'WhatsApp click tracked successfully'
            };
        } catch (error) {
            console.error('Error tracking WhatsApp click:', error);
            throw new Error(`Failed to track WhatsApp click: ${error}`);
        }
    }

    /**
     * Generate prefilled WhatsApp message
     */
    private generateMessage(
        sellerName: string,
        petName: string,
        petBreed: string,
        petCategory: string
    ): string {
        return `Hi ${sellerName},

I found your ${petCategory} "${petName}" (${petBreed}) on PetNest and I'm interested  to know more about "${petName}".

Could you please provide more details about:
- Current availability
- Health and vaccination status
- Price and payment terms
- Viewing arrangements

Thank you!`;
    }

    /**
     * Clean phone number for WhatsApp link
     * Remove spaces, dashes, parentheses, and ensure country code
     */
    private cleanPhoneNumber(phone: string): string {
        // Remove all non-numeric characters except +
        let cleaned = phone.replace(/[^\d+]/g, '');

        // Remove leading zeros
        cleaned = cleaned.replace(/^0+/, '');

        // If no country code, assume India (+91)
        if (!cleaned.startsWith('+')) {
            cleaned = `91${cleaned}`;
        } else {
            // Remove + sign (WhatsApp expects number without +)
            cleaned = cleaned.substring(1);
        }

        return cleaned;
    }
}
