import { newE2EPage } from '@stencil/core/testing';

describe('app-register', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<app-register></app-register>');

    const element = await page.find('app-register');
    expect(element).toHaveClass('hydrated');
  });
});
