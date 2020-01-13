import {Component, h, Listen, State} from '@stencil/core';
import {PrivateRoute} from "./PrivateRoute/PrivateRoute";

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  shadow: true
})
export class AppRoot {
  @State() isConstruction: boolean;
  @State() isAuthenticated: boolean;
  @State() username: string;
  @State() email: string;

  appAuthRef!: HTMLAppAuthElement;
  appLoginRef!: HTMLAppLoginElement;
  appRegisterRef!: HTMLAppRegisterElement;

  componentWillLoad() {
    this.isConstruction = window.location.pathname === '/';
  }

  async componentDidLoad() {
    this.isAuthenticated = await this.appAuthRef.isLoggedIn();

    if (this.isAuthenticated) {
      const credentials = await this.appAuthRef.getCredentials();
      this.username = credentials.username;
      this.email = credentials.email;
    }

    if (window.location.pathname.endsWith('/login')) {
      await this.appLoginRef.showDialog();
    }

    if (window.location.pathname.endsWith('/register')) {
      await this.appLoginRef.showDialog();
    }
  }

  @Listen('loginModalOpenEvent')
  async loginClickedHandler() {
    await this.appLoginRef.showDialog();
  }

  @Listen('registerModalOpenEvent')
  async registerClickedHandler() {
    await this.appRegisterRef.showDialog();
  }

  render() {
    return (
      <div>
        <main>
          <div id="root">
            <app-navbar isAuthenticated={this.isAuthenticated} username={this.username} class={this.isConstruction ? 'hidden' : ''} />
            <app-login ref={(el) => this.appLoginRef = el as HTMLAppLoginElement} />
            <app-register ref={(el) => this.appRegisterRef = el as HTMLAppRegisterElement} />
            <div id="pageContent">
              <stencil-router>
                <stencil-route-switch scrollTopOffset={0}>
                  <stencil-route url='/' component='app-construction' exact={true}/>
                  <stencil-route url={['/dev', '/dev/login', '/dev/register']} component='app-home' exact={true}/>
                  <stencil-route url={['/gameinfo', '/gameinfo/login', '/gameinfo/register']} component='app-info' exact={true}/>
                  <stencil-route url={['/news', '/news/login', '/news/register']} component='app-news' exact={true}/>
                  <stencil-route url={['/game', '/game/login', '/game/register']} component='app-game' exact={true}/>
                  <PrivateRoute
                    isAuthenticated={this.isAuthenticated}
                    url="/profile"
                    redirectUrl="/dev/login"
                    exact={true}
                    component='app-profile'
                    componentProps={{'username': this.username, 'email': this.email}}
                  />
                </stencil-route-switch>
              </stencil-router>
            </div>
            <app-auth ref={(el) => this.appAuthRef = el as HTMLAppAuthElement} />
          </div>
        </main>
      </div>
    );
  }
}
