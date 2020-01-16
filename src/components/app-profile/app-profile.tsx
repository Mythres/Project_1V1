import {Component, Event, EventEmitter, h, Method, Prop, State} from '@stencil/core';
import {AlertType} from "../../utils/AlertType";
import {UpdateAccountInformation} from "./interfaces/UpdateAccountInformation";

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.scss',
  shadow: true
})
export class AppProfile {
  @Prop() email: string;
  @Prop() username: string;

  @State() newEmail: string;
  @State() newUsername: string;
  @State() password: string;
  @State() confirmPassword: string;

  @State() errorToastMsg = '';
  @State() successToastMsg = '';

  @Event() updateAccountBtnClicked: EventEmitter;

  errorAlertRef!: HTMLBlazeAlertElement;
  successAlertRef!: HTMLBlazeAlertElement;

  @Method()
  async clearForm() {
    this.newUsername = this.username;
    this.newEmail = this.email;
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

  async componentWillLoad() {
    await this.clearForm();
  }

  async validateFormInput(): Promise<boolean> {
    await this.closeMessages();

    if (!this.newUsername) {
      await this.showMessage(AlertType.Error, "Please enter your new username");
      return false;
    }
    if (!this.newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      await this.showMessage(AlertType.Error, "Please enter a valid email address");
      return false;
    }
    if (this.password !== this.confirmPassword) {
      await this.showMessage(AlertType.Error, "The passwords don't match");
      return false;
    }

    return true;
  }

  onEmailInputChanged(event) {
    this.newEmail = event.target.value;
  }

  onUsernameInputChanged(event) {
    this.newUsername = event.target.value;
  }

  onPasswordInputChanged(event) {
    this.password = event.target.value;
  }

  onConfirmPasswordInputChanged(event) {
    this.confirmPassword = event.target.value;
  }

  async onUpdateButtonClicked(event) {
    event.preventDefault();

    if(!(await this.validateFormInput())) {
      return;
    }

    const info: UpdateAccountInformation = {
      email: this.newEmail,
      username: this.newUsername,
      password: this.password
    };

    this.updateAccountBtnClicked.emit(info);
  }

  async onResetButtonClicked(event) {
    event.preventDefault();
    await this.clearForm();
  }

  render() {
    return (
      <div class="o-grid o-grid--no-gutter o-grid--center o-grid--full">
        <div class="o-grid__cell">
          <form class="o-container o-container--small c-card u-high">
            <blaze-card-header>
              <h1 class="c-heading u-super">Profile</h1>
              <h2 class="c-heading__sub u-large">Manage your account settings</h2>
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
                         type="text" value={this.newUsername} placeholder="Please enter your username.."/>
                  <div role="tooltip" class="c-hint">
                    The username for your account
                  </div>
                </label>
              </div>
              <div class="o-form-element">
                <label class="c-label">
                  Email Address:
                  <input onInput={(event: UIEvent) => this.onEmailInputChanged(event)} class="c-field c-field--label"
                         type="email" value={this.newEmail} placeholder="user@example.com"/>
                  <div role="tooltip" class="c-hint">
                    Your email address
                  </div>
                </label>
              </div>
              <label class="o-form-element c-label">
                Password:
                <input onInput={(event: UIEvent) => this.onPasswordInputChanged(event)} class="c-field c-field--label"
                       type="password" value={this.password}/>
              </label>
              <label class="o-form-element c-label">
                Confirm Password:
                <input onInput={(event: UIEvent) => this.onConfirmPasswordInputChanged(event)}
                       class="c-field c-field--label"
                       type="password" value={this.confirmPassword}/>
              </label>
            </blaze-card-body>
            <blaze-card-footer>
              <span class="c-input-group">
                <button onClick={(event: UIEvent) => this.onUpdateButtonClicked(event)}
                        type="button" class="c-button c-button--brand c-button--block">
                  Update
                </button>
                <button onClick={(event: UIEvent) => this.onResetButtonClicked(event)}
                        type="button" class="c-button c-button--block">
                  Reset
                </button>
              </span>
            </blaze-card-footer>
          </form>
        </div>
      </div>
    );
  }
}
