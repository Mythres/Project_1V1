import {Component, h, Host, Method} from '@stencil/core';
import jwtDecode from "jwt-decode";
import {AuthCredentials} from "./interfaces/AuthCredentials";
import {LoginResult} from "./interfaces/LoginResult";
import {RegisterResult} from "./interfaces/RegisterResult";
import {ForgotPasswordResult} from "./interfaces/ForgotPasswordResult";
import {LoginResponse} from "./interfaces/LoginResponse";
import {JwtToken} from "./interfaces/JwtToken";
import {JwtTokenContent} from "./interfaces/JwtTokenContent";
import {UpdateAccountResult} from "./interfaces/UpdateAccountResult";
import {UpdateAccountResponse} from "./interfaces/UpdateAccountResponse";

@Component({
  tag: 'app-auth',
  styleUrl: 'app-auth.scss',
  shadow: true
})
export class AppAuth {
  token: JwtToken;
  username: string;
  email: string;

  @Method()
  async isLoggedIn() {
    return !!this.token;
  }

  @Method()
  async register(username: string, email: string, password: string): Promise<RegisterResult> {
    const response = await this.makePOSTRequest('/api/auth/register/main',{
      username: username, email: email, passwordHash: password
    }, false);

    if (!response.ok) {
      return {
        success: false,
        errorMsg: 'A network error occurred',
      };
    }

    return await response.json();
  }

  @Method()
  async logIn(username: string, password: string): Promise<LoginResult> {
    const response = await this.makePOSTRequest('/api/auth/login/main', {
      username: username, passwordHash: password
    }, false);

    let result: LoginResult;

    if (!response.ok) {
      result = {
        success: false,
        errorMsg: 'A network error occurred',
        credentials: {
          username: '',
          email: ''
        }
      };
    } else {
      const responseToken = ((await response.json()) as LoginResponse).token;

      if(responseToken === '') {
        result = {
          success: false,
          errorMsg: 'Invalid email/password',
          credentials: {
            username: '',
            email: ''
          }
        };
      } else {
        const tokenContent: JwtTokenContent = jwtDecode(responseToken);

        this.username = tokenContent.username;
        this.email = tokenContent.email;
        this.token = {
          token: responseToken,
          expires: tokenContent.exp
        };

        result = {
          success: true,
          errorMsg: 'Incorrect Password',
          credentials: {
            username: this.username,
            email: this.email
          },
        }
      }
    }

    return result;
  }

  @Method()
  async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    const response = await this.makePOSTRequest("/api/auth/forgot/main", {
      email: email
    }, false);

    if (!response.ok) {
      return {
        success: false,
        errorMsg: "A network error occurred"
      };
    }

    return await response.json();
  }

  @Method()
  async updateAccount(username: string, email: string, password: string): Promise<UpdateAccountResult>{
    const response = await this.makePOSTRequest('/api/auth/update/main', {
      username: username, email: email, passwordHash: password
    }, true);

    if (!response.ok) {
      return {
        success: false,
        errorMsg: 'A network error occurred',
        credentials: {
          username: '',
          email: ''
        }
      };
    }

    const responseData = ((await response.json()) as UpdateAccountResponse);
    if (!responseData.success) {
      return {
        success: false,
        errorMsg: responseData.errorMsg,
        credentials: {
          username: '',
          email: ''
        }
      };
    }

    const tokenContent: JwtTokenContent = jwtDecode(responseData.token);

    this.username = tokenContent.username;
    this.email = tokenContent.email;
    this.token = {
      token: responseData.token,
      expires: tokenContent.exp
    };

    return {
      success: true,
      errorMsg: '',
      credentials: {
        username: this.username,
        email: this.email
      }
    }
  }

  @Method()
  async logOut() {
    this.username = undefined;
    this.email = undefined;
    this.token = undefined;
  }

  @Method()
  async getCredentials(): Promise<AuthCredentials> {
    return {
      username: this.username,
      email: this.email
    }
  }

  makePOSTRequest(url: string, data: {[key: string]: any}, authenticate: boolean): Promise<any> {
    const headers = authenticate
      ? new Headers({
        'Authorization': `Bearer ${this.token.token}`,
        'Content-Type': 'application/json'
      })
      : new Headers({
        'Content-Type': 'application/json'
      });

    return fetch(url, {
      method: 'POST',
      mode: 'same-origin',
      cache: 'no-cache',
      headers: headers,
      body: JSON.stringify(data)
    });
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }

}
