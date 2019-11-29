import { AppConstruction } from './app-construction';

describe('app', () => {
  it('builds', () => {
    expect(new AppConstruction()).toBeTruthy();
  });
});
