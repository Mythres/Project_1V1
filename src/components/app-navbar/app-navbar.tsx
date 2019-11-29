import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-navbar',
  styleUrl: 'app-navbar.css',
  shadow: true
})
export class AppNavbar {
  render() {
    return (
      <div>
        <nav>
          <ul>
            <li><stencil-route-link url="/dev" exact={true}>Project 1v1</stencil-route-link></li>
            <li><stencil-route-link url="/gameinfo" exact={true}>Game Info</stencil-route-link></li>
            <li><stencil-route-link url="/news" exact={true}>News</stencil-route-link></li>
            <li><stencil-route-link url="/game" exact={true}>Play Now</stencil-route-link></li>
          </ul>
        </nav>
      </div>
    );
  }
}
