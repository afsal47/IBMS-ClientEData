import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, BenefactorEdata } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { isBenefactorFormLockEnabled } from '../config/form-lock.js';
import { SendFormLinkDto } from './dto/send-form-link.dto.js';
import { UpsertBenefactorEdataDto } from './dto/upsert-benefactor-edata.dto.js';

const FORM_TOKEN_VALID_DAYS = 7;

export type BenefactorEdataResponse = Omit<BenefactorEdata, 'version'> & {
  versionBase64?: string;
};

@Injectable()
export class BenefactorEdataService {
  private readonly logger = new Logger(BenefactorEdataService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async listSummaries(): Promise<
    Pick<BenefactorEdata, 'uid' | 'code' | 'name'>[]
  > {
    return this.prisma.benefactorEdata.findMany({
      select: { uid: true, code: true, name: true },
      orderBy: [{ code: 'asc' }, { uid: 'asc' }],
    });
  }

  async findOne(uid: number): Promise<BenefactorEdataResponse> {
    const row = await this.prisma.benefactorEdata.findUnique({
      where: { uid },
    });

    if (!row) {
      throw new NotFoundException(
        `BenefactorEdata with UID ${uid} was not found`,
      );
    }

    return this.toResponse(row);
  }

  async generateFormToken(uid: number): Promise<string> {
    const row = await this.prisma.benefactorEdata.findUnique({
      where: { uid },
    });

    if (!row) {
      throw new NotFoundException(
        `BenefactorEdata with UID ${uid} was not found`,
      );
    }

    if (
      isBenefactorFormLockEnabled(this.config) &&
      row.isFormCompleted
    ) {
      throw new BadRequestException(
        'Tax details were already submitted. A new link cannot be generated.',
      );
    }

    const token = randomUUID();
    const formTokenExpiresAt = new Date();
    formTokenExpiresAt.setDate(
      formTokenExpiresAt.getDate() + FORM_TOKEN_VALID_DAYS,
    );

    await this.prisma.benefactorEdata.update({
      where: { uid },
      data: {
        formToken: token,
        formTokenExpiresAt,
      },
    });

    return token;
  }

  async sendFormLink(
    uid: number,
    dto: SendFormLinkDto = {},
  ): Promise<{ message: string; email: string }> {
    const row = await this.prisma.benefactorEdata.findUnique({
      where: { uid },
    });

    if (!row) {
      throw new NotFoundException(
        `BenefactorEdata with UID ${uid} was not found`,
      );
    }

    if (
      isBenefactorFormLockEnabled(this.config) &&
      row.isFormCompleted
    ) {
      throw new BadRequestException(
        'Tax details were already submitted. A new link cannot be sent.',
      );
    }

    const requestedEmail = dto.email?.trim();
    const savedEmail = row.email?.trim();
    const email = requestedEmail || savedEmail;

    if (!email) {
      throw new BadRequestException(
        'This record has no email address. Add an email before sending the form link.',
      );
    }

    if (requestedEmail && savedEmail && requestedEmail !== savedEmail) {
      throw new BadRequestException(
        'Email on the form differs from the saved record. Click Submit to save the email first, then send the link.',
      );
    }

    const lockEnabled = isBenefactorFormLockEnabled(this.config);
    const formTokenExpiresAt = new Date();
    formTokenExpiresAt.setDate(
      formTokenExpiresAt.getDate() + FORM_TOKEN_VALID_DAYS,
    );
    const token =
      !lockEnabled && row.formToken?.trim()
        ? row.formToken.trim()
        : randomUUID();

    const baseUrl =
      this.config.get<string>('PUBLIC_APP_BASE_URL')?.replace(/\/$/, '') ??
      'http://localhost:5173';
    const link = `${baseUrl}/update-details/${token}`;

    try {
      const result = await this.mailer.sendMail({
        to: email,
        subject: 'Update your tax & e-invoicing details — Ikey Softwares',
        html: `
        <p>Dear ${escapeHtml(row.name)},</p>
        <p>Please use the secure link below to submit your tax and e-invoicing details for code <strong>${escapeHtml(row.code)}</strong>.</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link is valid for ${FORM_TOKEN_VALID_DAYS} days${isBenefactorFormLockEnabled(this.config) ? ' and can be used once' : ''}.</p>
        <p>Regards,<br/>Ikey Softwares</p>
      `,
        text: `Dear ${row.name},\n\nPlease open this link to submit your tax and e-invoicing details (code ${row.code}):\n${link}\n\nThis link is valid for ${FORM_TOKEN_VALID_DAYS} days${isBenefactorFormLockEnabled(this.config) ? ' and can be used once' : ''}.\n\nRegards,\nIkey Softwares`,
      });

      await this.prisma.benefactorEdata.update({
        where: { uid },
        data: {
          formToken: token,
          formTokenExpiresAt,
          ...(lockEnabled
            ? {}
            : { isFormCompleted: false, lastSubmittedFormToken: null }),
        },
      });

      this.logger.log(
        `Form link email sent to ${email} (uid=${uid}, messageId=${result.messageId ?? 'n/a'})`,
      );
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'Unknown mail transport error';
      this.logger.error(
        `Failed to send form link email to ${email} (uid=${uid}): ${detail}`,
      );
      throw new InternalServerErrorException(
        `Email could not be sent. Check MAIL_* settings in backend .env. Details: ${detail}`,
      );
    }

    return {
      message: `Email sent successfully to ${email}. Please check that inbox (and spam folder) to confirm delivery.`,
      email,
    };
  }

  async upsert(dto: UpsertBenefactorEdataDto): Promise<BenefactorEdataResponse> {
    const data = this.toWriteData(dto);

    if (dto.uid != null && dto.uid > 0) {
      const existing = await this.prisma.benefactorEdata.findUnique({
        where: { uid: dto.uid },
      });

      if (existing) {
        const updated = await this.prisma.benefactorEdata.update({
          where: { uid: dto.uid },
          data,
        });
        return this.toResponse(updated);
      }

      throw new NotFoundException(
        `BenefactorEdata with UID ${dto.uid} was not found`,
      );
    }

    const created = await this.prisma.benefactorEdata.create({ data });
    return this.toResponse(created);
  }

  private toResponse(row: BenefactorEdata): BenefactorEdataResponse {
    const { version, ...rest } = row;
    return {
      ...rest,
      versionBase64: version?.length
        ? Buffer.from(version).toString('base64')
        : undefined,
    };
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
