import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"

const canvas = document.getElementById( "gl" )
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1_000 )
camera.position.set( 20, 20, 20 )
camera.lookAt( 0, 0, 0 )
const controls = new MapControls( camera, canvas )
controls.enableDamping = true
controls.zoomToCursor = true
const renderer = new THREE.WebGLRenderer( { canvas } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )

window.addEventListener( "resize", () => {

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize( window.innerWidth, window.innerHeight )
} )

renderer.setAnimationLoop( () => {

	controls.update()
	renderer.render( scene, camera )
} )

//

scene.add( new THREE.GridHelper( 10, 10, 0x404040, 0x202020 ) )
scene.add( new THREE.AxesHelper( 1_000 ) )
