import {Host, h, Method, Component} from '@stencil/core';

export interface LoginResult {
  success: boolean;
  credentials: AuthCredentials;
}

export interface AuthCredentials {
  username: string;
  email: string;
}

@Component({
  tag: 'app-auth',
  styleUrl: 'app-auth.scss',
  shadow: true
})
export class AppAuth {

  token: string;
  username: string;
  email: string;

  componentWillLoad() {

  }

  @Method()
  async isLoggedIn() {
    return !!this.token;
  }

  @Method()
  async logIn(_username: string, _password: string): Promise<LoginResult> {
    this.username = 'player';
    this.email = 'user@example.com';

    return {
      success: false,
      credentials: {
        username: this.username,
        email: this.email
      },
    }
  }

  @Method()
  async logOut() {

  }

  @Method()
  async getCredentials(): Promise<AuthCredentials> {
    return {
      username: this.username,
      email: this.email
    }
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }

}
