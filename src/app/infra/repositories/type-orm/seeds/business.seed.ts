import { DataSource } from 'typeorm';
import { Business } from '@/app/infra/repositories/type-orm/models/business.entity';
import { Location } from '@/app/infra/repositories/type-orm/models/location.entity';
import { faker } from '@faker-js/faker/locale/pt_BR';

export class BusinessSeed {
  async run(dataSource: DataSource): Promise<void> {
    const businessRepo = dataSource.getRepository(Business);
    const locationRepo = dataSource.getRepository(Location);

    // Check if we already have data
    const count = await businessRepo.count();
    if (count > 0) {
      console.log('Business table already has data. Skipping seed.');
      return;
    }

    // Get all locations to reference
    const locations = await locationRepo.find();
    if (locations.length === 0) {
      console.error('❌ No locations found. Please run location seed first.');
      return;
    }

    // Helper function to get random location
    const getRandomLocation = () => faker.helpers.arrayElement(locations);
    
    // Helper function to get location by name (fallback to random if not found)
    const getLocationByName = (name: string) => {
      const location = locations.find(l => l.name.includes(name));
      return location || getRandomLocation();
    };

    const now = new Date();
    
    // Helper function to get random category ID between 1 and 10
    const getRandomCategoryId = (): number => {
      return Math.floor(Math.random() * 10) + 1;
    };

    const getRandomUserId = (): number => {
      return Math.floor(Math.random() * 5) + 1;
    };
    
    const businesses: Partial<Business>[] = [
      // Restaurants
      {
        title: 'Restaurante Sabor da Serra',
        description: 'Restaurante tradicional com comida caseira e vista panorâmica da BR-116. Especialidades: feijoada completa, moqueca capixaba e frango caipira.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Registro - SP').aux_id,
        locationPretty: 'Km 235, Registro - SP',
        locationLat: -24.4897,
        locationLong: -47.8439,
        phoneNumber: '(13) 3821-1234',
        whatsapp: '5513998211234',
        email: 'contato@sabordaterra.com.br',
        instagram: '@sabordaterra',
        facebook: 'sabordaterraoficial',
        classification: 'A1',
        isVerified: true,
        views: 1247,
        accountId: getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Churrascaria Boi na Brasa',
        description: 'Churrascaria com rodízio completo. Carnes nobres, buffet variado e espaço kids.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Curitiba - PR').aux_id,
        locationPretty: 'Km 312, Curitiba - PR',
        locationLat: -25.4284,
        locationLong: -49.2733,
        phoneNumber: '(41) 3322-5678',
        whatsapp: '5541999225678',
        email: 'reservas@boinabrasa.com.br',
        instagram: '@boinabrasa',
        classification: 'A1',
        isVerified: true,
        views: 2103,
        accountId: getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Pizzaria Forno a Lenha',
        description: 'Pizzas artesanais com massa fermentada naturalmente. Delivery e salão climatizado.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Florianópolis - SC').aux_id,
        locationPretty: 'Km 428, Florianópolis - SC',
        locationLat: -27.5954,
        locationLong: -48.5480,
        phoneNumber: '(48) 3234-9012',
        whatsapp: '5548998349012',
        instagram: '@fornoalenhasc',
        classification: 'B1',
        isVerified: true,
        views: 892,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },

      // Hotels & Accommodations
      {
        title: 'Hotel Estrada Real',
        description: 'Hotel executivo com 50 apartamentos, wifi gratuito, estacionamento amplo e café da manhã incluso. Ideal para viajantes de negócios.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Cajati - SP').aux_id,
        locationPretty: 'Km 187, Cajati - SP',
        locationLat: -24.7297,
        locationLong: -48.1247,
        phoneNumber: '(13) 3854-2100',
        whatsapp: '5513998542100',
        email: 'reservas@estradareal.com.br',
        instagram: '@hotelestradareal',
        facebook: 'hotelestradarealoficial',
        classification: 'A1',
        isVerified: true,
        views: 3456,
        accountId: getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Pousada Caminho da Serra',
        description: 'Pousada aconchegante com vista para as montanhas. Quartos com varanda, piscina e área verde.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Morretes - PR').aux_id,
        locationPretty: 'Km 268, Morretes - PR',
        locationLat: -25.4744,
        locationLong: -48.8347,
        phoneNumber: '(41) 3462-1567',
        whatsapp: '5541997621567',
        email: 'contato@caminhodaserra.com.br',
        instagram: '@pousadacaminhodaserra',
        classification: 'B1',
        isVerified: true,
        views: 1678,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },

      // Gas Stations
      {
        title: 'Posto BR - Auto Posto Rodoviário',
        description: 'Posto de combustível com conveniência 24h, borracharia, lavagem e restaurante. Aceita todos os cartões.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('São José dos Pinhais - PR').aux_id,
        locationPretty: 'Km 352, São José dos Pinhais - PR',
        locationLat: -25.5304,
        locationLong: -49.2064,
        phoneNumber: '(41) 3381-4500',
        whatsapp: '5541999814500',
        classification: 'A1',
        isVerified: true,
        views: 5234,
        accountId: getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Shell Select',
        description: 'Combustíveis Shell V-Power, loja de conveniência, café, banheiros limpos e área de descanso.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Garuva - SC').aux_id,
        locationPretty: 'Km 405, Garuva - SC',
        locationLat: -26.0272,
        locationLong: -48.8551,
        phoneNumber: '(47) 3444-2800',
        whatsapp: '5547998442800',
        classification: 'A1',
        isVerified: true,
        views: 4123,
        accountId:getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },

      // Mechanics & Auto Services
      {
        title: 'Auto Mecânica Rodoviária',
        description: 'Serviços de mecânica geral, elétrica automotiva, alinhamento e balanceamento. Atendimento de emergência 24h.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Curitiba - PR').aux_id,
        locationPretty: 'Km 289, Curitiba - PR',
        locationLat: -25.4195,
        locationLong: -49.2646,
        phoneNumber: '(41) 3333-7890',
        whatsapp: '5541999337890',
        email: 'contato@mecanicarodov.com.br',
        classification: 'B1',
        isVerified: true,
        views: 2341,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Borracharia Expresso',
        description: 'Borracharia especializada em pneus de caminhão e automóveis. Conserto de câmaras e vendas.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Jacupiranga - SP').aux_id,
        locationPretty: 'Km 198, Jacupiranga - SP',
        locationLat: -24.6942,
        locationLong: -48.0053,
        phoneNumber: '(13) 3864-1122',
        whatsapp: '5513998641122',
        classification: 'B2',
        isVerified: false,
        views: 987,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },

      // Tourism & Attractions
      {
        title: 'Parque Estadual Pico do Marumbi',
        description: 'Parque estadual com trilhas ecológicas, mirantes naturais e rica biodiversidade. Guias disponíveis.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Morretes - PR').aux_id,
        locationPretty: 'Km 274, Morretes - PR',
        locationLat: -25.4333,
        locationLong: -48.9167,
        phoneNumber: '(41) 3455-1234',
        email: 'parquemarumbi@iat.pr.gov.br',
        classification: 'B1',
        isVerified: true,
        views: 4567,
        accountId: getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Museu Ferroviário de Morretes',
        description: 'Museu dedicado à história da ferrovia paranaguá-curitiba. Exposição de locomotivas antigas.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Morretes - PR').aux_id,
        locationPretty: 'Centro, Morretes - PR',
        locationLat: -25.4744,
        locationLong: -48.8347,
        phoneNumber: '(41) 3462-2456',
        classification: 'B2',
        isVerified: true,
        views: 1234,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },

      // Shopping & Services
      {
        title: 'Shopping Rodoviário BR-116',
        description: 'Centro comercial com lojas variadas, praça de alimentação, cinema e estacionamento gratuito.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Curitiba - PR').aux_id,
        locationPretty: 'Km 338, Curitiba - PR',
        locationLat: -25.4808,
        locationLong: -49.3044,
        phoneNumber: '(41) 3340-5000',
        instagram: '@shoppingbr116',
        facebook: 'shoppingbr116oficial',
        classification: 'A1',
        isVerified: true,
        views: 8901,
        accountId: getRandomUserId(),
        promotedAt: now,
        createdAt: now,
        updatedAt: now,
      },

      // Non-promoted businesses for variety
      {
        title: 'Lanchonete e Pastelaria da Estrada',
        description: 'Lanches rápidos, pastéis fritos na hora e sucos naturais. Ambiente simples e familiar.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Pariquera-Açu - SP').aux_id,
        locationPretty: 'Km 221, Pariquera-Açu - SP',
        locationLat: -24.7156,
        locationLong: -47.8806,
        phoneNumber: '(13) 3856-7890',
        classification: 'B2',
        isVerified: false,
        views: 456,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Mercado do Agricultor',
        description: 'Produtos orgânicos direto do produtor. Frutas, verduras, legumes e queijos artesanais.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('Antonina - PR').aux_id,
        locationPretty: 'Km 255, Antonina - PR',
        locationLat: -25.4286,
        locationLong: -48.7119,
        phoneNumber: '(41) 3432-1098',
        classification: 'B2',
        isVerified: false,
        views: 678,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Farmácia 24 Horas Saúde Total',
        description: 'Farmácia com atendimento 24h, delivery, medição de pressão e glicemia gratuita.',
        categoryId: getRandomCategoryId(),
        locationId: getLocationByName('São José dos Pinhais - PR').aux_id,
        locationPretty: 'Km 365, São José dos Pinhais - PR',
        locationLat: -25.5347,
        locationLong: -49.1764,
        phoneNumber: '(41) 3381-9999',
        whatsapp: '5541999819999',
        classification: 'B1',
        isVerified: true,
        views: 3210,
        accountId: getRandomUserId(),
        createdAt: now,
        updatedAt: now,
      },
    ];

    await businessRepo.save(businesses);

    console.log(`✅ Seeded ${businesses.length} businesses successfully!`);
  }
}
