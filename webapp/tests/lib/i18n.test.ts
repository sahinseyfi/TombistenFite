/// <reference types='vitest' />
import { t } from '@/lib/i18n';

describe('i18n helper', () => {
  it('returns the translation for existing keys', () => {
    expect(t('home.hero.title')).toBe('Mobil topluluğa açılan kapı');
  });

  it('falls back to key when translation missing', () => {
    expect(t('missing.key.example')).toBe('missing.key.example');
  });
});
