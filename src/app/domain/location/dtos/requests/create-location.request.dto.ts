import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'Location name', example: 'São Paulo, SP' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
