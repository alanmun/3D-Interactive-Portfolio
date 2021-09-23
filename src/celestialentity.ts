import * as THREE from 'three'

export class CelestialEntity {
    isGroup: boolean = false
    distance: number = 0
	tilt: number = THREE.MathUtils.randInt(-70, 10)
    theta: number = THREE.MathUtils.randFloat(0.0, 6.28318530718) //When a CE is made, give it a theta at random between 0 and 2pi
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
		this.entityCloseUp.name = this.entity.name + " close" //ex "twitter close"
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

		const alpha = 0.15; //Decrease to speed up, a good "realistic" value is above 0.1

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

	//Randomly generates trees for a given CE's close up world.
	// TODO: Add collision checking and prevent trees from being, say, within a cone diameter of each other?
	// TODO: Add a biasing that makes trees prefer the edges of the close up world
	addTree(){
		const trunkHeight = THREE.MathUtils.randFloat(0.5, 1);
		const trunkRadius = 0.1
		const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 12);
		const trunkMaterial = new THREE.MeshPhongMaterial({color: 'brown'});

		const topGeometry = new THREE.ConeGeometry(
				4*trunkRadius, 2*trunkHeight, 12);
		const topMaterial = new THREE.MeshPhongMaterial({color: 'green'});
		const root = new THREE.Object3D()
		root.add(new THREE.Mesh(
			trunkGeometry,
			trunkMaterial
		))
		const top = new THREE.Mesh(
			topGeometry,
			topMaterial
		)
		top.position.y = (3*trunkHeight)/2
		root.add(top)

		//Perform final rotation and position adjustments to make sure tree spawns sensibly

		root.position.x -= THREE.MathUtils.randFloat(7, 15)
		root.position.y += 6
		root.position.z -= THREE.MathUtils.randFloat(-6, 6.75)
		// root.rotation.x -= THREE.MathUtils.DEG2RAD * 90 //This flips the tree so that it faces upwards and any future rotations affect it properly
		// root.position.y -= THREE.MathUtils.randInt(-12, 12) //Due to position being messed up when a child of a group, this is actually what z does
		// root.position.z -= 5 //And this is moving up and down, inversed. So lowering z is increasing its position in the y direction in world space
		// console.log(root.position)
		// console.log(new THREE.Vector3().setFromMatrixPosition(root.matrixWorld))
		
		this.entityCloseUp.add(root)
	}

	reverberate(tick: number){
		if(this.entity.name == "blackhole"){
			// let scaleVary = Math.sin(tick) * 0.02 + 1 //This scales the size of the black hole from 98% to 102%
			// this.entity.scale.set(scaleVary, scaleVary, scaleVary)

			let vary = Math.sin(tick) * 0.5 + 0.5 //Convert -1.0-1.0 to 0.0-1.0
			const c1 = new THREE.Color("#BAD1FF")
			const c2 = new THREE.Color("#FFFFFF")
			this.entity.material.uniforms.glowColor.value = c1.lerp(c2, vary)

			let inc: number
			let randIncPick = THREE.MathUtils.randInt(1, 10)
			if(randIncPick > 8) inc = 0.4 //THREE.MathUtils.randFloat(0.1, 0.3)
			else inc = 0
			return tick + inc
		}
		return 0
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