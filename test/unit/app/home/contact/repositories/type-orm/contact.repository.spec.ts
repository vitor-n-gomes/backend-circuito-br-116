import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRepository } from '@/app/home/contact/repositories/type-orm/contact.repository';
import { Contact } from '@/app/home/contact/repositories/type-orm/models/contact.entity';
import { FilterRequestDto } from '@/app/home/contact/dtos/requests/filter.request.dto';
import { SingleContactFactory } from './mocks/contact.factory';

describe('ContactRepository', () => {
  let repository: ContactRepository;
  let typeOrmRepository: Repository<Contact>;

  const mockContact = SingleContactFactory();

  const mockQueryBuilder = {
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactRepository,
        {
          provide: getRepositoryToken(Contact),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get<ContactRepository>(ContactRepository);
    typeOrmRepository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  describe('findByUuid', () => {
    it('should return a contact by uuid', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockContact as Contact);

      const result = await repository.findByUuid(mockContact.uuid);
      
      expect(result).toEqual(mockContact);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { uuid: mockContact.uuid },
      });
    });

    it('should return null when contact is not found', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findByUuid('non-existent-uuid');
      
      expect(result).toBeNull();
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered contacts with pagination', async () => {
      const filters: FilterRequestDto = {
        query: 'test',
        city: 'New York'
      };
      const page = 2;
      const limit = 10;
      const expectedResult = {
        data: [mockContact],
        total: 1,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockContact], 1]),
      };

      jest.spyOn(typeOrmRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findWithFilters(filters, page, limit);

      expect(result).toEqual(expectedResult);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('MATCH(empresa, cidade, palavras, palavrachave) AGAINST (:query IN BOOLEAN MODE)'),
        expect.any(Object)
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE :city'),
        expect.any(Object)
      );
    });
  });
});
