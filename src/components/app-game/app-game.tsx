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
        <iframe src="http://1v1arena.epizy.com/?i=2" scrolling="no" width="960" height="560"></iframe>
      </div>
    );
  }

}
