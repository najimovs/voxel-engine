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
camera.position.set( 8, 16, 8 )
camera.lookAt( 0, 0, 0 )
const controls = new MapControls( camera, canvas )
controls.enabled = false
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
dirLight.shadow.mapSize.width = 8_192
dirLight.shadow.mapSize.height = 8_192
scene.add( dirLight )

// scene.add( new THREE.DirectionalLightHelper( dirLight ) )

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

const TILE_SIZE = 8
const COL_SIZE = 128
const MAP_SIZE = TILE_SIZE * COL_SIZE

const tileEngine = new TileEngine( MAP_SIZE, TILE_SIZE )

// PLACEHOLDER
const placeholder = new THREE.Mesh(
	new THREE.BoxGeometry( 2, 2, 2 ),
	new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true, color: 0x000000 } )
)
scene.add( placeholder )

// GROUND

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry( TILE_SIZE * COL_SIZE, TILE_SIZE * COL_SIZE ).rotateX( - Math.PI / 2 ),
	new THREE.MeshStandardMaterial( { color: 0x202020 } )
)
ground.receiveShadow = true
scene.add( ground )

// HELPERS

scene.add( Utils.buildGrid( tileEngine, 0x303030 ) )
scene.add( new THREE.AxesHelper( 512 ) )

//

let mode = "controls"

onModeChange()

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

		controls.enabled = true

		placeholder.visible = false
	}
	else {

		controls.enabled = false

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
		placeholder.position.divideScalar( 2 ).floor().multiplyScalar( 2 ).addScalar( 1 )
	}
} )

canvas.addEventListener( "pointerdown", e => {

	if ( mode === "controls" ) {

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

			const geometry = new THREE.BoxGeometry( 2, 2, 2 )
			const material = new THREE.MeshPhongMaterial( { transparent: true, flatShading: true, color: 0xffffff * Math.random() } )
			const object = new THREE.Mesh( geometry, material )
			object.position.copy( intersect.point ).add( intersect.face.normal )
			object.position.divideScalar( 2 ).floor().multiplyScalar( 2 ).addScalar( 1 )
			object.castShadow = true
			object.receiveShadow = true
			scene.add( object )

			objects.push( object )
		}
	}
} )
