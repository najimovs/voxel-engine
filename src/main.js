import * as THREE from "three"

import { TileEngine } from "@lib/core/TileEngine"
import { setupScene } from "@app/setup-scene"
import * as Utils from "@app/Utils"
import * as MathUtils from "@app/MathUtils"

// SETUP

const { canvas, scene, camera, controls, renderer } = setupScene( {
	canvas: document.getElementById( "gl" ),
} )

// TILE ENGINE

const VOXEL_SIZE = 4 // min 2
const VOXEL_RANGE_TILE = 4 // min 2
const TILE_SIZE = VOXEL_RANGE_TILE * VOXEL_SIZE
const TILE_RANGE = 2
const MAP_SIZE = TILE_SIZE * TILE_RANGE

const tileEngine = new TileEngine( MAP_SIZE, TILE_SIZE )

// PLACEHOLDER
const placeholder = new THREE.Mesh(
	new THREE.BoxGeometry( VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE ),
	new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true, color: 0x000000 } )
)
placeholder.visible = false
scene.add( placeholder )

// GROUND

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry( TILE_SIZE * TILE_RANGE, TILE_SIZE * TILE_RANGE ).rotateX( - Math.PI / 2 ),
	new THREE.MeshStandardMaterial( { color: 0x202020 } )
)
ground.receiveShadow = true
scene.add( ground )

// HELPERS

scene.add( Utils.buildGrid( tileEngine, 0x303030 ) )
scene.add( new THREE.AxesHelper( 512 ) )

//

let mode = "controls"

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const objects = [ ground ]

// UI

const modeButtons = document.querySelectorAll( "nav button" )

for ( const button of modeButtons ) {

	button.addEventListener( "click", () => {

		mode = button.dataset.mode

		onModeChange()
	} )
}

function onModeChange() {

	if ( mode === "controls" ) {

		controls.enablePan = true

		placeholder.visible = false
	}
	else {

		controls.enablePan = false

		placeholder.visible = true
	}
}

canvas.addEventListener( "pointermove", e => {

	if ( mode === "controls" ) {

		return
	}

	pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 )

	raycaster.setFromCamera( pointer, camera )

	const intersects = raycaster.intersectObjects( objects, false )

	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ]

		placeholder.position.copy( intersect.point ).add( intersect.face.normal )
		placeholder.position.divideScalar( VOXEL_SIZE ).floor().multiplyScalar( VOXEL_SIZE ).addScalar( VOXEL_SIZE / 2 )
	}
} )

canvas.addEventListener( "pointerdown", e => {

	if ( mode === "controls" || e.which === 3 ) {

		return
	}

	pointer.set( ( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1 )

	raycaster.setFromCamera( pointer, camera )

	const intersects = raycaster.intersectObjects( objects, false )

	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ]

		if ( mode === "detach" ) {

			if ( intersect.object !== ground ) {

				scene.remove( intersect.object )

				objects.splice( objects.indexOf( intersect.object ), 1 )
			}
		}
		else if ( mode === "attach" ) {

			const geometry = new THREE.BoxGeometry( VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE )
			const material = new THREE.MeshPhongMaterial( { transparent: true, flatShading: true, color: 0xffffff * Math.random() } )
			const object = new THREE.Mesh( geometry, material )
			object.position.copy( intersect.point ).add( intersect.face.normal )
			object.position.divideScalar( VOXEL_SIZE ).floor().multiplyScalar( VOXEL_SIZE ).addScalar( VOXEL_SIZE / 2 )
			object.castShadow = true
			object.receiveShadow = true
			scene.add( object )

			objects.push( object )
		}
	}
} )
