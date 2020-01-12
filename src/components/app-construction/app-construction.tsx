import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-construction',
  styleUrl: 'app-construction.scss',
  shadow: true
})
export class AppConstruction {
  render() {
    return (
      <div class='app-construction'>
        <h1>UNDER CONSTRUCTION</h1>
      </div>
    );
  }
}
