import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as THREE from 'three'

class App extends Component {
	componentDidMount() {

		//three.js init
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
		const renderer = new THREE.WebGLRenderer({
				canvas: document.querySelector('#bg') as HTMLCanvasElement,
		})
		renderer.setPixelRatio(window.devicePixelRatio) //
		renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
		camera.position.z = 30 //Move camera back so its not in center of scene
		document.body.appendChild(renderer.domElement); //Add renderer to the dom, which is responsible for drawing camera and scene

		//define some Geometry
		const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
		const material = new THREE.MeshBasicMaterial({color: 0xFF6347, wireframe: true});
		const torus = new THREE.Mesh(geometry, material);
		scene.add(torus)

		//three.js "game" loop
		function animate(){
			requestAnimationFrame(animate)
			//Do stuff in here
			renderer.render(scene, camera);
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
