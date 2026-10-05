import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const mailUser = config.get<string>('MAIL_USER') ?? '';
        const mailFrom = config.get<string>('MAIL_FROM');
        const replyTo =
          config.get<string>('MAIL_REPLY_TO') ??
          (mailFrom?.includes('@') ? mailFrom : undefined);

        return {
          transport: {
            host: config.get<string>('MAIL_HOST'),
            port: Number(config.get<string>('MAIL_PORT')) || 587,
            secure: false,
            auth: {
              user: mailUser,
              pass: config.get<string>('MAIL_PASS'),
            },
            tls: {
              minVersion: 'TLSv1.2',
            },
          },
          defaults: {
            // Gmail/Office365 accept mail when the envelope From matches MAIL_USER.
            from: {
              name: 'Ikey Softwares',
              address: mailUser,
            },
            ...(replyTo ? { replyTo } : {}),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}
