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

const VOXEL_SIZE = 2 // min 2
const VOXEL_RANGE = 4 // min 2
const TILE_SIZE = VOXEL_RANGE * VOXEL_SIZE
const TILE_RANGE = 4
const MAP_SIZE = TILE_SIZE * TILE_RANGE

const tileEngine = new TileEngine( MAP_SIZE, TILE_SIZE )
const gridStore = new Map()

const grid = tileEngine.getTileGrid()

for ( const tile of grid ) {

	const tileKey = tileEngine.tileToKey( ...tile )

	gridStore.set( tileKey, new Map() )
}

// GROUND

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry( TILE_SIZE * TILE_RANGE, TILE_SIZE * TILE_RANGE ).rotateX( - Math.PI / 2 ),
	new THREE.MeshStandardMaterial( { color: 0x202020 } )
)
ground.receiveShadow = true
scene.add( ground )

// PLACEHOLDER
const placeholder = new THREE.Mesh(
	new THREE.BoxGeometry( VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE ),
	new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true, color: 0x000000 } )
)
placeholder.visible = false
scene.add( placeholder )

//

const objects = [ ground ]

// LOAD INITIAL TILES

await loadInitialTiles()

// WEBSOCKET

const ws = new WebSocket( "ws://localhost:8080" )

// When the connection to the server is open
ws.onopen = () => {

	// console.log( "Connected to the server" )
}

// When a message is received from the server
ws.onmessage = event => {

	const { type, data } = JSON.parse( event.data )

	if ( type === "ATTACH" ) {

		const { voxel } = data

		const [ x, , z ] = voxel.position

		const tile = tileEngine.pointToTile( x, z )

		const tileKey = tileEngine.tileToKey( ...tile )

		const positionKey = Utils.voxelPositionToKey( voxel.position )

		const tileStore = gridStore.get( tileKey )

		tileStore.set( positionKey, voxel )

		attachVoxel( voxel )
	}
	else if ( type === "DETACH" ) {

		const { tileKey, positionKey } = data

		const tileStore = gridStore.get( tileKey )

		if ( !tileStore.has( positionKey ) ) {

			return
		}

		tileStore.delete( positionKey )

		for ( const object of objects ) {

			if ( object.userData.positionKey === positionKey ) {

				scene.remove( object )
				objects.splice( objects.indexOf( object ), 1 )

				break
			}
		}
	}
}

// When the connection to the server is closed
ws.onclose = () => {

	// console.log( "Disconnected from the server" )
}

// When an error occurs
ws.onerror = error => {

	// console.error( "Error occurred:", error )
}

// HELPERS

scene.add( Utils.buildGrid( tileEngine, grid, 0x303030 ) )
scene.add( new THREE.AxesHelper( 512 ) )

//

let mode = "controls"
let color = "16777215"

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

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

// COLORS

const colorButtons = document.querySelectorAll( "#colors button" )

for ( const button of colorButtons ) {

	button.addEventListener( "click", () => {

		color = button.dataset.color - 0
	} )
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

				const { position } = intersect.object

				const { x, z } = position

				const tile = tileEngine.pointToTile( x, z )
				const tileKey = tileEngine.tileToKey( ...tile )
				const positionKey = Utils.voxelPositionToKey( [ ...position ] )

				const tileStore = gridStore.get( tileKey )

				if ( !tileStore.has( positionKey ) ) {

					return
				}

				tileStore.delete( positionKey )

				const serialized = Utils.serializeTileStore( tileStore, false )

				// console.clear()
				// console.log( tileKey )
				// console.log( serialized )

				//

				scene.remove( intersect.object )
				objects.splice( objects.indexOf( intersect.object ), 1 )

				// Notify

				ws.send( JSON.stringify( {
					type: "DETACH",
					data: {
						tileKey,
						position: [ ...position ],
						positionKey,
					},
				} ) )
			}
		}
		else if ( mode === "attach" ) {

			const position = new THREE.Vector3()
			.copy( intersect.point )
			.add( intersect.face.normal )
			.divideScalar( VOXEL_SIZE )
			.floor()
			.multiplyScalar( VOXEL_SIZE )
			.addScalar( VOXEL_SIZE / 2 )

			const { x, z } = position

			const tile = tileEngine.pointToTile( x, z )
			const tileKey = tileEngine.tileToKey( ...tile )
			const positionKey = Utils.voxelPositionToKey( [ ...position ] )

			const tileStore = gridStore.get( tileKey )

			if ( tileStore.has( positionKey ) ) {

				return
			}

			const voxel = {
				position: [ ...position ],
				color: color,
			}

			tileStore.set( positionKey, voxel )

			const serialized = Utils.serializeTileStore( tileStore, false )

			// console.clear()
			// console.log( tileKey )
			// console.log( serialized )

			//

			attachVoxel( voxel )

			// Notify

			ws.send( JSON.stringify( {
				type: "ATTACH",
				data: {
					voxel,
				},
			} ) )
		}
	}
} )

function attachVoxel( voxel ) {

	const geometry = new THREE.BoxGeometry( VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE )
	const material = new THREE.MeshPhongMaterial( { transparent: true, flatShading: true, color: voxel.color } )
	const object = new THREE.Mesh( geometry, material )
	object.position.copy( new THREE.Vector3( ...voxel.position ) )
	object.castShadow = true
	object.receiveShadow = true
	object.userData.positionKey = Utils.voxelPositionToKey( [ ...voxel.position ] )
	scene.add( object )

	objects.push( object )
}

async function loadInitialTiles() {

	for await ( const tile of grid ) {

		const tileKey = tileEngine.tileToKey( ...tile )

		const voxels = await ( await fetch( `/tiles/${ tileKey }.json` ) ).json()

		for ( const voxel of voxels ) {

			const positionKey = Utils.voxelPositionToKey( voxel.position )

			const tileStore = gridStore.get( tileKey )

			tileStore.set( positionKey, voxel )

			attachVoxel( voxel )
		}
	}
}
