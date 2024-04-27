import * as THREE from 'three';
import Ammo from './ammo';
import { MMDPhysics } from 'three/addons/animation/MMDPhysics.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js'; 
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let physics;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ });
const cube = new THREE.Mesh(geometry, material);


const clock=new THREE.Clock()


const loader1 = new MMDLoader();
const helper = new MMDAnimationHelper();

loader1.loadWithAnimation(
	// path to PMD/PMX file
	'miku_v2.pmd',
	"wavefile_v2.vmd",
	// called when the resource is loaded
	 function (mmd) {
		// physics = new MMDPhysics( mmd )
		// scene.add( physics );
	
		helper.add( mmd.mesh, {
			animation: mmd.animation,
			physics: true
		} );
		
		scene.add( mmd.mesh );
		new THREE.AudioLoader().load(
			'examples_models_mmd_audios_wavefile_short.mp3',
			
			 function ( buffer ) {

				const listener = new THREE.AudioListener();
				const audio = new THREE.Audio( listener ).setBuffer( buffer );

				listener.position.z = 1;

				scene.add( audio );
				scene.add( listener );

			}

		);
	
	},
	
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {
		console.log( error);
	}
);



const light=new THREE.DirectionalLight(0xffffff,1); //1: cuong do anh sang
light.position.set(2,2,5);
scene.add(light)

camera.position.z = 20;
camera.position.y = 9;

function animate() {
    requestAnimationFrame(animate); // Thêm dòng này để loop animation
   
	helper.update( clock.getDelta() );

    renderer.render(scene, camera);
}
var button = document.getElementById("myButton");

// Thêm sự kiện click vào button
button.addEventListener("click",function() {
	// Thực thi một hành động nào đó khi button được click
	alert("Button clicked!");
	animate();
	new THREE.AudioLoader().load(
		'examples_models_mmd_audios_wavefile_short.mp3',
		
		 function ( buffer ) {

			const listener = new THREE.AudioListener();
			const audio = new THREE.Audio( listener ).setBuffer( buffer );

			listener.position.z = 1;

			scene.add( audio );
			scene.add( listener );
audio.play();
		}
	);


});




