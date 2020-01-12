import {Component, h, Method} from '@stencil/core';

@Component({
  tag: 'app-register',
  styleUrl: 'app-register.scss',
  shadow: true
})
export class AppRegister {
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
            <h2 class="c-heading">Register</h2>
            <div class="c-heading__sub">Create a new account</div>
          </blaze-card-header>
          <blaze-card-body>
            <div class="o-form-element">
              <label class="c-label">
                Username:
                <input class="c-field c-field--label" type="text" placeholder="Please enter your username.."/>
                <div role="tooltip" class="c-hint">
                  The username for your account
                </div>
              </label>
            </div>
            <div class="o-form-element">
              <label class="c-label">
                Email Address:
                <input class="c-field c-field--label" type="email" placeholder="user@example.com"/>
                <div role="tooltip" class="c-hint">
                  Your email address
                </div>
              </label>
            </div>
            <label class="o-form-element c-label">
              Password:
              <input class="c-field c-field--label" type="password" />
            </label>
            <label class="o-form-element c-label">
              Confirm Password:
              <input class="c-field c-field--label" type="password" />
            </label>
          </blaze-card-body>
          <blaze-card-footer>
            <button type="button" class="c-button c-button--brand c-button--block">
              Register
            </button>
          </blaze-card-footer>
        </form>
      </blaze-modal>
    );
  }
}
