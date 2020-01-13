import {Component, Event, EventEmitter, h, Method, State} from '@stencil/core';

@Component({
  tag: 'app-register',
  styleUrl: 'app-register.scss',
  shadow: true
})
export class AppRegister {

  @State() errorToastMsg = '';
  @State() successToastMsg = '';

  @Event() registerBtnClicked: EventEmitter;

  modalRef!: HTMLBlazeModalElement;
  errorAlertRef!: HTMLBlazeAlertElement;
  successAlertRef!: HTMLBlazeAlertElement;

  email: string;
  username: string;
  password: string;
  confirmPassword: string;

  @Method()
  async showDialog() {
    if (!(await this.modalRef.isOpen())) {
      await this.modalRef.show();
    }
  }

  async validateFormInput(): Promise<boolean> {
    await this.errorAlertRef.close();

    if (!this.username) {
      this.errorToastMsg = "Please enter a username";
      await this.errorAlertRef.show();
      return false;
    }
    if (!this.email) {
      this.errorToastMsg = "Please enter an email address";
      await this.errorAlertRef.show();
      return false;
    }
    if (!this.password) {
      this.errorToastMsg = "Please enter a password";
      await this.errorAlertRef.show();
      return false;
    }
    if (!this.confirmPassword) {
      this.errorToastMsg = "Please confirm your password by entering it again";
      await this.errorAlertRef.show();
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.errorToastMsg = "The passwords don't match";
      await this.errorAlertRef.show();
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

  onRegisterButtonClicked(event) {
    event.preventDefault();

    if(!this.validateFormInput()) {
      return
    }

    this.registerBtnClicked.emit({
      email: this.email,
      username: this.username,
      password: this.password
    });
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
                <input onInput={(event: UIEvent) => this.onUsernameInputChanged(event)}
                       class="c-field c-field--label" type="text" placeholder="TheLegend27"/>
                <div role="tooltip" class="c-hint">
                  The username for your account
                </div>
              </label>
            </div>
            <div class="o-form-element">
              <label class="c-label">
                Email Address:
                <input onInput={(event: UIEvent) => this.onEmailInputChanged(event)}
                       class="c-field c-field--label" type="email" placeholder="user@example.com"/>
                <div role="tooltip" class="c-hint">
                  Your email address
                </div>
              </label>
            </div>
            <label class="o-form-element c-label">
              Password:
              <input onInput={(event: UIEvent) => this.onPasswordInputChanged(event)}
                     class="c-field c-field--label" type="password" />
            </label>
            <label class="o-form-element c-label">
              Confirm Password:
              <input onInput={(event: UIEvent) => this.onConfirmPasswordInputChanged(event)}
                     class="c-field c-field--label" type="password" />
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
