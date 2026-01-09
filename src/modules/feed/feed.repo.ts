import Pet from '@database/models/pet.model';
import { FeedQuery } from './feed.types';

export class FeedRepository {
    async getPets(query: FeedQuery) {
        const { page = 1, limit = 10, species, breed } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (species) filter.species = species;
        if (breed) filter.breedId = breed;

        const [data, total] = await Promise.all([
            Pet.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('breedId', 'name')
                .populate('sellerId', 'businessName')
                .lean(),
            Pet.countDocuments(filter)
        ]);

        return { data, total };
    }
}
