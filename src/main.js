import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import Stats from "three/addons/libs/stats.module.js"

import { TileEngine } from "@lib/core/TileEngine"

const canvas = document.getElementById( "gl" )
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2_000 )
camera.position.set( 0, 1_000, 0 )
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

const TILE_SIZE = 8
const COL_SIZE = 256
const MAP_SIZE = TILE_SIZE * COL_SIZE

const tileEngine = new TileEngine( MAP_SIZE, TILE_SIZE, 16, 8 )

// GRID

const grid = tileEngine.getTileGrid()

const grid3D = new THREE.Object3D()
scene.add( grid3D )

for ( const tile of grid ) {

	const [ minX, minZ, maxX, maxZ ] = tileEngine.tileToBBox( ...tile )

	const vertices = [
		minX, 0, minZ,
		maxX, 0, minZ,
		maxX, 0, maxZ,
		minX, 0, maxZ,
	]

	const geometry = new THREE.BufferGeometry()
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
	const material = new THREE.LineBasicMaterial( { color: 0x202020 } )
	const object = new THREE.LineLoop( geometry, material )
	grid3D.add( object )
}
