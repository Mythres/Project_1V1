import {Component, h, Method, Prop, Watch} from '@stencil/core';
import {UnityLoader} from '../../assets/game/UnityLoader';
import {GetMatchResponse} from "../app-auth/interfaces/GetMatchResponse";

@Component({
  tag: 'app-game',
  styleUrl: 'app-game.scss',
  shadow: true
})
export class AppGame {
  @Prop() username: string;

  gameContentRef!: HTMLDivElement;

  unityInstance: any;

  componentDidLoad() {
    this.unityInstance = UnityLoader.instantiate(this.gameContentRef, "/assets/game/Build.json", {
      onProgress: this.loadProgress.bind(this)
    });
  }

  loadProgress(unityInstance, progress) {
    if (!unityInstance.Module)
      return;
    if (!unityInstance.logo) {
      unityInstance.logo = document.createElement("div");
      unityInstance.logo.className = "logo " + unityInstance.Module.splashScreenStyle;
      unityInstance.container.appendChild(unityInstance.logo);
    }
    if (!unityInstance.progress) {
      unityInstance.progress = document.createElement("div");
      unityInstance.progress.className = "progress " + unityInstance.Module.splashScreenStyle;
      unityInstance.progress.empty = document.createElement("div");
      unityInstance.progress.empty.className = "empty";
      unityInstance.progress.appendChild(unityInstance.progress.empty);
      unityInstance.progress.full = document.createElement("div");
      unityInstance.progress.full.className = "full";
      unityInstance.progress.appendChild(unityInstance.progress.full);
      unityInstance.container.appendChild(unityInstance.progress);
    }
    unityInstance.progress.full.style.width = (100 * progress) + "%";
    unityInstance.progress.empty.style.width = (100 * (1 - progress)) + "%";
    if (progress == 1) {
      unityInstance.logo.style.display = unityInstance.progress.style.display = "none";
      this.unityInstance.SendMessage('Canvas/Text1', 'SetLabelText', this.username);
    }
  }

  @Watch('username')
  async updateUsername(newUsername: string, _oldUsername: string) {
    await this.SetUsername(newUsername)
  }

  @Method()
  async SetUsername(username: string): Promise<void> {
    this.unityInstance.SendMessage('Canvas/Text1', 'SetLabelText', username);
  }

  @Method()
  async SetMatchDetails(data: GetMatchResponse) {
    this.unityInstance.SendMessage('GameController', 'SetMatchDetails', `${data.playerSessionId}|${data.ipAddress}|${data.port}`);
  }

  render() {
    return (
      <div class="o-grid o-grid--no-gutter o-grid--center o-grid--full">
        <div class="o-grid__cell">
          <div class="o-container o-container--super@super o-container--xlarge@xlarge o-container--large@large o-container--medium@medium">
            <div ref={(el) => this.gameContentRef = el as HTMLDivElement} id="gameContent">
            </div>
          </div>
        </div>
      </div>
    );
  }
}
