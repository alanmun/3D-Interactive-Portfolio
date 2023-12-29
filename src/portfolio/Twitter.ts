import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';

export class Twitter extends CelestialEntity {
	
	constructor(group: THREE.Group) {
		super('twitter', 40, group);

		this.titleContent = "What Song Is That? (2020)";
		this.bodyContent = "I decided to write and host a twitter bot for fun on my own server, using a Raspberry Pi, for a friend's twitter account. That bot has over a hundred thousand followers now. The success of that bot led me to make my own more sophisticated bot called What Song Is That? It takes requests from users who wish to know what song is playing in a tweet, queries Shazam's API on their behalf and displays its findings cleanly on a website I made for it. Check out <a style=\"text-decoration:none; color:salmon;\" href=\"https://alanmun.github.io/WhatSongIsThat\" target=\"_blank\">whatsong.page</a> for more information.";

		this.rotationVector = new THREE.Vector3(0, 0, 0.002);

		// * Create the close up world for twitter
		this.setCloseUp(new THREE.Group());
		let twitterCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let twitterCloseUpMat = new THREE.MeshStandardMaterial({ color: 0x3fbcff, metalness: .4 })
		twitterCloseUpMat.side = THREE.BackSide
		this.planeCurve(twitterCloseUpGeo, 4)
		//let testTwitterCloseUpGeo = new THREE.WireframeGeometry(twitterCloseUpGeo)
		let twitterCloseUpMesh = new THREE.Mesh(
			twitterCloseUpGeo,
			twitterCloseUpMat
		)
		twitterCloseUpMesh.rotation.x += THREE.MathUtils.DEG2RAD * 90
		twitterCloseUpMesh.rotation.z += THREE.MathUtils.DEG2RAD * 90
		//twitterCloseUpMesh.material.depthTest = false //Allow others to occlude our world
		this.entityCloseUp.add(twitterCloseUpMesh);

		this.makeWings();

		this.addTree(-9, 6, -4.75, 0x7796c9);
		this.addTree(-12, 6, -5.25, 0x6588c2);
		this.addTree(-11, 6, -4.5, 0x6588c2);
		this.addTree(-9, 6, 5.05, 0x537abb);
		this.addTree(-20.2, 4.8, 10.05, 0x7796c9);
		this.addTree(-22.3, 4.8, 10.05, 0x37568a);
		this.addTree(-19.9, 4.5, 11.25, 0x37568a);
		this.addTree(-24.4, 4, 13.05, 0x37568a);

		// loadingManager.onLoad = () => {
		//     //Now that we are sure everything is loaded, add these models to their worlds
		// 	console.log(pond, fox, moose, grass);
		// 	//twitterCloseUp.add(workstation)
		// };
	}

	//Creates the left and right wings on the twitter world, adds them to the overall close up twitter group
	private makeWings() {
		//Create and define the wings
		let tLeftWing = new THREE.Shape();
		let tRightWing = new THREE.Shape();
		tLeftWing.moveTo(80, 20);
		tLeftWing.lineTo(40, 80);
		tLeftWing.lineTo(80, 80);
		tLeftWing.lineTo(80, 20);
		tRightWing.moveTo(80, 20);
		tRightWing.lineTo(40, 80);
		tRightWing.lineTo(80, 80);
		tRightWing.lineTo(80, 20);

		//l and r wing geometry
		let tLeftWingGeo = new THREE.ExtrudeGeometry(tLeftWing, {
			depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1
		});
		let tRightWingGeo = new THREE.ExtrudeGeometry(tRightWing, {
			depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1
		});

		//l and r wing meshes
		let tLeftWingMesh = new THREE.Mesh(
			tLeftWingGeo,
			new THREE.MeshStandardMaterial({ color: 0x3372d6, metalness: .4 })
		);
		let tRightWingMesh = new THREE.Mesh(
			tRightWingGeo,
			new THREE.MeshStandardMaterial({ color: 0x3372d6, metalness: .4 })
		);

		//Scale both
		tLeftWingMesh.scale.set(1, 1.75, 1)
		tRightWingMesh.scale.set(1, 1.75, 1)

		//Set position and orientation of left wing
		tLeftWingMesh.position.set(-7, -95, 6)
		tLeftWingMesh.rotateX(THREE.MathUtils.DEG2RAD * 0)
		tLeftWingMesh.rotateY(THREE.MathUtils.DEG2RAD * 30)
		tLeftWingMesh.rotateZ(THREE.MathUtils.DEG2RAD * 60)

		//Set position and orientation of right wing
		tRightWingMesh.position.set(-7, -95, -6)
		tRightWingMesh.rotateX(THREE.MathUtils.DEG2RAD * 0)
		tRightWingMesh.rotateY(THREE.MathUtils.DEG2RAD * 330)
		tRightWingMesh.rotateZ(THREE.MathUtils.DEG2RAD * 60)

		//Add to twitterCloseUp
		this.entityCloseUp.add(tRightWingMesh);
		this.entityCloseUp.add(tLeftWingMesh)
	}
}