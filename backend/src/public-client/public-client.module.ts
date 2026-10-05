import { Module } from '@nestjs/common';
import { PublicClientController } from './public-client.controller.js';
import { PublicClientService } from './public-client.service.js';

@Module({
  controllers: [PublicClientController],
  providers: [PublicClientService],
})
export class PublicClientModule {}
