import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-game',
  styleUrl: 'app-game.css',
  shadow: true
})
export class AppGame {

  render() {
    return (
      <div id="gameContent">
        <iframe src="http://musical-chemistry.com/test/index.html" scrolling="no" width="960" height="557"></iframe>
      </div>
    );
  }

}
