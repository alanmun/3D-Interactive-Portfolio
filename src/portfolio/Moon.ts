import { CelestialEntity } from "./CelestialEntity";
import * as THREE from 'three';
import moonTexturePath from './assets/moon.jpg?url'
import moonNormalPath from './assets/moonbumpmap.jpg?url'

export class Moon extends CelestialEntity {

    constructor(orbitalRadius: number, entityMesh: THREE.Mesh, loadManager: THREE.LoadingManager){
        super('moon', orbitalRadius, entityMesh);

        //Set rotation values for every tick
        this.rotationVector = new THREE.Vector3(0.001, 0.001, 0);

        //Texture and model loading for various worlds
		let moonTexture = new THREE.TextureLoader(loadManager).load(moonTexturePath);
		let moonNormal = new THREE.TextureLoader(loadManager).load(moonNormalPath);

        this.setGeoAndMat(
			new THREE.SphereGeometry(6, 64, 64),
			new THREE.MeshStandardMaterial({map: moonTexture, normalMap: moonNormal})
		);

        // * Create the close up world for moon
		let moonCloseUp = new THREE.Group();
		let moonCloseUpGeo = new THREE.PlaneGeometry(64, 64, 128, 128)
		let moonCloseUpMat = new THREE.MeshStandardMaterial({map: moonTexture, normalMap: moonNormal})
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