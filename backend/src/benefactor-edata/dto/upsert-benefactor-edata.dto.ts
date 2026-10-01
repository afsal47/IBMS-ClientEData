import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertBenefactorEdataDto {
  /** Omit on insert (identity). Required on update to match existing row. */
  @IsOptional()
  @IsInt()
  @Min(1)
  uid?: number;

  @IsString()
  @MaxLength(20)
  code!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsInt()
  city?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsInt()
  company?: number;

  @IsOptional()
  @IsInt()
  fYear?: number;

  @IsBoolean()
  deleted!: boolean;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsUUID()
  scanId?: string;

  @IsOptional()
  @IsISO8601()
  insertedOn?: string;

  @IsOptional()
  @IsInt()
  insertedBy?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  host?: string;

  /** Base64-encoded row version (maps to varbinary). */
  @IsOptional()
  @IsString()
  versionBase64?: string;

  @IsOptional()
  @IsInt()
  benefactorType?: number;

  @IsOptional()
  @IsInt()
  country?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fax?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  trn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tradingName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tradeLicenseNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tradeLicenseType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tradeLicenseAuthority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  endpointId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  endpointScheme?: string;

  @IsOptional()
  @IsInt()
  state?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}
