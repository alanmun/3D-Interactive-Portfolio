import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import * as THREE from 'three'

function App() {
  //const [count, setCount] = useState(0)

  /*const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
  })
  renderer.setPixelRatio(window.devicePixelRatio) //
  renderer.setSize(window.innerWidth, window.innerHeight) //Fullscreen
  camera.position.z = 30 //Move camera back so its not in center of scene

  renderer.render(scene, camera)*/

  return (
    <>
      <p>hello</p>
      <canvas id="bg"></canvas>
    </>
  )
}

export default App
