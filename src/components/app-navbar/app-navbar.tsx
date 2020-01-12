import { Component, h, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'app-navbar',
  styleUrl: 'app-navbar.scss',
  shadow: true
})
export class AppNavbar {
  @State() placeholderWidth = 0;

  @Event() loginClickedEvent: EventEmitter;
  @Event() registerClickedEvent: EventEmitter;

  navListRef!: HTMLUListElement;

  componentDidLoad() {
    const authElements = this.navListRef.getElementsByClassName("authControl");
    let newPlaceholderWidth = 0;

    for (let i = 0; i < authElements.length; i++) {
      newPlaceholderWidth += authElements.item(i).clientWidth;
    }

    this.placeholderWidth = newPlaceholderWidth;
  }

  loginClicked(event: UIEvent) {
    event.preventDefault();
    this.loginClickedEvent.emit();
  }

  registerClicked(event: UIEvent) {
    event.preventDefault();
    this.registerClickedEvent.emit();
  }

  render() {
    return (
      <div>
        <nav>
          <ul ref={(el) => this.navListRef = el as HTMLUListElement}>
            <li class="flexLeft hidden" style={{width: this.placeholderWidth.toString() + "px"}}/>
            <li><stencil-route-link url="/dev" exact={true}>Project 1v1</stencil-route-link></li>
            <li><stencil-route-link url="/gameinfo" exact={true}>Game Info</stencil-route-link></li>
            <li><stencil-route-link url="/news" exact={true}>News</stencil-route-link></li>
            <li><stencil-route-link url="/game" exact={true}>Play Now</stencil-route-link></li>
            <li onClick={(event: UIEvent) => this.loginClicked(event)} class="flexRight authControl"><a>Log In</a></li>
            <li onClick={(event: UIEvent) => this.registerClicked(event)} class="authControl"><a>Register</a></li>
          </ul>
        </nav>
      </div>
    );
  }
}
