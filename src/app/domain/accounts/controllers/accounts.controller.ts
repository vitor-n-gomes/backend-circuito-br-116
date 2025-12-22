import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAuthenticatedAccountCase } from '../use-cases/get-authenticated-account.case';
import { SearchAccountsCase } from '../use-cases/search-accounts.case';
import { GetAccountStatsCase } from '../use-cases/get-account-stats.case';
import { GetAccountDetailsCase } from '../use-cases/get-account-details.case';
import { BlockAccountCase } from '../use-cases/block-account.case';
import { UnblockAccountCase } from '../use-cases/unblock-account.case';
import { RequestVerificationCase } from '../use-cases/request-verification.case';
import { DeleteAccountDataCase } from '../use-cases/delete-account-data.case';
import { UpdateAccountCase } from '../use-cases/update-account.case';
import { AccountResponseDto } from '../dtos/responses/account.response.dto';
import { SearchAccountDto } from '../dtos/requests/search-account.dto';
import { UpdateAccountDto } from '../dtos/requests/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly getAuthenticatedAccountCase: GetAuthenticatedAccountCase,
    private readonly searchAccountsCase: SearchAccountsCase,
    private readonly getAccountStatsCase: GetAccountStatsCase,
    private readonly getAccountDetailsCase: GetAccountDetailsCase,
    private readonly blockAccountCase: BlockAccountCase,
    private readonly unblockAccountCase: UnblockAccountCase,
    private readonly requestVerificationCase: RequestVerificationCase,
    private readonly deleteAccountDataCase: DeleteAccountDataCase,
    private readonly updateAccountCase: UpdateAccountCase
  ) {}

  @Get('authenticated')
  @ApiOperation({ summary: 'Get authenticated account details' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully', type: AccountResponseDto })
  async getAuthenticated(
    // Note: In production, you'd get accountId from authentication middleware/guard
    // For now, this is a placeholder
  ): Promise<AccountResponseDto> {
    try {
      // TODO: Get account ID from authenticated user context
      const accountId = 'placeholder-id';
      return await this.getAuthenticatedAccountCase.execute(accountId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('search')
  @HttpCode(200)
  @ApiOperation({ summary: 'Search accounts by keyword' })
  @ApiResponse({ status: 200, description: 'Accounts found', type: [AccountResponseDto] })
  async search(@Body() searchDto: SearchAccountDto): Promise<AccountResponseDto[]> {
    try {
      return await this.searchAccountsCase.execute(
        searchDto.keyword,
        searchDto.page || 1,
        searchDto.perPage || 5
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get account statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(): Promise<any> {
    try {
      // TODO: Get account ID from authenticated user context
      const accountId = 'placeholder-id';
      return await this.getAccountStatsCase.execute(accountId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get account details by ID' })
  @ApiResponse({ status: 200, description: 'Account details retrieved', type: AccountResponseDto })
  async getDetails(@Param('accountId') accountId: string): Promise<AccountResponseDto> {
    try {
      const account = await this.getAccountDetailsCase.execute(accountId);
      if (!account) {
        throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
      }
      return account;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('block/:accountId')
  @ApiOperation({ summary: 'Block an account' })
  @ApiResponse({ status: 200, description: 'Account blocked successfully' })
  async blockAccount(@Param('accountId') accountId: string): Promise<{ success: boolean }> {
    try {
      // TODO: Get current account ID from authenticated user context
      const currentAccountId = 'placeholder-id';
      return await this.blockAccountCase.execute(currentAccountId, accountId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('unblock/:accountId')
  @ApiOperation({ summary: 'Unblock an account' })
  @ApiResponse({ status: 200, description: 'Account unblocked successfully' })
  async unblockAccount(@Param('accountId') accountId: string): Promise<{ success: boolean }> {
    try {
      // TODO: Get current account ID from authenticated user context
      const currentAccountId = 'placeholder-id';
      return await this.unblockAccountCase.execute(currentAccountId, accountId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('request-verification')
  @ApiOperation({ summary: 'Request account verification' })
  @ApiResponse({ status: 200, description: 'Verification requested successfully' })
  async requestVerification(): Promise<{ success: boolean }> {
    try {
      // TODO: Get account ID from authenticated user context
      const accountId = 'placeholder-id';
      return await this.requestVerificationCase.execute(accountId);
    } catch (error) {
      if (error.message === 'Already requested verification') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('data')
  @ApiOperation({ summary: 'Delete account data' })
  @ApiResponse({ status: 200, description: 'Account data deleted successfully' })
  async deleteAccountData(): Promise<{ success: boolean }> {
    try {
      // TODO: Get account ID from authenticated user context
      const accountId = 'placeholder-id';
      return await this.deleteAccountDataCase.execute(accountId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('update')
  @ApiOperation({ summary: 'Update account information' })
  @ApiResponse({ status: 200, description: 'Account updated successfully', type: AccountResponseDto })
  async update(@Body() updateDto: UpdateAccountDto): Promise<AccountResponseDto> {
    try {
      // TODO: Get account ID from authenticated user context
      const accountId = 'placeholder-id';
      return await this.updateAccountCase.execute(accountId, updateDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
