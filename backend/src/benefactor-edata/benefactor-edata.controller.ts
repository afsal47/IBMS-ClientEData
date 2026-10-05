import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BenefactorEdataService } from './benefactor-edata.service.js';
import { SendFormLinkDto } from './dto/send-form-link.dto.js';
import { UpsertBenefactorEdataDto } from './dto/upsert-benefactor-edata.dto.js';

@Controller('benefactor-edata')
export class BenefactorEdataController {
  constructor(private readonly benefactorEdataService: BenefactorEdataService) {}

  @Get('list')
  list() {
    return this.benefactorEdataService.listSummaries();
  }

  @Post('upsert')
  upsert(@Body() dto: UpsertBenefactorEdataDto) {
    return this.benefactorEdataService.upsert(dto);
  }

  @Post(':uid/send-form-link')
  sendFormLink(
    @Param('uid', ParseIntPipe) uid: number,
    @Body() dto: SendFormLinkDto,
  ) {
    return this.benefactorEdataService.sendFormLink(uid, dto);
  }

  @Get(':uid')
  findOne(@Param('uid', ParseIntPipe) uid: number) {
    return this.benefactorEdataService.findOne(uid);
  }
}
