import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';

import outerColorPath from './assets/moon/outer_moon/moon.jpg?url'
import outerBumpPath from './assets/moon/outer_moon/moonbumpmap.jpg?url'
import groundColorPath from './assets/moon/closeup/lroc_color_poles_4k.jpg?url'
import groundDisplacementPath from './assets/moon/closeup/ldem_4.jpg?url'

export class Moon extends CelestialEntity {

	constructor(entityMesh: THREE.Mesh, loadManager: THREE.LoadingManager) {
		super('moon', 110, entityMesh);

		this.titleContent = "3D Interactive Portfolio (2021)"
		this.bodyContent = "This portfolio is written in TypeScript using the three.js 3D graphics library and deployed using vite. My work on the AutoSage tool led me to discovering three.js. I was enamoured with the library and had to make something with it. I wanted a cool way to show my personal technological efforts and projects, so I decided to represent them in their own worlds that can be visited by interacting with them. Every project I've undertaken has had a focus on what I stand to learn from it, and I have learned more from undertaking this project than any other personal project I've ever worked on. I had never written three.js code before, my HTML and CSS skills have definitely improved since beginning, and I gave myself an introduction to shaders and 3D modelling in blender by creating the Beat Saber cube that is floating in space. This portfolio remains a continual work in progress as I plan to update it with new worlds for every technological endeavor I go on. See the repo here: <a style=\"text-decoration:none; color:salmon;\" href=\"https://github.com/alanmun/3D-Interactive-Portfolio\" target=\"_blank\">github.com/alanmun/3D-Interactive-Portfolio</a>"

		//Set rotation values for every tick
		this.rotationVector = new THREE.Vector3(0.001, 0.001, 0);

		//* Texture and model loading for outer world
		let outerColor = new THREE.TextureLoader(loadManager).load(outerColorPath);
		let outerNormal = new THREE.TextureLoader(loadManager).load(outerBumpPath);

		this.setGeoAndMat(
			new THREE.SphereGeometry(6, 64, 64),
			new THREE.MeshStandardMaterial({ map: outerColor, normalMap: outerNormal })
		);

		// * Texture for close up
		let groundColor = new THREE.TextureLoader(loadManager).load(groundColorPath);
		let groundDisplacement = new THREE.TextureLoader(loadManager).load(groundDisplacementPath);

		// * Create the close up world for moon
		let moonCloseUp = new THREE.Group();
		let moonCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let moonCloseUpMat = new THREE.MeshStandardMaterial({ 
			map: groundColor, 
			displacementMap: groundDisplacement,
			displacementScale: 0.3
		})
		moonCloseUpMat.color.multiplyScalar(0.9);
		moonCloseUpMat.side = THREE.BackSide;
		this.planeCurve(moonCloseUpGeo, 4);
		let moonCloseUpMesh = new THREE.Mesh(
			moonCloseUpGeo,
			moonCloseUpMat
		);
		moonCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90;
		moonCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90;
		moonCloseUp.add(moonCloseUpMesh);
		this.setCloseUp(moonCloseUp);
	}
}