import * as THREE from "three"

const canvas = document.getElementById( "gl" )
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 500 )
camera.position.set( 16, 32, 16 )
camera.lookAt( 0, 0, 0 )
const renderer = new THREE.WebGLRenderer( { canvas } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setAnimationLoop( () => {
	renderer.render( scene, camera )
} )

// PLACEHOLDER
const placeholder = new THREE.Mesh(
	new THREE.BoxGeometry( 2, 2, 2 ),
	new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } )
)

scene.add( placeholder )

// VOXEL

const voxelGeometry = new THREE.BoxGeometry( 2, 2, 2 )
const voxelMaterial = new THREE.MeshNormalMaterial()

// GRID

const gridHelper = new THREE.GridHelper( 16, 8, 0x404040, 0x202020 )
scene.add( gridHelper )

// GROUND

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry( 16, 16 ).rotateX( - Math.PI / 2 ),
	new THREE.MeshBasicMaterial( { visible: false } )
)
scene.add( ground )

//

let isShiftDown = false

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const objects = [ ground ]

document.addEventListener( "pointermove", e => {

	pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 )

	raycaster.setFromCamera( pointer, camera )

	const intersects = raycaster.intersectObjects( objects, false )

	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ]

		placeholder.position.copy( intersect.point ).add( intersect.face.normal )
		placeholder.position.divideScalar( 2 ).floor().multiplyScalar( 2 ).addScalar( 1 )
	}
} )

document.addEventListener( "pointerdown", e => {

	pointer.set( ( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1 )

	raycaster.setFromCamera( pointer, camera )

	const intersects = raycaster.intersectObjects( objects, false )

	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ]

		// delete cube

		if ( isShiftDown ) {

			if ( intersect.object !== ground ) {

				scene.remove( intersect.object )

				objects.splice( objects.indexOf( intersect.object ), 1 )
			}
		}
		else {

			const voxel = new THREE.Mesh( voxelGeometry, voxelMaterial )
			voxel.position.copy( intersect.point ).add( intersect.face.normal )
			voxel.position.divideScalar( 2 ).floor().multiplyScalar( 2 ).addScalar( 1 )
			scene.add( voxel )

			objects.push( voxel )
		}
	}
} )

document.addEventListener( "keydown", e => {

	if ( e.keyCode === 16 ) {

		isShiftDown = true
	}
} )

document.addEventListener( "keyup", e => {

	if ( e.keyCode === 16 ) {

		isShiftDown = false
	}
} )
