import * as THREE from 'three';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; 
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ });
const cube = new THREE.Mesh(geometry, material);
const helper = new MMDAnimationHelper();
const clock=new THREE.Clock()

const loader1 = new MMDLoader();
loader1.load(
	// path to PMD/PMX file
	'miku_v2.pmd',
    //loi file pmd cac file da them
	// called when the resource is loaded
	function ( mesh ) {
        // scene.add(cube)
		scene.add( mesh);
        mesh.scale.set(0.3,0.3,0.3)
        console.log(mesh)

	},
	// called when loading is in progresses
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {

		console.log( error );

	}
);

var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};


var onError = function ( xhr ) {
};

// loader1.load( './miku_v2.pmd', './wavefile_v2 (1).vmd', function ( object ) {
//
// 	var mesh = object;
// 	//const miku = mesh;
//
// 	var materials = mesh.material;
//
// 	for ( var i = 0, il = materials.length; i < il; i ++ ) {
//
// 		var material = materials[ i ];
// 		material.emissive.multiplyScalar( 0.2 );
//
// 	}
//
// 	mesh.castShadow = true;
// 	mesh.receiveShadow = true;
//
// 	helper.add( mesh );
// 	helper.setAnimation( mesh );
// 	helper.setPhysics( mesh );
//
// 	main.add( mesh );
//
// 	loader.loadVmds( cameraFiles, function ( vmd ) {
//
// 		helper.setCamera( camera );
//
// 		loader.pourVmdIntoCamera( camera, vmd );
// 		helper.setCameraAnimation( camera );
//
// 		loader.loadAudio( audioFile, function ( audio, listener ) {
//
// 			listener.position.z = 1;
//
// 			helper.setAudio( audio, listener, audioParams );
//
// 			/*
// 			 * Note: call this method after you set all animations
// 			 *       including camera and audio.
// 			 */
// 			helper.unifyAnimationDuration( { afterglow: 2.0 } );
//
// 			scene.add( audio );
// 			scene.add( listener );
// 			scene.add( main );
//
// 			star = new THREE.Mesh(
// 				new THREE.SphereBufferGeometry( 0.1, 8 ),
// 				new THREE.MeshPhongMaterial( {
// 					opacity: 0.1,
// 					transparent: true
// 				} )
// 			);
//
// 			ready = true;
//
// 		}, onProgress, onError );
//
// 	}, onProgress, onError );
//
// }, onProgress, onError );
//


const light=new THREE.DirectionalLight(0xffffff,1); //1: cuong do anh sang
light.position.set(2,2,5);
scene.add(light)

camera.position.z = 5;
camera.position.y = 3;

function animate() {
    requestAnimationFrame(animate); // Thêm dòng này để loop animation
    
	helper.update(clock.getDelta());

    // cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();


