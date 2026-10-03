import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BenefactorEdataService } from './benefactor-edata.service.js';
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

  @Get(':uid')
  findOne(@Param('uid', ParseIntPipe) uid: number) {
    return this.benefactorEdataService.findOne(uid);
  }
}
