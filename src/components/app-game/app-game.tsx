import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-game',
  styleUrl: 'app-game.scss',
  shadow: true
})
export class AppGame {

  render() {
    return (
      <div id="gameContent">
        <iframe src="https://musical-chemistry.com/test/index.html" scrolling="no" width="960" height="557"></iframe>
      </div>
    );
  }

}
