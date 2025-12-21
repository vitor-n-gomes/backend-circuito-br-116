import { DataSource } from 'typeorm';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';
import { faker } from '@faker-js/faker/locale/pt_BR';

export class LocationSeed {
  async run(dataSource: DataSource): Promise<void> {
    const locationRepo = dataSource.getRepository(Location);

    // Check if we already have data
    const count = await locationRepo.count();
    if (count > 0) {
      console.log('Location table already has data. Skipping seed.');
      return;
    }

    // Create locations along BR-116 route through Brazil
    // From São Paulo through Paraná to Santa Catarina and Rio Grande do Sul
    const locations = [
      // São Paulo locations
      { name: 'Registro - SP' },
      { name: 'Cajati - SP' },
      { name: 'Jacupiranga - SP' },
      { name: 'Pariquera-Açu - SP' },
      { name: 'Miracatu - SP' },
      
      // Paraná locations
      { name: 'Curitiba - PR' },
      { name: 'São José dos Pinhais - PR' },
      { name: 'Morretes - PR' },
      { name: 'Antonina - PR' },
      { name: 'Guaratuba - PR' },
      { name: 'Araucária - PR' },
      { name: 'Fazenda Rio Grande - PR' },
      { name: 'Mandirituba - PR' },
      { name: 'Quitandinha - PR' },
      { name: 'Rio Negro - PR' },
      
      // Santa Catarina locations
      { name: 'Garuva - SC' },
      { name: 'Joinville - SC' },
      { name: 'Araquari - SC' },
      { name: 'São Francisco do Sul - SC' },
      { name: 'Florianópolis - SC' },
      { name: 'Palhoça - SC' },
      { name: 'São José - SC' },
      { name: 'Biguaçu - SC' },
      { name: 'Tijucas - SC' },
      { name: 'Camboriú - SC' },
      
      // Rio Grande do Sul locations
      { name: 'Osório - RS' },
      { name: 'Terra de Areia - RS' },
      { name: 'Maquiné - RS' },
      { name: 'Três Forquilhas - RS' },
      { name: 'Porto Alegre - RS' },
      { name: 'Viamão - RS' },
      { name: 'Eldorado do Sul - RS' },
      { name: 'Guaíba - RS' },
      { name: 'Camaquã - RS' },
      { name: 'Pelotas - RS' },
      { name: 'Rio Grande - RS' },
      
      // Additional cities for variety
      { name: 'São Bento do Sul - SC' },
      { name: 'Campo Alegre - SC' },
      { name: 'Canoas - RS' },
      { name: 'Novo Hamburgo - RS' },
      { name: 'São Leopoldo - RS' },
      { name: 'Gravataí - RS' },
      { name: 'Cachoeirinha - RS' },
      { name: 'Esteio - RS' },
      { name: 'Sapucaia do Sul - RS' },
    ];

    // Add some random additional locations using faker for variety
    for (let i = 0; i < 10; i++) {
      const state = faker.helpers.arrayElement(['SP', 'PR', 'SC', 'RS']);
      const cityName = faker.location.city();
      locations.push({ name: `${cityName} - ${state}` });
    }

    await locationRepo.save(locations);

    console.log(`✅ Seeded ${locations.length} locations successfully!`);
  }
}
