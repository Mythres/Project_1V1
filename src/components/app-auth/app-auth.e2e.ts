import { newE2EPage } from '@stencil/core/testing';

describe('app-auth', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<app-auth></app-auth>');

    const element = await page.find('app-auth');
    expect(element).toHaveClass('hydrated');
  });
});
