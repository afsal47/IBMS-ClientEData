import type { ConfigService } from '@nestjs/config';

/** When false (testing), links can be resent, reused, and resubmitted. */
export function isBenefactorFormLockEnabled(
  config: ConfigService,
): boolean {
  const raw = config.get<string>('BENEFACTOR_FORM_LOCK_ENABLED');
  return raw === 'true' || raw === '1';
}
