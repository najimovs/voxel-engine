import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import Stats from "three/addons/libs/stats.module.js"

import { TileEngine } from "@lib/core/TileEngine"
import * as Utils from "@app/Utils"
import * as MathUtils from "@app/MathUtils"

// SETUP

const canvas = document.getElementById( "gl" )
const scene = new THREE.Scene()
scene.fog = new THREE.Fog( 0x000000, 1, 512 )
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
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )

// LIGHTS

const dirLight = new THREE.DirectionalLight()
dirLight.position.set( 128, 512, 256 ).normalize()
scene.add( dirLight )

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
	const material = new THREE.MeshStandardMaterial( { color: 0x808080 } )
	const object = new THREE.Mesh( geometry, material )
	scene.add( object )
}

for ( let x = - ( TILE_SIZE * COL_SIZE ) / 2; x < ( TILE_SIZE * COL_SIZE ) / 2; x += 4 ) {

	for ( let z = - ( TILE_SIZE * COL_SIZE ) / 2; z < ( TILE_SIZE * COL_SIZE ) / 2; z += 4 ) {

		const voxelHeight = MathUtils.randInt( 5, 20 )

		const geometry = new THREE.BoxGeometry( 1, voxelHeight, 1 )
		const material = new THREE.MeshPhongMaterial()
		const object = new THREE.Mesh( geometry, material )
		object.position.set( x, voxelHeight / 2, z )
		scene.add( object )
	}
}

// HELPERS

scene.add( Utils.buildGrid( tileEngine, 0x000000 ) )
scene.add( new THREE.AxesHelper( 512 ) )
