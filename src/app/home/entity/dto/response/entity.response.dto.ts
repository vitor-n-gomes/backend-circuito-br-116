import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EntityResponseDto {
	@ApiProperty({ example: 1 })
	id: number;

	@ApiProperty({ example: 'a3f1c2e4-5b6d-7e8f-9a0b-1c2d3e4f5a6b' })
	uuid: string;

	@ApiProperty({ example: 'Acme Corp' })
	companyName: string;

	@ApiPropertyOptional({ example: '+55 11 99999-9999' })
	phoneNumber?: string;

	@ApiPropertyOptional({ example: 'contact@acme.com' })
	email?: string;

	@ApiPropertyOptional({ example: 'Av. Paulista, 1000, São Paulo, SP' })
	address?: string;

	@ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
	logoUrl?: string;

	@ApiPropertyOptional({ example: ['https://acme.com/image1.png', 'https://acme.com/image2.png'] })
	images?: string[];

	@ApiPropertyOptional({ example: [{ key: 'website', value: 'https://acme.com' }, { key: 'founded', value: '1999' }] })
	additionalInformation?: { key: string; value: string }[];

	@ApiPropertyOptional({ example: 'Transport' })
	category?: string;
}
