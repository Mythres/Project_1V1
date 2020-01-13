import {Component, h, Prop} from '@stencil/core';

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.scss',
  shadow: true
})
export class AppProfile {

  @Prop() username: string;
  @Prop() email: string;

  render() {
    return (
      <div />
    );
  }
}
