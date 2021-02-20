import * as THREE from './node_modules/three/build/three.module.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //FOV, aspect ratio (ratio of your resolution), 
																								  //nearest thing to render, farest thing to render
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1); //, height, length
var material = new THREE.MeshBasicMaterial({ color: 0x43aee8 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 1;
camera.position.y = 1;

function render() {
  requestAnimationFrame(render);
  cube.rotation.z += 0.025;
  cube.rotation.y += 0.025;
  cube.rotation.x += 0.025;
  renderer.render(scene, camera);
}
render();