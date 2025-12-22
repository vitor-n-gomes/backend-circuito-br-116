import { DataSource } from 'typeorm';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';
import { faker } from '@faker-js/faker/locale/pt_BR';

export class LocationSeed {
  async run(dataSource: DataSource): Promise<void> {
    const locationRepo = dataSource.getRepository(Location);

    // Check if we already have data
    const count = await locationRepo.count();
    if (count > 2) {
      console.log('Location table already has data. Skipping seed.');
      return;
    }

    // Create locations along BR-116 route through Brazil
    // From São Paulo through Paraná to Santa Catarina and Rio Grande do Sul
    const locations: any = [];

    // Add some random additional locations using faker for variety
    for (let i = 0; i < 10; i++) {
      const state = faker.helpers.arrayElement(['SP', 'PR', 'SC', 'RS']);
      const cityName = faker.location.city();
      locations.push({ name: `${cityName} - ${state}`, createdAt: new Date(), updatedAt: new Date() });
    }

    await locationRepo.save(locations);

    console.log(`✅ Seeded ${locations.length} locations successfully!`);
  }
}
