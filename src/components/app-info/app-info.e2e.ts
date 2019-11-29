import { newE2EPage } from '@stencil/core/testing';

describe('app-info', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<app-info></app-info>');

    const element = await page.find('app-info');
    expect(element).toHaveClass('hydrated');
  });
});
