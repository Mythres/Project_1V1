import {Component, Event, EventEmitter, h, Method, Prop, State} from '@stencil/core';
import {AlertType} from "../../utils/AlertType";
import {RegisterInformation} from "./interfaces/RegisterInformation";
import {RouterHistory} from "@stencil/router";

@Component({
  tag: 'app-register',
  styleUrl: 'app-register.scss',
  shadow: true
})
export class AppRegister {
  @Prop() history: RouterHistory;

  @State() email: string;
  @State() username: string;
  @State() password: string;
  @State() confirmPassword: string;

  @State() errorToastMsg = '';
  @State() successToastMsg = '';

  @Event() registerBtnClicked: EventEmitter;

  modalRef!: HTMLBlazeModalElement;
  errorAlertRef!: HTMLBlazeAlertElement;
  successAlertRef!: HTMLBlazeAlertElement;

  @Method()
  async showDialog() {
    if (!(await this.modalRef.isOpen())) {
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
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  @Method()
  async showMessage(alertType: AlertType, text: string) {
    if (alertType === AlertType.Error) {
      this.errorToastMsg = text;
      await this.errorAlertRef.show();
    } else {
      this.successToastMsg = text;
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

    if (!this.username) {
      await this.showMessage(AlertType.Error, "Please enter a username");
      return false;
    }
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      await this.showMessage(AlertType.Error, "Please enter a valid email address");
      return false;
    }
    if (!this.password) {
      await this.showMessage(AlertType.Error, "Please enter a password");
      return false;
    }
    if (!this.confirmPassword) {
      await this.showMessage(AlertType.Error, "Please confirm your password by entering it again");
      return false;
    }
    if (this.password !== this.confirmPassword) {
      await this.showMessage(AlertType.Error, "The passwords don't match");
      return false;
    }

    return true;
  }

  onEmailInputChanged(event) {
    this.email = event.target.value;
  }

  onUsernameInputChanged(event) {
    this.username = event.target.value;
  }

  onPasswordInputChanged(event) {
    this.password = event.target.value;
  }

  onConfirmPasswordInputChanged(event) {
    this.confirmPassword = event.target.value;
  }

  async onRegisterButtonClicked(event) {
    event.preventDefault();

    if(!(await this.validateFormInput())) {
      return;
    }

    const info: RegisterInformation = {
      email: this.email,
      username: this.username,
      password: this.password
    };

    this.registerBtnClicked.emit(info);
  }

  render() {
    return (
      <blaze-modal open={false} dismissible={true} ref={(el) => this.modalRef = el as HTMLBlazeModalElement}>
        <form class="o-container o-container--xsmall c-card u-high">
          <blaze-card-header>
            <h2 class="c-heading">Register</h2>
            <div class="c-heading__sub">Create a new account</div>
            <blaze-alert ref={(el) => this.errorAlertRef = el as HTMLBlazeAlertElement} open={false} dismissible={false} type="error">
              {this.errorToastMsg}</blaze-alert>
            <blaze-alert ref={(el) => this.successAlertRef = el as HTMLBlazeAlertElement} open={false} dismissible={false} type="success">
              {this.successToastMsg}</blaze-alert>
          </blaze-card-header>
          <blaze-card-body>
            <div class="o-form-element">
              <label class="c-label">
                Username:
                <input onInput={(event: UIEvent) => this.onUsernameInputChanged(event)} class="c-field c-field--label"
                       type="text" value={this.username} placeholder="Please enter your username.."/>
                <div role="tooltip" class="c-hint">
                  The username for your account
                </div>
              </label>
            </div>
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
            <label class="o-form-element c-label">
              Password:
              <input onInput={(event: UIEvent) => this.onPasswordInputChanged(event)} class="c-field c-field--label"
                     type="password" value={this.password} />
            </label>
            <label class="o-form-element c-label">
              Confirm Password:
              <input onInput={(event: UIEvent) => this.onConfirmPasswordInputChanged(event)} class="c-field c-field--label"
                     type="password" value={this.confirmPassword} />
            </label>
          </blaze-card-body>
          <blaze-card-footer>
            <button onClick={(event: UIEvent) => this.onRegisterButtonClicked(event)} type="button" class="c-button c-button--brand c-button--block">
              Register
            </button>
          </blaze-card-footer>
        </form>
      </blaze-modal>
    );
  }
}
