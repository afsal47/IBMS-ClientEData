import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BenefactorEdata } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertBenefactorEdataDto } from './dto/upsert-benefactor-edata.dto.js';

@Injectable()
export class BenefactorEdataService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertBenefactorEdataDto): Promise<BenefactorEdata> {
    const data = this.toWriteData(dto);

    if (dto.uid != null && dto.uid > 0) {
      const existing = await this.prisma.benefactorEdata.findUnique({
        where: { uid: dto.uid },
      });

      if (existing) {
        return this.prisma.benefactorEdata.update({
          where: { uid: dto.uid },
          data,
        });
      }

      throw new NotFoundException(
        `BenefactorEdata with UID ${dto.uid} was not found`,
      );
    }

    return this.prisma.benefactorEdata.create({ data });
  }

  private toWriteData(
    dto: UpsertBenefactorEdataDto,
  ): Prisma.BenefactorEdataUncheckedCreateInput {
    return {
      code: dto.code,
      name: dto.name,
      address: dto.address,
      city: dto.city,
      contactPerson: dto.contactPerson,
      phone: dto.phone,
      email: dto.email,
      company: dto.company,
      fYear: dto.fYear,
      deleted: dto.deleted,
      userId: dto.userId,
      scanId: dto.scanId,
      insertedOn: dto.insertedOn ? new Date(dto.insertedOn) : undefined,
      insertedBy: dto.insertedBy,
      host: dto.host,
      version: dto.versionBase64
        ? Buffer.from(dto.versionBase64, 'base64')
        : undefined,
      benefactorType: dto.benefactorType,
      country: dto.country,
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
      state: dto.state,
      postalCode: dto.postalCode,
    };
  }
}
