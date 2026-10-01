import { Module } from '@nestjs/common';
import { BenefactorEdataController } from './benefactor-edata.controller.js';
import { BenefactorEdataService } from './benefactor-edata.service.js';

@Module({
  controllers: [BenefactorEdataController],
  providers: [BenefactorEdataService],
})
export class BenefactorEdataModule {}
