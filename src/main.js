import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import Stats from "three/addons/libs/stats.module.js"

import { TileEngine } from "@lib/core/TileEngine"
import * as Utils from "@app/Utils"

const canvas = document.getElementById( "gl" )
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 2_000 )
camera.position.set( 0, 256, 0 )
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

const stats = new Stats()
document.body.insertBefore( stats.dom, document.body.firstElementChild )

renderer.setAnimationLoop( () => {

	controls.update()
	renderer.render( scene, camera )
	stats.update()
} )

//

const TILE_SIZE = 16
const COL_SIZE = 16
const MAP_SIZE = TILE_SIZE * COL_SIZE

const tileEngine = new TileEngine( MAP_SIZE, TILE_SIZE )

// GRID

scene.add( Utils.buildGrid( tileEngine ) )

//

scene.add( new THREE.AxesHelper( 1_024 ) )
