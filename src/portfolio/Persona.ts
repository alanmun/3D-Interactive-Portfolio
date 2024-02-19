import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';

export class Persona extends CelestialEntity {

	constructor(loadManager: THREE.LoadingManager, entity: THREE.Group) {
		super('p5r', 130, entity);

		entity.scale.multiplyScalar(0.15);

		this.titleContent = "Persona 5 Royal Theme for Discord"
		this.bodyContent = "After enjoying the game so much, I decided to make a style for Discord themed around Persona 5 Royal. The theme is made entirely out of CSS. It was quite a challenge to hack Discord's UI using nothing but CSS- a lot of times I ran into roadblocks where things just weren't possible without access to JavaScript. This limitation caused me to get very creative with some styles. See the theme's repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/p5r-discord-theme\" target=\"_blank\">github.com/alanmun/p5r-discord-theme</a>"

		//Set rotation values for every tick
		this.rotationVector = new THREE.Vector3(0.001, 0.005, 0);
	}
}