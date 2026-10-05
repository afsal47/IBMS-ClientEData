import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Sixteen editable e-invoicing fields (code, name, address are read-only on GET). */
export class SubmitPublicClientDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  city?: string;

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
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}
