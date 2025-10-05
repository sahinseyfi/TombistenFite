/// <reference types='vitest' />
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import StarterCard from '@/components/StarterCard';
import { t } from '@/lib/i18n';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('StarterCard', () => {
  it('shows guest CTA when user is not authenticated', () => {
    render(<StarterCard authed={false} />);

    expect(screen.getByText(t('home.starter.title'))).toBeInTheDocument();
    const primaryCta = screen
      .getAllByRole('link', { name: t('home.starter.cta.guest') })
      .find((node) => node.classList.contains('btn'));
    expect(primaryCta).toBeDefined();
    expect(primaryCta).toHaveAttribute('href', '/kayit');

    expect(screen.getByRole('link', { name: t('home.quick.profile') })).toHaveAttribute('href', '/profil');
  });

  it('shows feed CTA when user is authenticated', () => {
    render(<StarterCard authed />);

    const primaryCta = screen.getByRole('link', { name: t('home.starter.cta.auth') });
    expect(primaryCta).toHaveAttribute('href', '/akis');
    expect(screen.queryByText(t('home.starter.cta.guest'))).not.toBeInTheDocument();
  });
});
