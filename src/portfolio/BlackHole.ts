import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';
import { vShader, fShader } from "./atmosphericGlowShader"

export class BlackHole extends CelestialEntity {

	tick: number = 0;

	constructor(entityMesh: THREE.Mesh, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
		super('blackhole', 0, entityMesh);

		this.setGeoAndMat(
			new THREE.SphereGeometry(6, 128, 128),
			//new THREE.MeshStandardMaterial({ color: "black", roughness: 0, metalness: 1, flatShading: false})
			new THREE.ShaderMaterial({
				uniforms: {
					glowColor: {
						value: new THREE.Vector3(0.1, 0.1, 0.1) //Color is overwritten by reverberate function
					},
					"p": {
						value: 6
					},
					"c": {
						value: 0.25
					},
					viewVector: { value: camera.position }
				},
				vertexShader: vShader,
				fragmentShader: fShader,
				side: THREE.BackSide,
				blending: THREE.AdditiveBlending,
				transparent: true
			})
		);

		let blackHoleCore = new THREE.Mesh(
			new THREE.SphereGeometry(4.75, 128, 128), //Was 4.75 in radius
			new THREE.MeshPhysicalMaterial({ color: "black", clearcoat: 0, side: THREE.DoubleSide }), //clearcoat 0 prevents light shine mark on it from distant sun
		);
		blackHoleCore.name = "blackholecore";
		scene.add(blackHoleCore);
		scene.add(this.entity);
	}

	public reverberate() {
		// let scaleVary = Math.sin(tick) * 0.02 + 1 //This scales the size of the black hole from 98% to 102%
		// this.entity.scale.set(scaleVary, scaleVary, scaleVary)

		let vary = Math.sin(this.tick) * 0.5 + 0.5 //Convert -1.0-1.0 to 0.0-1.0
		const c1 = new THREE.Color("#BAD1FF")
		const c2 = new THREE.Color("#FFFFFF")
		this.entity.material.uniforms.glowColor.value = c1.lerp(c2, vary)

		let randIncPick = THREE.MathUtils.randInt(1, 10)
		let inc: number = randIncPick > 8 ? 0.4 : 0
		this.tick += inc;
	}
}