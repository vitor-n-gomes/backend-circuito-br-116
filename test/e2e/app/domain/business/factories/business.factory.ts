import { DataSource } from 'typeorm';
import { Business } from '@/app/infra/repositories/type-orm/models/business.entity';
import { FactoryBuilder } from '../../factories/builder.factory';

export class BusinessFactory implements FactoryBuilder {

  businesses: Partial<Business>[]
  
  constructor(businesses: Partial<Business>[]){
    this.businesses = businesses;
  }

  async run(dataSource: DataSource): Promise<any> {
    const businessRepo = dataSource.getRepository(Business);

    const listOfBusinesses = await businessRepo.save(this.businesses);
    
    console.log(`✅ Factory ${listOfBusinesses.length} businesses successfully!`);
    
    return listOfBusinesses;

  
  }
}
