import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Color, MathUtils } from 'three';
import { randFloat } from 'three/src/math/MathUtils'

let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGLRenderer;
let spaceTexture: THREE.Texture;

function onLoad(){
	console.log("Texture is loaded now")
	scene.background = spaceTexture
}

class App extends Component {

	addStar(){
		const starGeo = new THREE.SphereGeometry(0.25, 24, 24)
		const starMat = new THREE.MeshStandardMaterial({color: new Color("white")})
		const star = new THREE.Mesh(starGeo, starMat)

		let x,y,z;
		let xIsNeg, yIsNeg, zIsNeg
		xIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		yIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		zIsNeg = (THREE.MathUtils.randInt(0, 1) == 0) ? -1:1
		const outerBound = 200

		if(xIsNeg == -1) x = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else x = THREE.MathUtils.randFloat(15, outerBound)
		if(yIsNeg == -1) y = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else y = THREE.MathUtils.randFloat(15, outerBound)
		if(zIsNeg == -1) z = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else z = THREE.MathUtils.randFloat(15, outerBound)

		star.position.set(x, y, z);
		scene.add(star)
	}

	addPlanet(pos: THREE.Vector3, size: number, texture: any, bumpMap: any, metalness: number){

		const celestialEntity = new THREE.Mesh(
			new THREE.SphereGeometry(size, 128, 128),
			new THREE.MeshStandardMaterial({map: texture, metalness: metalness})
		)
		celestialEntity.material.normalMap = bumpMap
		if(texture == null) celestialEntity.material.color = new Color("black") //if there is a texture, color covers over it
		celestialEntity.position.set(pos.x, pos.y, pos.z)
		scene.add(celestialEntity)
		return celestialEntity
	}

	//Adjust the orbit of an entity, distance specifies how far away and theta is what degree it is with respect to what it orbits
	adjustOrbit(entity: THREE.Mesh, distance: number, theta: number, phi: number) {
		/*
		(0,r) ends up at x = rsin(Theta), y = rcos(Theta) for a circle

		For a sphere:
		x = ρsin(ϕ)cos(θ)
		y = ρsin(ϕ)sin(θ)
		z = ρcos(ϕ)
		ρ = r/sin(ϕ)
		*/
		const alpha = 0.005
		entity.position.x = distance*Math.sin(theta)
		entity.position.y = distance*Math.cos(theta)
		//entity.position.z = distance*Math.sin(theta)
		theta += (0.0025 / (alpha*distance)) //orbiting speed is a function of distance from celestial mass
		if(theta >= 360) theta = 0

		return theta

		// const alpha = 0.005
		// const p = distance/Math.sin(phi)
		// entity.position.x = p * Math.sin(phi) * Math.cos(theta)
		// entity.position.y = p * Math.sin(phi) * Math.sin(theta)
		// entity.position.z = p * Math.cos(phi)

		// phi += (0.0025 / (alpha*distance)) //orbiting speed is a function of distance from celestial mass
		// theta += (0.0025 / (alpha*distance)) //orbiting speed is a function of distance from celestial mass
		// if(phi >= 360) phi = 0
		// if(theta >= 360) theta = 0

		// return new Array(theta, phi)
	}

	componentDidMount() {

		let debug = false

		//three.js init
		scene = new THREE.Scene();
		spaceTexture = new THREE.TextureLoader().load('src/pillarsofcreation.jpg', onLoad)
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
		renderer = new THREE.WebGLRenderer({
				canvas: document.querySelector('#bg') as HTMLCanvasElement,
		})
		renderer.setPixelRatio(window.devicePixelRatio) //
		renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
		camera.position.z = 120 //Move camera back so its not in center of scene
		document.body.appendChild(renderer.domElement); //Add renderer to the dom, which is responsible for drawing camera and scene

		//define some Geometry
		const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
		const material = new THREE.MeshStandardMaterial({color: 0xFF6347, wireframe: false});
		const torus = new THREE.Mesh(geometry, material);
		scene.add(torus)

		//Add some light
		const pL = new THREE.PointLight(new Color("black"))
		const lH = new THREE.PointLightHelper(pL)
		pL.position.set(5,5,5)
		scene.add(pL)
		if(debug) scene.add(lH)

		const aL = new THREE.AmbientLight(new Color("white"))
		scene.add(aL)

		//GridHelper
		const gH = new THREE.GridHelper(200, 50)
		if(debug) scene.add(gH)

		//Move around in the scene with your mouse!
		const controls = new OrbitControls(camera, renderer.domElement);

		//Populate the universe
		Array(500).fill(0).forEach(this.addStar)
		let blackHole = this.addPlanet(new THREE.Vector3(0, 0, 0), 9, null, null, 1.0)
		const moonTexture = new THREE.TextureLoader().load('src/moon.jpg')
		const moonBump = new THREE.TextureLoader().load('src/moonbumpmap.jpg')
		let moon = this.addPlanet(new THREE.Vector3(0, 0, 0), 18, moonTexture, moonBump, 0.0)
		//let moon2 = this.addPlanet(new THREE.Vector3(25, 25, 30), 27, moonTexture, null, 0.0)
		const ce = new THREE.Mesh(
			new THREE.SphereGeometry(27, 64, 64),
			new THREE.MeshStandardMaterial({map: moonTexture, normalMap: moonBump, metalness: 0})
		)
		ce.position.set(25, 25, 30)
		scene.add(ce)
		
		console.log(moon.material.normalMap)
		
		let thetaDonut: number = 0 //degrees
		let phiDonut = 0
		let thetaMoon: number = 90
		let phiMoon = 0

		//three.js "game" loop
		const animate = () =>{
			requestAnimationFrame(animate)

			
			thetaDonut = this.adjustOrbit(torus, 100, thetaDonut, phiDonut)
			thetaMoon = this.adjustOrbit(moon, 150, thetaMoon, phiMoon)
			// var arr1 = this.adjustOrbit(torus, 100, thetaDonut, phiDonut)
			// var arr2 = this.adjustOrbit(moon, 150, thetaMoon, phiMoon)

			// thetaDonut = arr1[0]
			// phiDonut = arr1[1]
			// thetaMoon = arr2[0]
			// phiMoon = arr2[1]

			torus.rotation.z += 0.001
			torus.rotation.x += 0.01
			torus.rotation.y += 0.005

			//moon.rotation.z += 0.001
			moon.rotation.x += 0.001
			moon.rotation.y += 0.001

			controls.update()
			
			renderer.render(scene, camera);
		}

		animate()
	}

	render() {
		return (
			<canvas id="bg"></canvas>
		)
	}
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
)
