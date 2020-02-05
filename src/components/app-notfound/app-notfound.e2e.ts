import { newE2EPage } from '@stencil/core/testing';

describe('app-notfound', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<app-notfound></app-notfound>');

    const element = await page.find('app-notfound');
    expect(element).toHaveClass('hydrated');
  });
});
