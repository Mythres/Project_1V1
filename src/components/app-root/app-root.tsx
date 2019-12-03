import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true
})
export class AppRoot {
  @State() isConstruction: boolean;

  componentWillLoad() {
    if (window.location.pathname === '/') {
      this.isConstruction = true;
    } else {
      this.isConstruction = false;
    }
  }

  render() {
    return (
      <div>
        <main>
          <div id="root">
            <app-navbar class={this.isConstruction ? 'hidden' : ''}></app-navbar>
            <div id="pageContent">
              <stencil-router>
                <stencil-route-switch scrollTopOffset={0}>
                  <stencil-route url='/' component='app-construction' exact={true} />
                  <stencil-route url='/dev' component='app-home' exact={true} />
                  <stencil-route url='/gameinfo' component='app-info' exact={true} />
                  <stencil-route url='/news' component='app-news' exact={true} />
                  <stencil-route url='/game' component='app-game' exact={true} />
                </stencil-route-switch>
              </stencil-router>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
