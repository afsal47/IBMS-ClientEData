import { Body, Controller, Post } from '@nestjs/common';
import { BenefactorEdataService } from './benefactor-edata.service.js';
import { UpsertBenefactorEdataDto } from './dto/upsert-benefactor-edata.dto.js';

@Controller('benefactor-edata')
export class BenefactorEdataController {
  constructor(private readonly benefactorEdataService: BenefactorEdataService) {}

  @Post('upsert')
  upsert(@Body() dto: UpsertBenefactorEdataDto) {
    return this.benefactorEdataService.upsert(dto);
  }
}
