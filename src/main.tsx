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
const CAM_START = {
	x: 0,
	y: -50,
	z: 120
}
let assetsLoaded = 0
const numAssets = 3

function onTextureLoad(){
	console.log("Texture is loaded now")
	assetsLoaded++
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
		const outerBound = 300

		if(xIsNeg == -1) x = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else x = THREE.MathUtils.randFloat(15, outerBound)
		if(yIsNeg == -1) y = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else y = THREE.MathUtils.randFloat(15, outerBound)
		if(zIsNeg == -1) z = THREE.MathUtils.randFloat(0, -1 * outerBound)
		else z = THREE.MathUtils.randFloat(15, outerBound)

		star.position.set(x, y, z);
		scene.add(star)
	}

	addCelestialEntity(pos: THREE.Vector3, size: number, texture: any, bumpMap: any, metalness: number){

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
		let scrollMode = false

		scene = new THREE.Scene(); //Instantiate the scene

		//Start loading in any textures
		let spaceTexture = new THREE.TextureLoader().loadAsync('src/pillarsofcreation.jpg', onTextureLoad)
		spaceTexture.then(value => {
			console.log("space texture loaded")
			scene.background = value
		})

		let moonTexture = new THREE.TextureLoader().load('src/moon.jpg')
		let moonNormal = new THREE.TextureLoader().load('src/moonbumpmap.jpg')

		//Instantiate and set up camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
		camera.position.z = CAM_START.z //Move camera back so its not in center of scene
		camera.position.y = CAM_START.y //Move camera back so its not in center of scene

		//Instantiate and set up renderer
		renderer = new THREE.WebGLRenderer({
				canvas: document.querySelector('#bg') as HTMLCanvasElement,
		})
		renderer.setPixelRatio(window.devicePixelRatio) //
		renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
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
		let controls: OrbitControls
		if(!scrollMode) controls = new OrbitControls(camera, renderer.domElement);

		//Populate the universe
		Array(500).fill(0).forEach(this.addStar) //with stars

		let blackHole = this.addCelestialEntity(new THREE.Vector3(0, 0, 0), 9, null, null, 1.0) //with a black hole so massive everything orbits around it

		let moon = this.addCelestialEntity(new THREE.Vector3(0, 0, 0), 18, moonTexture, moonNormal, 0.0) //with a moon!
		console.log(moon.material.map) //Neither of these are loaded at this point, yet map works fine.
		console.log(moon.material.normalMap)

		let thetaDonut: number = 0 //degrees
		let phiDonut = 0
		let thetaMoon: number = 90
		let phiMoon = 0

		//Tell the DOM to move our camera whenever the user scrolls
		function moveCamera() {
			const top = document.body.getBoundingClientRect().top //Find out the top of the user's viewport (screen basically)
			camera.position.z = (top * 0.05) + CAM_START.z
			//camera.position.x = top * -0.002
			camera.position.y = (top * -0.05) + CAM_START.y
			console.log("Top is now equal to " + top)
			console.log("Camera x: " + camera.position.x)
			console.log("Camera y: " + camera.position.y)
			console.log("Camera z: " + camera.position.z)
		}

		window.onscroll = moveCamera

		//three.js "game" loop
		const animate = () =>{
			requestAnimationFrame(animate)

			//ce.material.normalMap.needsUpdate = true

			
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

			if (debug) controls.update()
			
			renderer.render(scene, camera);
		}

		animate()
	}

	render() {
		return (
			<>
				<canvas id="bg"></canvas>
				<main>
					<header>
					<h1>Alan Munirji</h1>
					<p>Welcome to my portfolio!</p>
					</header>
			
					<blockquote>
					<p>I like making stuff and putting it on the internet</p>
					</blockquote>
			
					<section>
					<h2>📜 Manifesto</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
			
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
			
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					</section>
			
					<section className="light">
					<h2>👩🏽‍🚀 Projects</h2>
			
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
			
					<h2>🏆 Accomplishments</h2>
			
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
			
					</section>
			
					<blockquote>
					<p>"The best way out is always through."</p>
					<br></br>
					<br></br>
					<p>-Robert Frost</p>
					</blockquote>
			
					<section className="left">
					<h2>🌮 Work History</h2>
			
					<h3>McDonalds</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					<h3>Burger King</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					<h3>Taco Bell</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
					</p>
					</section>
			
					<blockquote>
					<p>Thank you for visiting my site!</p>
					</blockquote>
				</main>
			</>
		)
	}
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root') //Inject the above App Component into our root div in index.html
)
