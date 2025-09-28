import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaginationRequestDto } from '../dtos/requests/pagination.request.dto';
import { EntityResponseDto } from '../dtos/responses/entity.response.dto';
import { PaginationResponseDto } from '../dtos/responses/pagination.response.dto';
import { FindWithFiltersCase } from '../use-cases/find-with-filters.use-case';

@ApiTags('Entity')
@Controller('entities')
export class EntityController {

	constructor(private readonly useCase: FindWithFiltersCase){
	}

	@Get('')
	@ApiResponse({ status: 200, type: PaginationResponseDto })
	async listEntities(@Query() pagination: PaginationRequestDto): Promise<PaginationResponseDto> {
		const data = await this.useCase.execute();

		return data;
	}

	@Get(':uuid')
	@ApiParam({ name: 'uuid', type: 'string', example: 'a3f1c2e4-5b6d-7e8f-9a0b-1c2d3e4f5a6b' })
	@ApiResponse({ status: 200, type: EntityResponseDto })
	async getEntityByUuid(@Param('uuid') uuid: string): Promise<EntityResponseDto> {
		// Example stub response
		return {
			id: 1,
			uuid,
			companyName: 'Acme Corp',
			phoneNumber: '+55 11 99999-9999',
			email: 'contact@acme.com',
			address: 'Av. Paulista, 1000, São Paulo, SP',
			logoUrl: 'https://acme.com/logo.png',
			images: ['https://acme.com/image1.png', 'https://acme.com/image2.png'],
			additionalInformation: [
				{ key: 'website', value: 'https://acme.com' },
				{ key: 'founded', value: '1999' },
			],
			category: 'Transport',
		};
	}
}
