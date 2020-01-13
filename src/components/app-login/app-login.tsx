import {Component, h, Method} from '@stencil/core';

@Component({
  tag: 'app-login',
  styleUrl: 'app-login.scss',
  shadow: true
})
export class AppLogin {
  modalRef!: HTMLBlazeModalElement;

  @Method()
  async showDialog() {
    if (!(await this.modalRef.isOpen())) {
      await this.modalRef.show();
    }
  }

  render() {
    return (
      <blaze-modal open={false} dismissible={true} ref={(el) => this.modalRef = el as HTMLBlazeModalElement}>
        <form class="o-container o-container--xsmall c-card u-high">
          <blaze-card-header>
            <h2 class="c-heading">Login</h2>
            <div class="c-heading__sub">Existing users</div>
          </blaze-card-header>
          <blaze-card-body>
            <div class="o-form-element">
              <label class="c-label">
                Username:
                <input class="c-field c-field--label" type="text" placeholder="TheLegend27"/>
                <div role="tooltip" class="c-hint">
                  The username for your account
                </div>
              </label>
            </div>
            <label class="o-form-element c-label">
              Password:
              <input class="c-field c-field--label" type="password" />
            </label>
            <a id="forgotPasswordBtn">Forgot Password?</a>
          </blaze-card-body>
          <blaze-card-footer>
            <button type="button" class="c-button c-button--brand c-button--block">
              Login
            </button>
          </blaze-card-footer>
        </form>
      </blaze-modal>
    );
  }
}
