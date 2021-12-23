import * as THREE from 'three'

export module Debug {
    export let mode:boolean = false //Set to true to enable dev mode
    let orientationSensitivity = 0.1 //How fine to tune the entity's orientation
    let positionSensitivity = 0.5 //How fine to tune the entity's position

    export function debuggerKeys(object:THREE.Object3D, keyCode:number){
        if(!mode) return

        switch(keyCode){
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

    export function adjSens(sign:number){
        if(!mode) return

        positionSensitivity += (0.1 * sign)
        orientationSensitivity += (0.01  * sign)
        console.log(`Positional sensitivity is now ${positionSensitivity}. \n Orientational sensitivity is now ${orientationSensitivity}`)
    }

    export function xPos(object:THREE.Object3D){
        if(!mode) return

        object.position.x += positionSensitivity
        console.log(object.position)
    }
    export function xMin(object:THREE.Object3D){
        if(!mode) return

        object.position.x -= positionSensitivity
        console.log(object.position)
    }

    export function yPos(object:THREE.Object3D){
        if(!mode) return

        object.position.y += positionSensitivity
        console.log(object.position)
    }
    export function yMin(object:THREE.Object3D){
        if(!mode) return

        object.position.y -= positionSensitivity
        console.log(object.position)
    }

    export function zPos(object:THREE.Object3D){
        if(!mode) return

        object.position.z += positionSensitivity
        console.log(object.position)
    }
    export function zMin(object:THREE.Object3D){
        if(!mode) return

        object.position.z -= positionSensitivity
        console.log(object.position)
    }
}