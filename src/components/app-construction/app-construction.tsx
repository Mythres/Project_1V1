import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-construction',
  styleUrl: 'app-construction.css',
  shadow: true
})
export class AppHome {
  render() {
    return (
      <div class='app-construction'>
        <h1>UNDER CONSTRUCTION</h1>
      </div>
    );
  }
}
