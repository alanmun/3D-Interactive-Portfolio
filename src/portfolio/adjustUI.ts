//Any functions that modify the UI as opposed to the universe itself are stored here

import { CE, Direction } from './utils'

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

    constructor(){
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

    public addText(CElestialEntityEnum: CE){
        let div = document.getElementById("portfolioDiv")!
        div.style.visibility = "visible"
        let title = document.getElementById("title")!
        let body = document.getElementById("spanBody")!
    
        switch(CElestialEntityEnum){
            case CE.twitter:
                title.innerHTML = "What Song Is That? (2020)"
                body.innerHTML = "I decided to write and host a twitter bot for fun on my own server, using a Raspberry Pi, for a friend's twitter account. That bot has over a hundred thousand followers now. The sucCEss of that bot led me to make my own more sophisticated bot called What Song Is That? It takes requests from users who wish to know what song is playing in a tweet, queries Shazam's API on their behalf and displays its findings cleanly on a website I made for it. Check out <a style=\"text-decoration:none; color:salmon;\" href=\"https://alanmun.github.io/WhatSongIsThat\" target=\"_blank\">whatsong.page</a> for more information."
                break
            case CE.autosage:
                title.innerHTML = "AutoSage (2021)"
                body.innerHTML = "AutoSage is a Python written app for users of BeatSage, an AI driven serviCE made for the popular VR rhythm game Beat Saber. AutoSage simplifies and automates the proCEss of using BeatSage for all of the songs the user wishes to play in Beat Saber. The tool has been updated to be packaged into a Windows executable using PyInstaller, and features a UI built using Tkinter for ease of use. See the tool's repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/autosage\" target=\"_blank\">github.com/alanmun/autosage</a>"
                break
            case CE.moon:
                title.innerHTML = "3D Interactive Portfolio (2021)"
                body.innerHTML = "This portfolio is written in TypeScript using the three.js 3D graphics library and deployed using vite. My work on the AutoSage tool led me to discovering three.js. I was enamoured with the library and had to make something with it. I wanted a cool way to show my personal technological efforts and projects, so I decided to represent them in their own worlds that can be visited by interacting with them. Every project I've undertaken has had a focus on what I stand to learn from it, and I have learned more from undertaking this project than any other personal project I've ever worked on. I had never written three.js code before, my HTML and CSS skills have definitely improved sinCE beginning, and I gave myself an introduction to shaders and 3D modelling in blender by creating the Beat Saber cube that is floating in spaCE. This portfolio remains a continual work in progress as I plan to update it with new worlds for every technological endeavor I go on. See the repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/3D-Interactive-Portfolio\" target=\"_blank\">github.com/alanmun/3D-Interactive-Portfolio</a>"
                break
            default:
                console.log("Unknown case in addText")
                break
        }
    }

    public removeText(): void {
        let div = document.getElementById("portfolioDiv")!
        div.style.visibility = "hidden"
    }

    //Fades out screen.
    public fade(fd:Direction, speed: string="730ms"): void {
        let canvas = document.getElementById("bg")!;
        //var computedStyle = getComputedStyle(canvas)

        //Set the speed of fade
        canvas.style.transitionDuration = speed

        //Begin fade
        //var oldOpacity = computedStyle.opacity
        if(fd === Direction.out) canvas.style.opacity = "0" //was if (out) so false passed in means zoom in
        else if(fd === Direction.in) canvas.style.opacity = "1"
    }
    
    //Event listener for the on screen volume button
    public onVolumeClick(): void {
        this.backgroundAudio.play();
        this.backgroundAudio.muted = !this.backgroundAudio.muted;
        this.zoomOutAudio.muted = !this.zoomOutAudio.muted;
        this.zoomInAudio.muted = !this.zoomInAudio.muted;
        if(this.zoomOutAudio.muted) (document.getElementById("soundbutton") as HTMLImageElement).src = mutedPath;
        else (document.getElementById("soundbutton") as HTMLImageElement).src = unmutedPath;
    }

    //Plays the zoom sound for a specific direction (out or in)
    public playZoom(zd: Direction): void {
        if(zd === Direction.in) this.zoomOutAudio.play();
        else if(zd === Direction.out) this.zoomInAudio.play();
    }
}