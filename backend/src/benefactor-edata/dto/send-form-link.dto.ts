import { IsEmail, IsOptional } from 'class-validator';

export class SendFormLinkDto {
  /** Benefactor inbox; must match saved record or be saved before send. */
  @IsOptional()
  @IsEmail()
  email?: string;
}
