import {Component, h, Listen, State} from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  shadow: true
})
export class AppRoot {
  @State() isConstruction: boolean;

  appLoginRef!: HTMLAppLoginElement;
  appRegisterRef!: HTMLAppRegisterElement;

  componentWillLoad() {
    this.isConstruction = window.location.pathname === '/';
  }

  async componentDidLoad() {
    if (window.location.pathname.endsWith('/login')) {
      await this.appLoginRef.showDialog();
    }
  }

  @Listen('loginClickedEvent')
  async loginClickedHandler() {
    await this.appLoginRef.showDialog();
  }

  @Listen('registerClickedEvent')
  async registerClickedHandler() {
    await this.appRegisterRef.showDialog();
  }

  render() {
    return (
      <div>
        <main>
          <div id="root">
            <app-navbar class={this.isConstruction ? 'hidden' : ''} />
            <app-login ref={(el) => this.appLoginRef = el as HTMLAppLoginElement} />
            <app-register ref={(el) => this.appRegisterRef = el as HTMLAppRegisterElement} />
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
