import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BenefactorEdata } from '@prisma/client';
import { isBenefactorFormLockEnabled } from '../config/form-lock.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SubmitPublicClientDto } from './dto/submit-public-client.dto.js';
import type {
  PublicClientAlreadySubmittedResponse,
  PublicClientFormResponse,
} from './public-client.types.js';

@Injectable()
export class PublicClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getFormByToken(
    token: string,
  ): Promise<PublicClientFormResponse | PublicClientAlreadySubmittedResponse> {
    const resolved = await this.resolveTokenRow(token);
    if (
      isBenefactorFormLockEnabled(this.config) &&
      resolved.kind === 'already_submitted'
    ) {
      return {
        alreadySubmitted: true,
        message:
          'Tax details were already submitted using this link. No further action is needed.',
        code: resolved.row.code,
        name: resolved.row.name,
        address: resolved.row.address,
      };
    }
    return this.toFormResponse(resolved.row);
  }

  async submitFormByToken(
    token: string,
    dto: SubmitPublicClientDto,
  ): Promise<{ message: string }> {
    const trimmed = token.trim();
    const resolved = await this.resolveTokenRow(token);
    if (
      isBenefactorFormLockEnabled(this.config) &&
      resolved.kind === 'already_submitted'
    ) {
      throw new BadRequestException(
        'Tax details were already submitted for this organization.',
      );
    }
    const row = resolved.row;

    const lockEnabled = isBenefactorFormLockEnabled(this.config);

    await this.prisma.benefactorEdata.update({
      where: { uid: row.uid },
      data: {
        country: dto.country,
        state: dto.state,
        city: dto.city,
        fax: dto.fax,
        trn: dto.trn,
        website: dto.website,
        legalName: dto.legalName,
        tradingName: dto.tradingName,
        tin: dto.tin,
        tradeLicenseNo: dto.tradeLicenseNo,
        tradeLicenseType: dto.tradeLicenseType,
        tradeLicenseAuthority: dto.tradeLicenseAuthority,
        endpointId: dto.endpointId,
        endpointScheme: dto.endpointScheme,
        postalCode: dto.postalCode,
        ...(lockEnabled
          ? {
              isFormCompleted: true,
              lastSubmittedFormToken: trimmed,
              formToken: null,
              formTokenExpiresAt: null,
            }
          : {}),
      },
    });

    return { message: 'Tax Details added Successfully' };
  }

  private async resolveTokenRow(
    token: string,
  ): Promise<
    | { kind: 'active'; row: BenefactorEdata }
    | { kind: 'already_submitted'; row: BenefactorEdata }
  > {
    const trimmed = token.trim();
    if (!trimmed) {
      throw new BadRequestException('Invalid or expired link.');
    }

    const lockEnabled = isBenefactorFormLockEnabled(this.config);

    const active = await this.prisma.benefactorEdata.findUnique({
      where: { formToken: trimmed },
    });

    if (active) {
      if (lockEnabled) {
        if (active.isFormCompleted) {
          return { kind: 'already_submitted', row: active };
        }
        if (
          !active.formTokenExpiresAt ||
          active.formTokenExpiresAt.getTime() < Date.now()
        ) {
          throw new BadRequestException(
            'This link has expired. Please contact Ikey Softwares for a new invitation.',
          );
        }
      }
      return { kind: 'active', row: active };
    }

    if (lockEnabled) {
      const submitted = await this.prisma.benefactorEdata.findUnique({
        where: { lastSubmittedFormToken: trimmed },
      });

      if (submitted?.isFormCompleted) {
        return { kind: 'already_submitted', row: submitted };
      }

      throw new NotFoundException(
        'This link is invalid or was replaced by a newer invitation email.',
      );
    }

    const legacy = await this.prisma.benefactorEdata.findUnique({
      where: { lastSubmittedFormToken: trimmed },
    });

    if (legacy) {
      return { kind: 'active', row: legacy };
    }

    throw new NotFoundException(
      'This link is invalid or was replaced by a newer invitation email.',
    );
  }

  private toFormResponse(row: BenefactorEdata): PublicClientFormResponse {
    return {
      code: row.code,
      name: row.name,
      address: row.address,
      country: row.country,
      state: row.state,
      city: row.city,
      fax: row.fax,
      trn: row.trn,
      website: row.website,
      legalName: row.legalName,
      tradingName: row.tradingName,
      tin: row.tin,
      tradeLicenseNo: row.tradeLicenseNo,
      tradeLicenseType: row.tradeLicenseType,
      tradeLicenseAuthority: row.tradeLicenseAuthority,
      endpointId: row.endpointId,
      endpointScheme: row.endpointScheme,
      postalCode: row.postalCode,
    };
  }
}
