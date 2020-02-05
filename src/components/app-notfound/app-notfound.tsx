import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-notfound',
  styleUrl: 'app-notfound.scss',
  shadow: true
})
export class AppNotfound {
  render() {
    return (
      <div class="o-grid o-grid--no-gutter o-grid--center o-grid--full">
        <div class="o-grid__cell">
          <div class="o-container o-container--super@super o-container--xlarge@xlarge o-container--large@large o-container--medium@medium">
            <h1 class="c-heading u-super">404 - Page Not Found</h1>
          </div>
        </div>
      </div>
    );
  }
}
