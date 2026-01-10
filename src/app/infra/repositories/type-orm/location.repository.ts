import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './models/location.entity';
import { ILocationRepository } from '../interfaces/location.interface.repository';
import { LocationResponseDto } from '@/app/domain/location/dtos/responses/location.response.dto';
import { CreateLocationDto } from '@/app/domain/location/dtos/requests/create-location.request.dto';
import { UpdateLocationDto } from '@/app/domain/location/dtos/requests/update-location.request.dto';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';

@Injectable()
export class LocationRepository implements ILocationRepository {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>
  ) {}

  async findAll(): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepo.find({
      order: { name: 'ASC' },
    });
    return locations.map((l) => toObjectResponseMapper(l, LocationResponseDto));
  }

  async findById(id: string): Promise<LocationResponseDto | null> {
    const location = await this.locationRepo.findOne({ where: { id } });
    return toObjectResponseMapper(location, LocationResponseDto);
  }

  async findByName(name: string): Promise<LocationResponseDto | null> {
    const location = await this.locationRepo.findOne({ where: { name } });
    return toObjectResponseMapper(location, LocationResponseDto);
  }

  async create(data: CreateLocationDto): Promise<LocationResponseDto> {
    // Check if location already exists
    const existing = await this.findByName(data.name);
    if (existing) {
      return existing;
    }

    const now = new Date();
    const location = this.locationRepo.create({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    const saved = await this.locationRepo.save(location);
    return toObjectResponseMapper(saved, LocationResponseDto);
  }

  async update(id: string, data: UpdateLocationDto): Promise<LocationResponseDto> {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) {
      return null;
    }

    const updated = this.locationRepo.merge(location, {
      ...data,
      updatedAt: new Date(),
    });
    const saved = await this.locationRepo.save(updated);
    return toObjectResponseMapper(saved, LocationResponseDto);
  }

  async delete(id: string): Promise<void> {
    await this.locationRepo.delete({ id });
  }
}
