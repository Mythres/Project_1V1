import {Component, h, Event, EventEmitter, Prop} from '@stencil/core';

@Component({
  tag: 'app-navbar',
  styleUrl: 'app-navbar.scss',
  shadow: true
})
export class AppNavbar {
  @Prop() isAuthenticated: boolean;
  @Prop() username: string;

  @Event() loginModalOpenEvent: EventEmitter;
  @Event() registerModalOpenEvent: EventEmitter;

  loginClicked(event: UIEvent) {
    event.preventDefault();
    this.loginModalOpenEvent.emit();
  }

  registerClicked(event: UIEvent) {
    event.preventDefault();
    this.registerModalOpenEvent.emit();
  }

  render() {
    return (
      <div>
        <nav>
          <div class="o-grid">
            <div id="placeholder" class="o-grid__cell o-grid__cell--width-25"/>
            <div class="o-grid__cell o-grid__cell--width-75 o-grid__cell--width-50@large">
              <ul>
                <li><stencil-route-link url="/dev" exact={true}>Project 1v1</stencil-route-link></li>
                <li><stencil-route-link url="/gameinfo" exact={true}>Game Info</stencil-route-link></li>
                <li><stencil-route-link url="/news" exact={true}>News</stencil-route-link></li>
                <li class="flexLeft@large"><stencil-route-link url="/game" exact={true}>Play Now</stencil-route-link></li>
              </ul>
            </div>
            <div class="o-grid__cell o-grid__cell--width-25">
              <ul>
              {this.isAuthenticated
              ? <li class="flexRight"><stencil-route-link url="/profile" exact={true}>{this.username}</stencil-route-link></li>
              : [
                  <li onClick = {(event: UIEvent) => this.loginClicked(event)} class="flexRight pointer"><a>Log In</a></li>,
                  <li onClick = {(event: UIEvent) => this.registerClicked(event)} class="pointer"><a>Register</a></li>
                ]
            }
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
