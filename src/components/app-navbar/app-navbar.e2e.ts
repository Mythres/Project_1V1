import { newE2EPage } from '@stencil/core/testing';

describe('app-header', () => {

  it('renders', async () => {
    const page = await newE2EPage({ url: '/'});
    const element = await page.find('app-header');
    expect(element).toHaveClass('hydrated');
  });
});
