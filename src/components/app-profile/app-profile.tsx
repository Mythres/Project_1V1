import {Component, h, State} from '@stencil/core';

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.scss',
  shadow: true
})
export class AppProfile {
  @State() email: string;
  @State() username: string;
  @State() password: string;
  @State() confirmPassword: string;

  @State() errorToastMsg = '';
  @State() successToastMsg = '';

  errorAlertRef!: HTMLBlazeAlertElement;
  successAlertRef!: HTMLBlazeAlertElement;

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

  render() {
    return (
      <div class="o-grid o-grid--no-gutter o-grid--full">
        <div class="o-grid__cell">
          <form class="o-container o-container--super@super o-container--large@xsmall c-card u-high">
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
                  <input oninput={(event: UIEvent) => this.onUsernameInputChanged(event)} class="c-field c-field--label"
                         type="text" value={this.username} placeholder="Please enter your username.."/>
                  <div role="tooltip" class="c-hint">
                    The username for your account
                  </div>
                </label>
              </div>
              <div class="o-form-element">
                <label class="c-label">
                  Email Address:
                  <input oninput={(event: UIEvent) => this.onEmailInputChanged(event)} class="c-field c-field--label"
                         type="email" value={this.email} placeholder="user@example.com"/>
                  <div role="tooltip" class="c-hint">
                    Your email address
                  </div>
                </label>
              </div>
              <label class="o-form-element c-label">
                Password:
                <input oninput={(event: UIEvent) => this.onPasswordInputChanged(event)} class="c-field c-field--label"
                       type="password" value={this.password}/>
              </label>
              <label class="o-form-element c-label">
                Confirm Password:
                <input oninput={(event: UIEvent) => this.onConfirmPasswordInputChanged(event)}
                       class="c-field c-field--label"
                       type="password" value={this.confirmPassword}/>
              </label>
            </blaze-card-body>
            <blaze-card-footer>

            </blaze-card-footer>
          </form>
        </div>
      </div>
    );
  }
}
