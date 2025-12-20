import { IsNotEmpty, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLastSeenBusinessDto {
  @ApiProperty({ description: 'Business UUID' })
  @IsUUID()
  @IsNotEmpty()
  businessId: string;
}
