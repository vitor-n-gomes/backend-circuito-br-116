import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty({ description: 'Account UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Account name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Account email (masked)', example: '*******' })
  email: string;

  @ApiProperty({ description: 'Account raw email (unmasked)', example: 'john@example.com', required: false })
  rawEmail?: string;

  @ApiProperty({ description: 'Firebase Auth ID', example: 'firebase-auth-id-123' })
  authId: string;

  @ApiProperty({ description: 'Phone number', example: '+5511999999999', required: false })
  phone?: string;

  @ApiProperty({ description: 'Profile picture URL', example: 'https://example.com/picture.png' })
  picture: string;

  @ApiProperty({ description: 'Is anonymous account', example: false })
  isAnonymous: boolean;

  @ApiProperty({ description: 'Accepted terms and conditions', example: true })
  acceptedTermsAndCondition: boolean;

  @ApiProperty({ description: 'Device FCM token for push notifications', required: false })
  deviceFCMToken?: string;

  @ApiProperty({ description: 'Identity providers', example: { google: ['google.com'] } })
  identities: Record<string, string[]>;

  @ApiProperty({ description: 'Allowed notification types', example: { NEW_BID_ON_AUCTION: true } })
  allowedNotifications: Record<string, boolean>;

  @ApiProperty({ description: 'Account metadata', example: {} })
  meta: Record<string, unknown>;

  @ApiProperty({ description: 'Profile asset ID', required: false })
  assetId?: string;

  @ApiProperty({ description: 'Account coins balance', example: 0 })
  coins: number;

  @ApiProperty({ description: 'Account verification status', example: false })
  verified: boolean;

  @ApiProperty({ description: 'Verification date', required: false })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Verification request date', required: false })
  verificationRequestedAt?: Date;

  @ApiProperty({ description: 'Location description', example: 'São Paulo, SP', required: false })
  locationPretty?: string;

  @ApiProperty({ description: 'Location latitude', example: -23.5505, required: false })
  locationLat?: number;

  @ApiProperty({ description: 'Location longitude (JSON)', example: -46.6333, required: false })
  locationLong?: any;

  @ApiProperty({ description: 'Preferred category IDs', example: [], type: [String] })
  preferredCategoriesIds: string[];

  @ApiProperty({ description: 'Categories setup completed', example: false })
  categoriesSetupDone: boolean;

  @ApiProperty({ description: 'Blocked account IDs', example: [], type: [String], required: false })
  blockedAccounts?: string[];

  @ApiProperty({ description: 'Intro completed flag', example: false })
  introDone: boolean;

  @ApiProperty({ description: 'Intro skipped flag', example: false })
  introSkipped: boolean;

  @ApiProperty({ description: 'Selected currency ID', required: false })
  selectedCurrencyId?: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Account last update date' })
  updatedAt: Date;
}
