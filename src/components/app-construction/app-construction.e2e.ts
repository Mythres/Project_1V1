import { newE2EPage } from '@stencil/core/testing';

describe('app-construction', () => {

  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<app-construction></app-construction>');

    const element = await page.find('app-construction');
    expect(element).toHaveClass('hydrated');
  });
});
