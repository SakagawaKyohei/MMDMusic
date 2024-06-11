import * as THREE_NPM from 'three';
import * as dat from 'dat.gui';
//import { PointerLockFirstPersonCamera } from './PointerLockFirstPersonCamera.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';

import {InputController} from './InputController'
import {FirstPersonCamera} from './FirstPersonCamera.js';
import {PointerLockInputController} from './PointerLockInputController'
import {PointerLockFirstPersonCamera} from './PointerLockFirstPersonCamera.js';

var renderer = new THREE_NPM.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
//document.getElementById('webgl').appendChild(renderer.domElement);
document.body.appendChild(renderer.domElement);

var camera = new THREE_NPM.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(2, 8, 100);
//camera.lookAt(new THREE_NPM.Vector3(0, 0, 0));

let gui;
let scene;
// TODO: trying to put the miku model into the scene


function initsomething() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );

    // scene
    scene = new THREE.Scene();

    // const light = new THREE.DirectionalLight(0xffffff,1); //1: cuong do anh sang
    // light.position.set(2,2,5);
    // scene.add(light)



    var ambient = new THREE.AmbientLight( 0x666666 );
    scene.add( ambient );

    var directionalLight = new THREE.DirectionalLight( 0x887766 );
    directionalLight.position.set( -1, 1, 1 ).normalize();
    scene.add( directionalLight );


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setClearColor( new THREE.Color( 0xffffff ) );
    container.appendChild( renderer.domElement );

    //effect = new THREE.OutlineEffect( renderer );

    if(controlState == CONTROL_STATES.MIKU) {
        controls = new THREE.OrbitControls( camera , renderer.domElement);
        controls.enableKeys = false;
        input = new InputController();
    } else {
        firstPersonCamera = new PointerLockFirstPersonCamera(camera, renderer);
        input = new PointerLockInputController(renderer);
    }
    camera.position.z = 5;
    camera.position.y = 3;

    camera.lookAt( scene.position, container );
    resetPosition();




    // model
    helper = new THREE.MMDHelper();
    loader = new THREE.MMDLoader();

    loadModels( function () {

        var mesh = helper.meshes[ 0 ];
        miku = mesh;

        if(controlState == CONTROL_STATES.MIKU) {
            // NOTE: comment this section out to get the t-pose
            loadVpds( mesh, function () {

                helper.poseAsVpd( mesh, poses[ 'basic' ] );

                loadVmds( mesh, function () {

                    loader.pourVmdIntoModel( mesh, blinkVmd, 'blink' );

                    helper.setAnimation( mesh );

                    for ( var i = 0; i < motionParams.length; i++ ) {

                        var param = motionParams[ i ];

                        var name = param.name;
                        mesh.mixer.clipAction( name ).weight = 0.0;
                        mesh.mixer.clipAction( name + 'Morph' ).weight = 0.0;
                    startMotion( mesh, name );

                    }

                    createDictionary( mesh );
                    startBlink( mesh );

                    ready = true;

                } );

            } );

        } else {
            ready = true;
        }

    } );

    window.addEventListener( 'resize', onWindowResize, false );

}




function something() {

}



function init() {
    gui = new dat.GUI();
    scene = new THREE_NPM.Scene();

    const materials = {
        sphere: getMaterial('standard', 'rgb(255, 4, 255)'),
        sphere1: getMaterial('standard', 'rgb(255, 0, 0)'),
        sphere2: getMaterial('standard', 'rgb(110, 127, 120)'),
        cylinder: getMaterial('standard', 'rgb(110, 127, 120)'),
        box: getMaterial('lambert', 'rgb(0, 255, 255)'),
        icosahedron: getMaterial('phong', 'rgb(255, 255, 0)'),
        plane: getMaterial('standard', 'rgb(255, 255, 255)')
    };

    const objects = {
        sphere: getSphere(materials.sphere, 25, 24),
        sphere1: getSphere(materials.sphere1, 8, 24),
        sphere2: getSphere(materials.sphere2, 15, 24),
        cylinder: getCylinder(materials.cylinder, 20, 20, 10, 40),
        box: getBox(materials.box, 60, 15, 15),
        ico1: getIcosahedron(materials.icosahedron, 4),
        ico2: getIcosahedron(materials.icosahedron, 4),
        ico3: getIcosahedron(materials.icosahedron, 4),
        ico4: getIcosahedron(materials.icosahedron, 4),
        ico5: getIcosahedron(materials.icosahedron, 4),
        ico6: getIcosahedron(materials.icosahedron, 4),
        plane: getPlane(materials.plane, 200)
    };

    const lights = {
        lightLeft: getSpotLight(7000, 'rgb(255, 220, 180)'),
        lightRight: getSpotLight(7000, 'rgb(255, 220, 180)'),
        directionalLight: getDirectionalLight(10)
    };

    positionObjects(objects, lights);
    configureTextures(materials);

    scene.add(objects.sphere, objects.sphere1, objects.sphere2, objects.box, objects.cylinder);
    scene.add(objects.ico1, objects.ico2, objects.ico3, objects.ico4, objects.ico5, objects.ico6);
    scene.add(objects.plane, lights.lightLeft, lights.lightRight, lights.directionalLight);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    animateScene(scene, camera, renderer);

    return scene;
}

function positionObjects(objects, lights) {
    objects.sphere.position.set(68, objects.sphere.geometry.parameters.radius, -60);
    objects.sphere1.position.set(14, 23, -60);
    objects.sphere2.position.set(-65, 20, -30);
    objects.box.position.set(-5, 7.6, -60);
    objects.cylinder.position.set(-65, 6, -30);
    objects.ico1.position.set(-70, 6, 20);
    objects.ico2.position.set(-45, 6, 40);
    objects.ico3.position.set(-22, 6, 60);
    objects.ico4.position.set(22, 6, 60);
    objects.ico5.position.set(45, 6, 40);
    objects.ico6.position.set(70, 6, 20);
    objects.plane.rotation.x = Math.PI / 2;
    lights.lightLeft.position.set(-32, 10, 8);
    lights.lightRight.position.set(32, 10, 8);
    lights.directionalLight.position.set(9, 2.5, 15);
}

function configureTextures(materials) {
    const loader = new THREE_NPM.TextureLoader();
    const texturePaths = [
        '/texture/brick_diffuse.jpg',
        '/texture/fingerprint.jpg',
        '/texture/water.jpg'
    ];

    materials.plane.map = loader.load(texturePaths[0]);
    materials.plane.bumpMap = loader.load(texturePaths[0]);
    materials.plane.roughnessMap = loader.load(texturePaths[0]);
    materials.plane.bumpScale = 0.01;
    materials.plane.metalness = 1;
    materials.plane.roughness = 1;
    materials.plane.envMap = getReflectionCube();

    materials.sphere.roughnessMap = loader.load(texturePaths[1]);
    materials.sphere.roughness = 0.8;
    materials.sphere.metalness = 1;
    materials.sphere.envMap = getReflectionCube();

    materials.sphere1.roughnessMap = loader.load(texturePaths[1]);
    materials.sphere1.roughness = 0.06;
    materials.sphere1.metalness = 0.5;
    materials.sphere1.envMap = getReflectionCube();

    materials.sphere2.roughnessMap = loader.load(texturePaths[1]);
    materials.sphere2.roughness = 0.05;
    materials.sphere2.metalness = 1;
    materials.sphere2.envMap = getReflectionCube();

    materials.box.normalMap = loader.load(texturePaths[2]);
    materials.box.envMap = getReflectionCube();

    materials.icosahedron.roughnessMap = loader.load(texturePaths[2]);
    materials.icosahedron.metalness = 0.1;
    materials.icosahedron.envMap = getReflectionCube();

    const maps = ['map', 'bumpMap', 'roughnessMap'];
    maps.forEach((mapName) => {
        const texture = materials.plane[mapName];
        texture.wrapS = THREE_NPM.RepeatWrapping;
        texture.wrapT = THREE_NPM.RepeatWrapping;
        texture.repeat.set(15, 15);
    });
}

function getReflectionCube() {
    const path = '/texture/';
    const format = '.jpg';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    const reflectionCube = new THREE_NPM.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE_NPM.RGBAFormat;
    return reflectionCube;
}

function animateScene(scene, camera, renderer) {
    function animate() {
        requestAnimationFrame(animate);
        updateScene(scene);
        renderer.render(scene, camera);
    }
    animate();
}

function updateScene(scene) {
    scene.children.forEach((child) => {
        if (child instanceof THREE_NPM.Mesh && child.geometry instanceof THREE_NPM.IcosahedronGeometry) {
            child.rotation.x += 0.01;
            child.rotation.y += 0.1;
            child.rotation.z += 0.01;
        }
    });
}

function getSpotLight(intensity, color = 'rgb(255, 255, 255)') {
    const light = new THREE_NPM.SpotLight(color, intensity);
    light.castShadow = true;
    light.penumbra = 0.5;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
    light.shadow.bias = 0.001;
    return light;
}

function getDirectionalLight(intensity) {
    const light = new THREE_NPM.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;
    light.shadow.camera.left = light.shadow.camera.bottom = -10;
    light.shadow.camera.right = light.shadow.camera.top = 10;
    return light;
}

function getBox(material, w, h, d) {
    const geometry = new THREE_NPM.BoxGeometry(w, h, d);
    const obj = new THREE_NPM.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getSphere(material, size, segments) {
    const geometry = new THREE_NPM.SphereGeometry(size, segments, segments);
    const obj = new THREE_NPM.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getPlane(material, size) {
    const geometry = new THREE_NPM.PlaneGeometry(size, size);
    material.side = THREE_NPM.DoubleSide;
    const obj = new THREE_NPM.Mesh(geometry, material);
    obj.receiveShadow = true;
    return obj;
}

function getIcosahedron(material, size) {
    const geometry = new THREE_NPM.IcosahedronGeometry(size);
    return new THREE_NPM.Mesh(geometry, material);
}

function getCylinder(material, rTop, rBot, h, radialSegments) {
    const geometry = new THREE_NPM.CylinderGeometry(rTop, rBot, h, radialSegments);
    const obj = new THREE_NPM.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getMaterial(type, color) {
    const materialOptions = { color: color || 'rgb(255, 255, 255)' };
    switch (type) {
        case 'basic':
            return new THREE_NPM.MeshBasicMaterial(materialOptions);
        case 'lambert':
            return new THREE_NPM.MeshLambertMaterial(materialOptions);
        case 'phong':
            return new THREE_NPM.MeshPhongMaterial(materialOptions);
        case 'standard':
            return new THREE_NPM.MeshStandardMaterial(materialOptions);
        default:
            return new THREE_NPM.MeshBasicMaterial(materialOptions);
    }
}

document.getElementById("mybutton").addEventListener("click",function(){
gui.destroy();
    if(s=="s1")
        {
            while(scene.children.length > 0){ 
                scene.remove(scene.children[0]); 
            }
        
            scene=init();
        }
        else{
            while(scene.children.length > 0){ 
                scene.remove(scene.children[0]); 
            }
        
            scene=init2();
            console.log("aaa")
        }
    if(count>0)
        {
            const lastObject = scene.children[scene.children.length - 1];
    
            // Remove the last object from the scene
            scene.remove(lastObject);
            
        }
        count=count+1;
        console.log(select1+select2)

    
    
        // Thực thi một hành động nào đó khi button được click
        // alert("Button clicked!");
    
        // Thay đổi giá trị của biến miku
    
    
        // Load mô hình 3D mới
    loader1.loadWithAnimation(
        select1,
        select2,
        function(mmd) {
            helper.add(mmd.mesh, {
                animation: mmd.animation,
                physics: true
            });
     
            scene.add(mmd.mesh);
            // Lưu trữ tham chiếu đến mô hình 3D mới
            currentModel = mmd.mesh;
            // Load âm thanh
           
    

        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log(error);
        }
    );
    setTimeout(() => {
        new THREE_NPM.AudioLoader().load(
            'wavefile_short.mp3',
            
             function ( buffer ) {
    
                const listener = new THREE_NPM.AudioListener();
                const audio = new THREE_NPM.Audio( listener ).setBuffer( buffer );
    
                listener.position.z = 1;
    
                scene.add( audio );
                scene.add( listener );
    audio.play();
            }
    
        );
      }, 6350);

})
let s;
document.getElementById("stage").addEventListener("change", function() {
   s=this.value
});

init();
