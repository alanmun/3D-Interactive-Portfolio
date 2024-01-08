import * as THREE from 'three'
import { CelestialEntity } from './CelestialEntity';
import { UniverseBuilder } from './main';

export module Debug {
  export let enabled: boolean = true; //Set to true to enable dev enabled
  let shouldOverrideSceneMaterial: boolean = false; //Makes everything green
  let orientationSensitivity = 0.1 //How fine to tune the entity's orientation
  let positionSensitivity = 0.5 //How fine to tune the entity's position

  // * Debugging initialization stuff that doesn't depend on texture/model loading to complete
  export function debugInit(scene: THREE.Scene){
    if(shouldOverrideSceneMaterial) scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: 'green'});
    if(enabled){ // * GridHelper creates a giant plane to help you anchor yourself
      const gH = new THREE.GridHelper(200, 50)
			gH.name = "gridhelper"
			scene.add(gH)
    }
  }

  //* Used to instantly visit close up worlds when finishing loading
  export function debugCloseUpWorld(ub: UniverseBuilder, world: CelestialEntity) {
    ub.uc.cameraLock = {
      isLocked: true,
      entity: world,
      target: world.entity
    }
    ub.changeWorld(world, false)
    ub.uc.shouldPinCamera = true
  }

  export function debuggerKeys(object: THREE.Object3D, keyCode: number) {
    if (!enabled) return

    switch (keyCode) {
      case 37:
        object.position.x -= 1;
        console.log('Lowered x:', object.position)
        break;
      case 38:
        object.position.y += 1;
        console.log('Raised y:', object.position)
        break;
      case 39:
        object.position.x += 1;
        console.log('Raised x:', object.position)
        break;
      case 40:
        object.position.y -= 1;
        console.log('Lowered y:', object.position)
        break;
      // case 35: //END key
      //   break;
      case 78: //N key
        object.rotation.y += 0.1
        console.log(object.rotation)
        break
      case 77: //M key
        object.rotation.y -= 0.1
        console.log(object.rotation)
        break
      case 74: //J key
        object.rotation.x += 0.1
        console.log(object.rotation)
        break
      case 75: //K key
        object.rotation.x -= 0.1
        console.log(object.rotation)
        break
      case 85: //U key
        object.rotation.z += 0.1
        console.log(object.rotation)
        break
      case 73: //I key
        object.rotation.z -= 0.1
        console.log(object.rotation)
        break
      case 98: //KP2
        Debug.yMin(object)
        break
      case 101: //KP5
        Debug.yPos(object)
        break
      case 99: //KP3
        Debug.zMin(object)
        break
      case 102: //KP6
        Debug.zPos(object)
        break
      case 104: //KP8
        Debug.xMin(object)
        break
      case 105: //KP9
        Debug.xPos(object)
        break
      case 107: //KP Add
        Debug.adjSens(1)
        break
      case 109: //KP Subtract
        Debug.adjSens(-1)
        break
      default:
        break
    }
  }

  export function adjSens(sign: number) {
    if (!enabled) return

    positionSensitivity += (0.1 * sign)
    orientationSensitivity += (0.01 * sign)
    console.log(`Positional sensitivity is now ${positionSensitivity}. \n Orientational sensitivity is now ${orientationSensitivity}`)
  }

  export function xPos(object: THREE.Object3D) {
    if (!enabled) return;

    object.position.x += positionSensitivity
    console.log(object.position);
  }
  export function xMin(object: THREE.Object3D) {
    if (!enabled) return;

    object.position.x -= positionSensitivity
    console.log(object.position);
  }

  export function yPos(object: THREE.Object3D) {
    if (!enabled) return;

    object.position.y += positionSensitivity
    console.log(object.position);
  }
  export function yMin(object: THREE.Object3D) {
    if (!enabled) return;

    object.position.y -= positionSensitivity;
    console.log(object.position);
  }

  export function zPos(object: THREE.Object3D) {
    if (!enabled) return

    object.position.z += positionSensitivity;
    console.log(object.position);
  }
  export function zMin(object: THREE.Object3D) {
    if (!enabled) return;

    object.position.z -= positionSensitivity;
    console.log(object.position);
  }
}