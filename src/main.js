import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import Stats from "three/addons/libs/stats.module.js"

import { TileEngine } from "@lib/core/TileEngine"
import * as Utils from "@app/Utils"
import * as MathUtils from "@app/MathUtils"

// SETUP

const canvas = document.getElementById( "gl" )
const scene = new THREE.Scene()
// scene.fog = new THREE.Fog( 0x000000, 1, 512 )
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1_024 )
camera.position.set( 0, 256, 0 )
camera.lookAt( 0, 0, 0 )
const controls = new MapControls( camera, canvas )
controls.enableDamping = true
controls.zoomToCursor = true
controls.minDistance = 16
controls.maxDistance = 256
controls.maxTargetRadius = 256
controls.maxPolarAngle = Math.PI / 2 - 0.5
const renderer = new THREE.WebGLRenderer( { canvas } )
renderer.shadowMap.enabled = true
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )

// LIGHTS

const dirLight = new THREE.DirectionalLight()
dirLight.position.set( - 128, 128, - 128 );
dirLight.castShadow = true
dirLight.shadow.camera.top = 512
dirLight.shadow.camera.bottom = - 512
dirLight.shadow.camera.left = - 512
dirLight.shadow.camera.right = 512
dirLight.shadow.camera.near = 1
dirLight.shadow.camera.far = 512
dirLight.shadow.mapSize.width = 4096
dirLight.shadow.mapSize.height = 4096
scene.add( dirLight )

scene.add( new THREE.DirectionalLightHelper( dirLight ) )

const hemiLight = new THREE.HemisphereLight()
hemiLight.position.set( 0, 512, 0 )
scene.add( hemiLight )

// ON RESIZE

window.addEventListener( "resize", () => {

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize( window.innerWidth, window.innerHeight )
} )

// FPS MONITOR

const stats = new Stats()
document.body.insertBefore( stats.dom, document.body.firstElementChild )

// RENDER

renderer.setAnimationLoop( () => {

	controls.update()
	renderer.render( scene, camera )
	stats.update()
} )

// TILE ENGINE

const TILE_SIZE = 16
const COL_SIZE = 16
const MAP_SIZE = TILE_SIZE * COL_SIZE

const tileEngine = new TileEngine( MAP_SIZE, TILE_SIZE )

// WORLD

{
	const geometry = new THREE.PlaneGeometry( TILE_SIZE * COL_SIZE, TILE_SIZE * COL_SIZE ).rotateX( - Math.PI / 2 )
	const material = new THREE.MeshStandardMaterial( { color: 0xffffff } )
	const object = new THREE.Mesh( geometry, material )
	object.receiveShadow = true
	scene.add( object )
}

for ( let x = - ( TILE_SIZE * COL_SIZE ) / 2; x < ( TILE_SIZE * COL_SIZE ) / 2; x += 8 ) {

	for ( let z = - ( TILE_SIZE * COL_SIZE ) / 2; z < ( TILE_SIZE * COL_SIZE ) / 2; z += 8 ) {

		const voxelHeight = MathUtils.randInt( 1, 20 )

		const geometry = new THREE.BoxGeometry( 4, voxelHeight, 4 )
		const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } )
		const object = new THREE.Mesh( geometry, material )
		object.position.set( x, voxelHeight / 2, z )
		object.castShadow = true
		object.receiveShadow = true
		scene.add( object )
	}
}

// HELPERS

// scene.add( Utils.buildGrid( tileEngine, 0x000000 ) )
scene.add( new THREE.AxesHelper( 512 ) )
