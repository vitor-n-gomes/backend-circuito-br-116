import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '@/app/infra/repositories/interfaces/account.interface.repository';
import { UpdateAccountDto } from '../dtos/requests/update-account.dto';
import { AccountResponseDto } from '../dtos/responses/account.response.dto';

@Injectable()
export class UpdateAccountCase {
  constructor(
    @Inject(IAccountRepository)
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(accountId: string, updateData: UpdateAccountDto): Promise<AccountResponseDto> {
    return this.accountRepository.update(accountId, updateData);
  }
}
