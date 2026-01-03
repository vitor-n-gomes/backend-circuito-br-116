import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, LessThanOrEqual, MoreThanOrEqual, IsNull, Not } from 'typeorm';
import { Business } from './models/business.entity';
import { IBusinessRepository } from '../interfaces/business.interface.repository';
import { FilterBusinessDto } from '../../../domain/business/dtos/requests/filter-business.request.dto';
import { PaginationResponseDto } from '@/common/utils/dtos/responses/pagination.response.dto';
import { toPaginationResponseMapper } from './mappers/to-pagination-response.mapper';
import { toObjectResponseMapper } from './mappers/to-object-response.mapper';
import { BusinessResponseDto } from '@/app/domain/business/dtos/responses/business.response.dto';
import { CreateBusinessDto } from '@/app/domain/business/dtos/requests/create-business.request.dto';
import { UpdateBusinessDto } from '@/app/domain/business/dtos/requests/update-business.request.dto';

@Injectable()
export class BusinessRepository implements IBusinessRepository {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>
  ) { }

  async findById(id: number): Promise<BusinessResponseDto | null> {
    const business = await this.businessRepo.findOne({ where: { auxId: id } });
    return toObjectResponseMapper(business, BusinessResponseDto);
  }

  async findByUuid(uuid: string): Promise<BusinessResponseDto | null> {
    const business = await this.businessRepo.findOne({ where: { id: uuid } });
    return toObjectResponseMapper(business, BusinessResponseDto);
  }

  async findWithFilters(
    filters: FilterBusinessDto,
    page: number,
    limit: number,
    orderBy: string = 'createdAt',
    orderDirection: 'ASC' | 'DESC' = 'DESC'
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    const queryBuilder = this.businessRepo.createQueryBuilder('b');

    // Apply text search filter
    if (filters.query) {
      queryBuilder.andWhere(
        '(b.title ILIKE :query OR b.description ILIKE :query)',
        { query: `%${filters.query}%` }
      );
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      queryBuilder.andWhere('b.category_id IN (:...categories)', {
        categories: filters.categories,
      });
    }

    // Apply location filter
    if (filters.locationIds && filters.locationIds.length > 0) {
      queryBuilder.andWhere('b.locationId IN (:...locationIds)', {
        locationIds: filters.locationIds,
      });
    }

    // Apply classifications filter
    if (filters.classifications && filters.classifications.length > 0) {
      queryBuilder.andWhere('b.classification IN (:...classifications)', {
        classifications: filters.classifications,
      });
    }

    // Apply promoted filter
    if (filters.promotedOnly) {
      queryBuilder.andWhere('b.promotedAt IS NOT NULL');
    }

    // Apply verified filter
    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('b.isVerified = :isVerified', {
        isVerified: filters.isVerified,
      });
    }

    // Apply view count filters
    if (filters.minViews !== undefined) {
      queryBuilder.andWhere('b.views >= :minViews', { minViews: filters.minViews });
    }
    if (filters.maxViews !== undefined) {
      queryBuilder.andWhere('b.views <= :maxViews', { maxViews: filters.maxViews });
    }

    // Apply account filter
    if (filters.accountId !== undefined) {
      queryBuilder.andWhere('b.accountId = :accountId', {
        accountId: filters.accountId,
      });
    }

    // Handle promoted businesses sorting
    if (orderBy === 'createdAt' && orderDirection === 'DESC') {
      queryBuilder.addOrderBy(
        'CASE WHEN b.promotedAt IS NOT NULL THEN 1 ELSE 0 END',
        'DESC'
      );
      queryBuilder.addOrderBy('b.promotedAt', 'DESC', 'NULLS LAST');
    }

    queryBuilder.orderBy(`b.${orderBy}`, orderDirection);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return toPaginationResponseMapper(data, total, page, limit, BusinessResponseDto);
  }

  async create(accountId: number, data: CreateBusinessDto): Promise<BusinessResponseDto> {
    const now = new Date();
    const business = this.businessRepo.create({
      ...data,
      accountId,
      views: 0,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.businessRepo.save(business);
    return toObjectResponseMapper(saved, BusinessResponseDto);
  }

  async update(id: number, data: UpdateBusinessDto): Promise<BusinessResponseDto> {
    await this.businessRepo.update({ auxId: id }, data);
    const updated = await this.businessRepo.findOne({ where: { auxId: id } });
    return toObjectResponseMapper(updated, BusinessResponseDto);
  }

  async delete(id: number): Promise<void> {
    await this.businessRepo.delete({ auxId: id });
  }

  async search(
    query: string,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    const queryBuilder = this.businessRepo.createQueryBuilder('b');

    queryBuilder.where('b.title ILIKE :query OR b.description ILIKE :query', {
      query: `%${query}%`,
    });

    queryBuilder.orderBy('b.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return toPaginationResponseMapper(data, total, page, limit, BusinessResponseDto);
  }

  async getLatest(limit: number = 12): Promise<BusinessResponseDto[]> {
    // Check if there are enough promoted businesses
    const promotedCount = await this.businessRepo.count({
      where: { promotedAt: Not(IsNull()) },
    });

    let businesses: Business[];

    if (promotedCount >= limit) {
      // Return only promoted businesses in random order
      businesses = await this.businessRepo
        .createQueryBuilder('b')
        .where('b.promotedAt IS NOT NULL')
        .orderBy('RANDOM()')
        .limit(limit)
        .getMany();
    } else {
      // Return mixed results with promoted first
      businesses = await this.businessRepo
        .createQueryBuilder('b')
        .addOrderBy('CASE WHEN b.promotedAt IS NOT NULL THEN 1 ELSE 0 END', 'DESC')
        .addOrderBy('b.promotedAt', 'DESC', 'NULLS LAST')
        .addOrderBy('b.createdAt', 'DESC')
        .limit(limit)
        .getMany();
    }

    return businesses.map((b) => toObjectResponseMapper(b, BusinessResponseDto));
  }

  async findByLocationProximity(
    lat: number,
    lng: number,
    categoryId: number,
    maxDistanceInKM: number = 5
  ): Promise<BusinessResponseDto[]> {
    const query = `
      SELECT * FROM (
        SELECT *,
          (
            6371 * acos(
              cos(radians($1)) * cos(radians("locationLat")) 
              * cos(radians("locationLong") - radians($2)) 
              + sin(radians($1)) * sin(radians("locationLat"))
            )
          ) AS distance
        FROM businesses
        WHERE ${categoryId !== -1 ? 'category_id = $4' : '1=1'}
      ) AS distances
      WHERE distance <= $3
      ORDER BY distance
    `;

    const params =
      categoryId !== -1
        ? [lat, lng, maxDistanceInKM, categoryId]
        : [lat, lng, maxDistanceInKM];

    const businesses = await this.businessRepo.query(query, params);

    return businesses.map((b) => {

      b.categoryId = b.category_id;
      b.auxId = b.aux_id;

      delete b.category_id;
      delete b.aux_id

      return toObjectResponseMapper(b, BusinessResponseDto)
    }
    );
  }

  async findByAccountId(
    accountId: number,
    page: number,
    limit: number
  ): Promise<PaginationResponseDto<BusinessResponseDto[]>> {
    const queryBuilder = this.businessRepo.createQueryBuilder('b');

    queryBuilder.where('b.accountId = :accountId', { accountId });

    queryBuilder
      .addOrderBy('CASE WHEN b.promotedAt IS NOT NULL THEN 1 ELSE 0 END', 'DESC')
      .addOrderBy('b.promotedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('b.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return toPaginationResponseMapper(data, total, page, limit, BusinessResponseDto);
  }

  async incrementViews(id: number): Promise<void> {
    await this.businessRepo.increment({ auxId: id }, 'views', 1);
  }

  async promote(id: number): Promise<void> {
    await this.businessRepo.update({ auxId: id }, { promotedAt: new Date() });
  }

  async countByAccountId(accountId: number): Promise<number> {
    return await this.businessRepo.count({ where: { accountId } });
  }

  async findBusinessesWithValidPhoto(): Promise<Business[]> {
    const businesses = await this.businessRepo
      .createQueryBuilder('business')
      .where('business."oldFields" ? \'originalPhoto\'')
      .andWhere('business."oldFields"->>\'originalPhoto\' IS NOT NULL')
      .andWhere('business."oldFields"->>\'originalPhoto\' != \'\'')
      .andWhere('TRIM(business."oldFields"->>\'originalPhoto\') != \'\'')
      .andWhere('business."oldFields"->>\'originalPhoto\' NOT ILIKE \'%null%\'')
      .andWhere('business."oldFields"->>\'originalPhoto\' NOT ILIKE \'%undefined%\'')
      .andWhere('business."oldFields"->>\'originalPhoto\' NOT ILIKE \'%n/a%\'')
      .getMany();

    return businesses.map(business => toObjectResponseMapper(business, Business));
  }
}
