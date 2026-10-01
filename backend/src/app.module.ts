import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BenefactorEdataModule } from './benefactor-edata/benefactor-edata.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BenefactorEdataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
