import {Component, Event, EventEmitter, h, Method, State} from '@stencil/core';
import {LoginInformation} from "./interfaces/LoginInformation";
import {AlertType} from "../../utils/AlertType";
import {ForgotPasswordInformation} from "./interfaces/ForgotPasswordInformation";

@Component({
  tag: 'app-login',
  styleUrl: 'app-login.scss',
  shadow: true
})
export class AppLogin {
  @State() username: string;
  @State() password: string;
  @State() email: string;

  @State() forgotPassword = false;

  @State() errorToastMsg = '';
  @State() successToastMsg = '';

  @Event() loginBtnClicked: EventEmitter;
  @Event() forgotPasswordBtnClicked: EventEmitter;

  modalRef!: HTMLBlazeModalElement;
  errorAlertRef!: HTMLBlazeAlertElement;
  successAlertRef!: HTMLBlazeAlertElement;

  @Method()
  async showDialog() {
    if (!(await this.modalRef.isOpen())) {
      await this.clearForm();
      await this.closeMessages();
      await this.modalRef.show();
    }
  }

  @Method()
  async closeDialog() {
    if ((await this.modalRef.isOpen())) {
      await this.modalRef.close();
    }
  }

  @Method()
  async clearForm() {
    this.username = '';
    this.password = '';
    this.email = '';
    this.forgotPassword = false;
  }

  @Method()
  async showMessage(alertType: AlertType, text: string) {
    if (alertType === AlertType.Error) {
      this.errorToastMsg = text;
      await this.successAlertRef.close();
      await this.errorAlertRef.show();
    } else {
      this.successToastMsg = text;
      await this.errorAlertRef.close();
      await this.successAlertRef.show();
    }
  }

  @Method()
  async closeMessage(alertType: AlertType) {
    if (alertType === AlertType.Error) {
      await this.errorAlertRef.close();
    } else {
      await this.successAlertRef.close();
    }
  }

  @Method()
  async closeMessages() {
    await this.errorAlertRef.close();
    await this.successAlertRef.close();
  }

  async validateFormInput(): Promise<boolean> {
    await this.closeMessages();

    if (this.forgotPassword) {
      if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        await this.showMessage(AlertType.Error, 'Please enter a valid email address');
        return false;
      }

      return true;
    }

    if (!this.username) {
      await this.showMessage(AlertType.Error, "Please enter your username");
      return false;
    }
    if (!this.password) {
      await this.showMessage(AlertType.Error, "Please enter your password");
      return false;
    }

    return true;
  }

  onUsernameInputChanged(event) {
    this.username = event.target.value;
  }

  onPasswordInputChanged(event) {
    this.password = event.target.value;
  }

  onEmailInputChanged(event) {
    this.email = event.target.value;
  }

  async onLoginButtonClicked(event) {
    event.preventDefault();

    if(!(await this.validateFormInput())) {
      return;
    }

    const info: LoginInformation = {
      username: this.username,
      password: this.password
    };

    this.loginBtnClicked.emit(info);
  }

  async onForgotPasswordClicked(event) {
    event.preventDefault();
    await this.closeMessages();
    this.forgotPassword = true;
  }

  async onForgotPasswordSubmitClicked(event) {
    event.preventDefault();

    if(!(await this.validateFormInput())) {
      return;
    }

    const info: ForgotPasswordInformation = {
      email: this.email,
    };

    this.forgotPasswordBtnClicked.emit(info);
  }


  async onForgotPasswordBackClicked(event) {
    event.preventDefault();
    await this.closeMessages();
    await this.clearForm();
    this.forgotPassword = false
  }

  render() {
    return (
      <blaze-modal open={false} dismissible={true} ref={(el) => this.modalRef = el as HTMLBlazeModalElement}>
        <form class="o-container o-container--xsmall c-card u-high">
          <blaze-card-header>
            <h2 class="c-heading">Login</h2>
            <div class="c-heading__sub">Existing users</div>
            <blaze-alert ref={(el) => this.errorAlertRef = el as HTMLBlazeAlertElement} open={false} dismissible={false} type="error">
              {this.errorToastMsg}</blaze-alert>
            <blaze-alert ref={(el) => this.successAlertRef = el as HTMLBlazeAlertElement} open={false} dismissible={false} type="success">
              {this.successToastMsg}</blaze-alert>
          </blaze-card-header>
          {!this.forgotPassword
            ? [
              <blaze-card-body>
                <div class="o-form-element">
                  <label class="c-label">
                    Username:
                    <input onInput={(event: UIEvent) => {
                      this.onUsernameInputChanged(event)
                    }} class="c-field c-field--label"
                           type="text" value={this.username}/>
                    <div role="tooltip" class="c-hint">
                      Your username
                    </div>
                  </label>
                </div>
                <label class="o-form-element c-label">
                  Password:
                  <input onInput={(event: UIEvent) => this.onPasswordInputChanged(event)} class="c-field c-field--label"
                         type="password" value={this.password}/>
                </label>
                <a onClick={(event: UIEvent) => this.onForgotPasswordClicked(event)} id="forgotPasswordBtn">Forgot
                  Password?</a>
              </blaze-card-body>,
              <blaze-card-footer>
                <button onClick = {(event : UIEvent) => this.onLoginButtonClicked(event)}
                  type="button" class="c-button c-button--brand c-button--block">
                  Login
                </button>
              </blaze-card-footer>
            ]
          : [
              <blaze-card-body>
                <div class="o-form-element">
                  <label class="c-label">
                    Email Address:
                    <input onInput={(event: UIEvent) => this.onEmailInputChanged(event)} class="c-field c-field--label"
                           type="email" value={this.email} placeholder="user@example.com"/>
                    <div role="tooltip" class="c-hint">
                      Your email address
                    </div>
                  </label>
                </div>
              </blaze-card-body>,
              <blaze-card-footer>
                <span class="c-input-group">
                  <button onClick={(event: UIEvent) => this.onForgotPasswordSubmitClicked(event)}
                          type="button" class="c-button c-button--brand c-button--block">
                    Send Email
                  </button>
                  <button onClick={(event: UIEvent) => this.onForgotPasswordBackClicked(event)}
                          type="button" class="c-button c-button--block">
                    Back
                  </button>
                </span>
              </blaze-card-footer>
            ]}
        </form>
      </blaze-modal>
    );
  }
}
