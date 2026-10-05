import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { BenefactorEdataController } from './benefactor-edata.controller.js';
import { BenefactorEdataService } from './benefactor-edata.service.js';

@Module({
  imports: [MailModule],
  controllers: [BenefactorEdataController],
  providers: [BenefactorEdataService],
})
export class BenefactorEdataModule {}
