import {Component, h, Listen, Prop, State} from '@stencil/core';
import {injectHistory, RouterHistory} from "@stencil/router";
import {PrivateRoute} from "./PrivateRoute/PrivateRoute";
import {AlertType} from "../../utils/AlertType";
import {waitForMilliseconds} from "../../utils/WaitForMilliseconds";
import {RegisterInformation} from "../app-register/interfaces/RegisterInformation";
import {LoginInformation} from "../app-login/interfaces/LoginInformation";
import {ForgotPasswordInformation} from "../app-login/interfaces/ForgotPasswordInformation";
import {UpdateAccountInformation} from "../app-profile/interfaces/UpdateAccountInformation";

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  shadow: true
})
export class AppRoot {
  @Prop() history: RouterHistory;

  @State() isConstruction: boolean;
  @State() isAuthenticated: boolean;
  @State() username: string;
  @State() email: string;

  appAuthRef!: HTMLAppAuthElement;
  appLoginRef: HTMLAppLoginElement;
  appRegisterRef: HTMLAppRegisterElement;
  appProfileRef: HTMLAppProfileElement;

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
      this.history.replace(window.location.pathname.replace('/login', ''));
      await this.appLoginRef.showDialog();
    } else if (window.location.pathname.endsWith('/register')) {
      this.history.replace(window.location.pathname.replace('/register', ''));
      await this.appRegisterRef.showDialog();
    }
  }

  async showLoginDialog() {
    await this.appLoginRef.clearForm();
    await this.appLoginRef.closeMessages();
    await this.appLoginRef.showDialog();
  }

  async showRegisterDialog() {
    await this.appRegisterRef.clearForm();
    await this.appRegisterRef.closeMessages();
    await this.appRegisterRef.showDialog();
  }

  // From app-navbar
  @Listen('loginModalOpenEvent')
  async loginClickedHandler() {
    await this.showLoginDialog();
  }

  // From app-navbar
  @Listen('registerModalOpenEvent')
  async registerClickedHandler() {
    await this.showRegisterDialog();
  }

  // From app-register
  @Listen('registerBtnClicked')
  async registerBtnClickedHandler(event: CustomEvent) {
   const info: RegisterInformation = event.detail;
   const result = await this.appAuthRef.register(info.username, info.email, info.password);

   if (result.success) {
     await this.appRegisterRef.showMessage(AlertType.Success, 'Registration successful');
     await waitForMilliseconds(500);
     await this.appRegisterRef.closeDialog();
     await this.showLoginDialog();
     return;
   }

   await this.appRegisterRef.showMessage(AlertType.Error, result.errorMsg);
  }

  // From app-login
  @Listen('loginBtnClicked')
  async loginBtnClickedHandler(event: CustomEvent) {
    const info: LoginInformation = event.detail;
    const result = await this.appAuthRef.logIn(info.username, info.password);

    if (result.success) {
      await this.appLoginRef.showMessage(AlertType.Success, 'Logged in successfully');

      this.username = result.credentials.username;
      this.email = result.credentials.email;
      this.isAuthenticated = true;

      await waitForMilliseconds(500);
      return;
    }

    await this.appLoginRef.showMessage(AlertType.Error, result.errorMsg);
  }

  @Listen('forgotPasswordBtnClicked')
  async forgotPasswordBtnClickedHandler(event: CustomEvent) {
    const info: ForgotPasswordInformation = event.detail;
    const result = await this.appAuthRef.forgotPassword(info.email);

    if (result.success) {
      await this.appLoginRef.showMessage(AlertType.Success, "Please check your email");
      return;
    } else {
      await this.appLoginRef.showMessage(AlertType.Error, result.errorMsg);
    }
  }

  @Listen('updateAccountBtnClicked')
  async updateAccountBtnClickedHandler(event: CustomEvent) {
    const info: UpdateAccountInformation = event.detail;
    const result = await this.appAuthRef.updateAccount(info.email, info.username, info.password);

    if (result.success) {
      await this.appProfileRef.showMessage(AlertType.Success, "Account details updated successfully");
      return;
    } else {
      await this.appProfileRef.showMessage(AlertType.Error, result.errorMsg);
    }
  }

  render() {
    return (
      <main>
        <div id="root">
          <app-navbar isAuthenticated={this.isAuthenticated} username={this.username} class={this.isConstruction ? 'hidden' : ''} />
          {this.isAuthenticated
          ? ''
          : [<app-login ref={(el) => this.appLoginRef = el as HTMLAppLoginElement} />,
            <app-register ref={(el) => this.appRegisterRef = el as HTMLAppRegisterElement} />]
          }
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
                  componentProps={{'username': this.username, 'email': this.email,
                    'ref':(el) => this.appProfileRef = el as HTMLAppProfileElement}}
                />
              </stencil-route-switch>
            </stencil-router>
          </div>
          <app-auth ref={(el) => this.appAuthRef = el as HTMLAppAuthElement} />
        </div>
      </main>
    );
  }
}

injectHistory(AppRoot);
