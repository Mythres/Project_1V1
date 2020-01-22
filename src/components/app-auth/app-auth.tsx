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
import {GetMatchResult} from "./interfaces/GetMatchResult";

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
    const response = await this.makePOSTRequest('/api/auth/register',{
      username: username, email: email, password: password
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
    const response = await this.makePOSTRequest('/api/auth/login', {
      username: username, password: password
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
      const data = await response.json() as LoginResponse;

      if(data.token === '') {
        result = {
          success: false,
          errorMsg: 'Invalid email/password',
          credentials: {
            username: '',
            email: ''
          }
        };
      }

      if(data.token !== '') {
        const tokenString = data.token;
        const tokenContent: JwtTokenContent = jwtDecode(tokenString);

        this.username = tokenContent.username;
        this.email = tokenContent.email;
        this.token = {
          token: tokenString,
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
    const response = await this.makePOSTRequest("/api/auth/forgot", {
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
    if(!this.token) {
      return {
        success: false,
        errorMsg: "Authorization expired",
        credentials: {
          username: "",
          email: ""
        },
        authStatus: {
          isAuhtorized: false
        }
      };
    }

    const response = await this.makePOSTRequest('/api/auth/update', {
      username: username, email: email, password: password
    }, true);

    if (response.status === 401) {
      this.email = "";
      this.username = "";
      this.token = undefined;

      return {
        success: false,
        errorMsg: "Authorization expired",
        credentials: {
          username: "",
          email: ""
        },
        authStatus: {
          isAuhtorized: false
        }
      }
    }

    if (!response.ok) {
      return {
        success: false,
        errorMsg: 'A network error occurred',
        credentials: {
          username: '',
          email: ''
        },
        authStatus: {
          isAuhtorized: undefined
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
        },
        authStatus: {
          isAuhtorized: undefined
        }
      };
    }

    const tokenString = responseData.token;
    const tokenContent: JwtTokenContent = jwtDecode(tokenString);

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
      },
      authStatus: {
        isAuhtorized: true
      }
    }
  }

  @Method()
  async GetMatch(): Promise<GetMatchResult> {
    if(!this.token) {
      return {
        success: false,
        authStatus: {
          isAuhtorized: false
        },
        data: {
          playerSessionId: undefined,
          ipAddress: undefined,
          port: undefined
        }
      };
    }

    const response = await this.makePOSTRequest('/api/game/match',{}, true);

    if (response.status === 401) {
      this.email = "";
      this.username = "";
      this.token = undefined;

      return {
        success: false,
        authStatus: {
          isAuhtorized: false
        },
        data: {
          playerSessionId: undefined,
          ipAddress: undefined,
          port: undefined
        }
      };
    }

    if (!response.ok) {
      return {
        success: false,
        authStatus: {
          isAuhtorized: true
        },
        data: {
          playerSessionId: undefined,
          ipAddress: undefined,
          port: undefined
        }
      };
    }

    const data = await response.json();

    return {
      success: true,
      authStatus: {
        isAuhtorized: true
      },
      data: data
    };
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
