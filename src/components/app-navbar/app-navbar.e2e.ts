import { newE2EPage } from '@stencil/core/testing';

describe('app-navbar', () => {

  it('renders', async () => {
    const page = await newE2EPage({ url: '/'});
    await page.setContent('<app-navbar></app-navbar>');

    const element = await page.find('app-navbar');
    expect(element).toHaveClass('hydrated');
  });
});
