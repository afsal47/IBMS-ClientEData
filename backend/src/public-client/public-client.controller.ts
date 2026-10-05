import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmitPublicClientDto } from './dto/submit-public-client.dto.js';
import { PublicClientService } from './public-client.service.js';

@Controller('public/client')
export class PublicClientController {
  constructor(private readonly publicClientService: PublicClientService) {}

  @Get(':token')
  getForm(@Param('token') token: string) {
    return this.publicClientService.getFormByToken(token);
  }

  @Post(':token')
  submitForm(
    @Param('token') token: string,
    @Body() dto: SubmitPublicClientDto,
  ) {
    return this.publicClientService.submitFormByToken(token, dto);
  }
}
