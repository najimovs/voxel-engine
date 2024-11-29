import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import Stats from "three/addons/libs/stats.module.js"

import { TileEngine } from "@lib/core/TileEngine"
import * as Utils from "@app/Utils"

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

// HELPERS

scene.add( Utils.buildGrid( tileEngine, 0x202020 ) )
scene.add( new THREE.AxesHelper( 512 ) )
