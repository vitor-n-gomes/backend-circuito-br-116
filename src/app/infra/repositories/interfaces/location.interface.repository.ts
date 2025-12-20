import { LocationResponseDto } from '../../../home/location/dtos/responses/location.response.dto';
import { CreateLocationDto } from '../../../home/location/dtos/requests/create-location.request.dto';

export abstract class ILocationRepository {
  abstract findAll(): Promise<LocationResponseDto[]>;
  
  abstract findById(id: string): Promise<LocationResponseDto | null>;
  
  abstract findByName(name: string): Promise<LocationResponseDto | null>;
  
  abstract create(data: CreateLocationDto): Promise<LocationResponseDto>;
  
  abstract delete(id: string): Promise<void>;
}
