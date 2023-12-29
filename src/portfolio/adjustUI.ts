//Any functions that modify the UI as opposed to the universe itself are stored here

import { Direction } from './utils'
import { CelestialEntity } from './CelestialEntity'

//Paths to various assets
import backgroundPath from './assets/background.mp3?url'
import zoomInPath from './assets/distantboom.wav?url'
import zoomOutPath from './assets/zoomoutmodified.wav?url'
import mutedPath from './assets/muted.png?url'
import unmutedPath from './assets/unmuted.png?url'

export class UI {
  private zoomInAudio = new Audio(zoomInPath);
  private zoomOutAudio = new Audio(zoomOutPath);
  private backgroundAudio = new Audio(backgroundPath);

  constructor() {
    //Mute everything by default, adjust volumes by my own ear's taste
    this.zoomInAudio.muted = true;
    this.zoomInAudio.volume = 0.6;

    this.zoomOutAudio.volume = 0.6;
    this.zoomOutAudio.muted = true;

    this.backgroundAudio.volume = 0.65
    this.backgroundAudio.muted = true
  }

  //Event listener for back button click
  public onBackClick(): void {
    history.back();
  }

  public addText(cEntity: CelestialEntity) {
    let div = document.getElementById("portfolioDiv")!
    div.style.visibility = "visible"
    let title = document.getElementById("title")!
    let body = document.getElementById("spanBody")!

    title.innerHTML = cEntity.titleContent;
    body.innerHTML = cEntity.bodyContent;

    //title.innerHTML = `<pre>${cEntity.titleContent}</pre>`;
    //body.innerHTML = `<pre>${cEntity.bodyContent}</pre>`;
  }

  public removeText(): void {
    let div = document.getElementById("portfolioDiv")!
    div.style.visibility = "hidden"
  }

  //Fades out screen.
  public fade(fd: Direction, speed: string = "730ms"): void {
    let canvas = document.getElementById("bg")!;
    //var computedStyle = getComputedStyle(canvas)

    //Set the speed of fade
    canvas.style.transitionDuration = speed

    //Begin fade
    //var oldOpacity = computedStyle.opacity
    if (fd === Direction.out) canvas.style.opacity = "0" //was if (out) so false passed in means zoom in
    else if (fd === Direction.in) canvas.style.opacity = "1"
  }

  //Event listener for the on screen volume button
  public onVolumeClick(): void {
    this.backgroundAudio.play();
    this.backgroundAudio.muted = !this.backgroundAudio.muted;
    this.zoomOutAudio.muted = !this.zoomOutAudio.muted;
    this.zoomInAudio.muted = !this.zoomInAudio.muted;
    if (this.zoomOutAudio.muted) (document.getElementById("soundbutton") as HTMLImageElement).src = mutedPath;
    else (document.getElementById("soundbutton") as HTMLImageElement).src = unmutedPath;
  }

  //Plays the zoom sound for a specific direction (out or in)
  public playZoom(zd: Direction): void {
    if (zd === Direction.in) this.zoomOutAudio.play();
    else if (zd === Direction.out) this.zoomInAudio.play();
  }
}