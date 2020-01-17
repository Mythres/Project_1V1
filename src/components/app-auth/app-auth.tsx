import {Host, h, Method, Component} from '@stencil/core';
import {AuthCredentials} from "./interfaces/AuthCredentials";
import {LoginResult} from "./interfaces/LoginResult";
import {RegisterResult} from "./interfaces/RegisterResult";
import {ForgotPasswordResult} from "./interfaces/ForgotPasswordResult";

@Component({
  tag: 'app-auth',
  styleUrl: 'app-auth.scss',
  shadow: true
})
export class AppAuth {

  token: string;
  username: string;
  email: string;

  @Method()
  async isLoggedIn() {
    return !!this.token;
  }

  @Method()
  async register(_username: string, _email: string, _password: string): Promise<RegisterResult> {
    return {
      success: true,
      errorMsg: 'Username already exists'
    }
  }

  @Method()
  async logIn(_username: string, _password: string): Promise<LoginResult> {
    this.username = 'player';
    this.email = 'user@example.com';

    return {
      success: true,
      errorMsg: 'Incorrect Password',
      credentials: {
        username: this.username,
        email: this.email
      },
    }
  }

  @Method()
  async forgotPassword(_email: string): Promise<ForgotPasswordResult> {
    return {
      success: true,
      errorMsg: ''
    }
  }

  @Method()
  async updateAccount(_email: string, _username:string, _password:string) {
    return {
      success: false,
      errorMsg: 'No'
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
