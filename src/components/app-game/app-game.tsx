import {Component, h, Listen, Method, Prop, State, Watch} from '@stencil/core';
import {UnityLoader} from '../../assets/game/UnityLoader';
import {GetMatchResponse} from "../app-auth/interfaces/GetMatchResponse";

@Component({
  tag: 'app-game',
  styleUrl: 'app-game.scss',
  shadow: true
})
export class AppGame {
  @Prop() username: string;

  @State() gameContentHeight: number = 0.0;

  gameContentRef!: HTMLDivElement;

  unityInstance: any;

  @Listen('resize', { target: 'window' })
  onResize() {
    this.gameContentHeight = this.gameContentRef.offsetWidth / 16 * 9;
  }

  componentDidLoad() {
    this.unityInstance = UnityLoader.instantiate(this.gameContentRef, "/assets/game/Build.json");
    this.gameContentHeight = 1;
  }

  componentDidUnload() {
    this.unityInstance.Quit();
    this.unityInstance = undefined;
  }

  @Watch('username')
  async updateUsername(newUsername: string, _oldUsername: string) {
    await this.SetUsername(newUsername)
  }

  @Method()
  async SetUsername(username: string): Promise<void> {
    this.gameContentHeight = this.gameContentRef.offsetWidth / 16 * 9;
    this.unityInstance.SendMessage('PlayerInfo', 'SetUsername', username);
  }

  @Method()
  async SetMatchDetails(data: GetMatchResponse) {
    this.unityInstance.SendMessage('NetworkManager', 'StartClientOnDemand', `${data.playerSessionId}|${data.ipAddress}|${data.port}`);
  }

  render() {
    return (
      <div class="o-grid o-grid--no-gutter o-grid--center o-grid--full">
        <div class="o-grid__cell">
          <div class="o-container o-container--super@super o-container--xlarge@xlarge o-container--large@large o-container--medium@medium">
            <div ref={(el) => this.gameContentRef = el as HTMLDivElement} id="gameContent" style={{height: this.gameContentHeight.toString() + 'px'}}>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
