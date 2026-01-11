import Pet from '@database/models/pet.model';

export class FeedRepository {
    async getPets(): Promise<any[]> {
        return await Pet.find({})
            .sort({ createdAt: -1 })
            .populate('breedId', 'name')
            .populate('sellerId', 'businessName')
            .lean();
    }
}
