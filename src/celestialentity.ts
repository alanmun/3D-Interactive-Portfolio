import * as THREE from 'three'

export class CelestialEntity {
    isGroup: boolean = false
    distance: number = 0
	tilt: number = THREE.MathUtils.randInt(-70, 10)
    theta: number = THREE.MathUtils.randFloat(0.0, 6.28318530718) //When a CE is made, give it a theta at random between 0 and 2pi
    //phi: number = THREE.MathUtils.randFloat(0.0, 6.28318530718) //Unused rn
	cameraIsAt: boolean = false //True if camera is currently at CE, false otherwise
    entity: any = null //THREE.Mesh representation of our CE. If CE is a group, this is the THREE.Group representation instead
	entityCloseUp: any = null //THREE.Mesh representation of our CE when we visit it close up

    constructor(name: string, isAGroup: boolean, distanceFromWhatItOrbits: number, alreadyMadeEntity: any=null){
        if(alreadyMadeEntity != null) this.entity = alreadyMadeEntity
		else{
			if(this.isGroup) this.entity = new THREE.Group()
			else this.entity = new THREE.Mesh()
		}
		
		this.entity.name = name
		this.isGroup = isAGroup
        this.distance = distanceFromWhatItOrbits
    }

	//Switch versions of celestial entity
	swapEntities(scene: THREE.Scene){
		if(this.cameraIsAt === false){
			scene.remove(this.entity)
			scene.add(this.entityCloseUp)
			this.cameraIsAt = true
		}
		else{
			scene.remove(this.entityCloseUp)
			scene.add(this.entity)
			this.cameraIsAt = false
		}
	}

    addMesh(geo: any, mat: any){
        if(this.isGroup){
            this.entity.add(new THREE.Mesh(geo, mat))
        }
        else{ //Treat it as a mesh
			this.entity.geometry = geo
            this.entity.material = mat
        }
    }

	setCloseUp(anEntity: any){
		//Not sure how close up versions of planets should work yet, so this function simply just sets to entityCloseUp for now
		this.entityCloseUp = anEntity
	}

	//Rotates the celestial entity by +=ing specified x, y, and z
	rotate(x: number, y: number, z: number){
		this.entity.rotation.x += x
		this.entity.rotation.y += y 
		this.entity.rotation.z += z
	}

    //Adjust the orbit of an entity, distance specifies how far away and theta is what degree it is with respect to what it orbits
	adjustOrbit() {
		let entityToMove
		if(this.cameraIsAt) entityToMove = this.entityCloseUp
		else entityToMove = this.entity

		const alpha = 0.07; //Decrease to speed up, a good value is 0.1

		//Circle calculation
		// entityToMove.position.x = this.distance*Math.cos(this.theta);
		// entityToMove.position.y = this.distance*Math.sin(this.theta);
		// entityToMove.position.z = this.distance*Math.cos(this.theta)
		// this.theta += (1 / (alpha*(this.distance**2))) //orbiting speed is a function of distance from celestial mass
		//console.log(this.theta)

		//Sphere calculation
		entityToMove.position.x = this.distance * Math.cos(this.theta);
		entityToMove.position.y = this.distance * Math.sin(this.theta);
		entityToMove.position.z = this.tilt * Math.sin(this.theta);

		//Orbit Debugging Code (generates a path of spheres so you can visually see orbits)
		// let test = new THREE.Mesh(
		// 	new THREE.SphereGeometry(1.5, 32, 32),
		// 	new THREE.MeshBasicMaterial({color: "purple"})
		// )
		// test.position.copy(entityToMove.position)
		// scene.add(test)
		// setTimeout(() => {
		// 	scene.remove(test)
		// }, 10000)

		//this.phi += (1 / (alpha*(this.distance**2))) 
		this.theta += (1 / (alpha*(this.distance**2))) //orbiting speed is a function of distance from celestial mass
	}

	//Setters
	setName(theName: string){
		this.entity.name = theName
	}

	//Getters
	getName(){
		return this.entity.name
	}
}