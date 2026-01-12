import express from 'express';
import { generateWhatsAppLink, trackWhatsAppClick } from '@modules/whatsapp';

export const whatsappRouter = express.Router();

// ============= PUBLIC ROUTES (No Auth Required) =============

/**
 * Generate WhatsApp link with prefilled message
 * GET /v1/api/whatsapp/generate?sellerId=xxx&petId=xxx
 * 
 * Returns a WhatsApp deep link WITHOUT exposing phone number
 * Frontend receives: { success: true, data: { whatsappLink: "https://wa.me/...", trackingId: "..." } }
 */
whatsappRouter.get('/generate', generateWhatsAppLink);

/**
 * Track WhatsApp click for analytics
 * POST /v1/api/whatsapp/track
 * Body: { sellerId: string, petId: string, buyerId?: string }
 * 
 * Increments click counts for both seller and pet
 */
whatsappRouter.post('/track', trackWhatsAppClick);
