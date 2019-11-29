import { newE2EPage } from '@stencil/core/testing';

describe('app-news', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<app-news></app-news>');

    const element = await page.find('app-news');
    expect(element).toHaveClass('hydrated');
  });
});
