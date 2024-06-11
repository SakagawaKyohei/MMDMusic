//import * as THREE from 'three';
import {InputController} from './InputController'
import {FirstPersonCamera} from './FirstPersonCamera.js';
import {PointerLockInputController} from './PointerLockInputController'
import {PointerLockFirstPersonCamera} from './PointerLockFirstPersonCamera.js';


const CONTROL_STATES = {
    CAMERA: 0, 
    MIKU: 1, 
}

//console.log(THREE);
console.log(THREE);

let controlState = CONTROL_STATES.CAMERA;
//let controlState = CONTROL_STATES.MIKU;
//
let input;

var container;

var camera, scene, renderer, effect;
var helper, loader;

var controls;

var miku;
var world;

var ready = false;

var mouseX = 0, mouseY = 0;
// window.innerWidth = 800;
// window.innerHeight = 600;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var clock = new THREE.Clock();

var boneDictionary = {};
var modelDictionary = {};
var motionDictionary = {};

var motionStatus = {
    inWalking: false,
    inRunning: false,
    inStartWalking: false,
    inStartRunning: false,
    inStopWalking: false,
    inStopRunning: false,
    inMovingForward: false,
    inMovingBackward: false,
    inRotatingLeft: false,
    inRotatingRight: false,
    direction: 0,
    runFlag: false,
    duration: 0.0,
    elapsedTimeSinceStartWalking: 0.0,
    elapsedTimeSinceStartRunning: 0.0,
    elapsedTimeSinceStopWalking: 0.0,
    elapsedTimeSinceStopRunning: 0.0
};

const updateMotionStatus = (motionStatus, input) => {
    const KEYS = {
        w: 87, 
        a: 65, 
        s: 83, 
        d: 68
    }; 

    motionStatus.runFlag = input.key(16); // Shift 
    // motionStatus.inRotatingLeft = input.key(37); // Left 
    // motionStatus.inMovingForward = input.key(38); // Up 
    // motionStatus.inRotatingRight = input.key(39); // Right 

    motionStatus.inRotatingLeft = input.key(KEYS.a); // Left 
    motionStatus.inMovingForward = input.key(KEYS.w); // Up 
    motionStatus.inRotatingRight = input.key(KEYS.d); // Right 
}

// see the license https://github.com/takahirox/MMDLoader-app#readme for these assets

var modelParams = [
    {
        name: 'miku',
        file: 'https://rawcdn.githack.com/mrdoob/three.js/r87/examples/models/mmd/miku/miku_v2.pmd',
        position: new THREE.Vector3( 0, -15,  0 )
    }
];

var cameraParams = [
    {
        name: 'camera',
        //position: new THREE.Vector3( 0, 0, -25 )
        position: new THREE.Vector3( 2, 8, 100 )
    }
];

var blinkMorphName = 'まばたき';

var poseParams = [
    {
        name: 'basic',
        file: 'assets/vpd/imas/makoto_basic.vpd'
    },
];

var poses = {};

var motionParams = [
    {
        name: 'walk',
        isMoving: true,
        files: [ 'assets/vmd/walk/walk.vmd' ]
    },
    {
        name: 'run',
        isMoving: true,
        files: [ 'assets/vmd/walk/run.vmd' ]
    }
];

var blinkVmd = {
    metadata: {
        name: 'blink',
        coordinateSystem: 'right',
        morphCount: 11,
        cameraCount: 0,
        motionCount: 0
    },
    morphs: [
        { frameNum:   0, morphName: blinkMorphName, weight: 0.0 },
        { frameNum:  10, morphName: blinkMorphName, weight: 0.0 },
        { frameNum:  15, morphName: blinkMorphName, weight: 1.0 },
        { frameNum:  20, morphName: blinkMorphName, weight: 0.0 },
        { frameNum:  40, morphName: blinkMorphName, weight: 0.0 },
        { frameNum:  43, morphName: blinkMorphName, weight: 1.0 },
        { frameNum:  46, morphName: blinkMorphName, weight: 0.0 },
        { frameNum:  49, morphName: blinkMorphName, weight: 0.0 },
        { frameNum:  52, morphName: blinkMorphName, weight: 1.0 },
        { frameNum:  55, morphName: blinkMorphName, weight: 0.0 },
        { frameNum: 200, morphName: blinkMorphName, weight: 0.0 },
    ],
    cameras: [],
    motions: []
};

var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
};

var onError = function ( xhr ) {
};


let firstPersonCamera;


function getReflectionCube() {
    const path = '/texture/';
    const format = '.jpg';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    const reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBAFormat;
    return reflectionCube;
}

// function animateScene(scene, camera, renderer) {
//     function animate() {
//         requestAnimationFrame(animate);
//         updateScene(scene);
//         renderer.render(scene, camera);
//     }
//     animate();
// }
//
// function updateScene(scene) {
//     scene.children.forEach((child) => {
//         if (child instanceof THREE.Mesh && child.geometry instanceof THREE.IcosahedronGeometry) {
//             child.rotation.x += 0.01;
//             child.rotation.y += 0.1;
//             child.rotation.z += 0.01;
//         }
//     });
// }

function getSpotLight(intensity, color = 'rgb(255, 255, 255)') {
    const light = new THREE.SpotLight(color, intensity);
    light.castShadow = true;
    light.penumbra = 0.5;
    light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
    light.shadow.bias = 0.001;
    return light;
}

function getDirectionalLight(intensity) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;
    light.shadow.camera.left = light.shadow.camera.bottom = -10;
    light.shadow.camera.right = light.shadow.camera.top = 10;
    return light;
}

function getBox(material, w, h, d) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getSphere(material, size, segments) {
    const geometry = new THREE.SphereGeometry(size, segments, segments);
    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getPlane(material, size) {
    const geometry = new THREE.PlaneGeometry(size, size);
    material.side = THREE.DoubleSide;
    const obj = new THREE.Mesh(geometry, material);
    obj.position.y = -15;
    obj.receiveShadow = true;
    return obj;
}

function getIcosahedron(material, size) {
    const geometry = new THREE.IcosahedronGeometry(size);
    return new THREE.Mesh(geometry, material);
}

function getCylinder(material, rTop, rBot, h, radialSegments) {
    const geometry = new THREE.CylinderGeometry(rTop, rBot, h, radialSegments);
    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getMaterial(type, color) {
    const materialOptions = { color: color || 'rgb(255, 255, 255)' };
    switch (type) {
        case 'basic':
            return new THREE.MeshBasicMaterial(materialOptions);
        case 'lambert':
            return new THREE.MeshLambertMaterial(materialOptions);
        case 'phong':
            return new THREE.MeshPhongMaterial(materialOptions);
        case 'standard':
            return new THREE.MeshStandardMaterial(materialOptions);
        default:
            return new THREE.MeshBasicMaterial(materialOptions);
    }
}

let gui;
const rotateThings = [];
function addThingsToScene(scene)  {

    var sphereMaterial = getMaterial('standard', 'rgb(255, 4, 255)');
    var sphereMaterial1 = getMaterial('standard', 'rgb(255, 0, 0)');
    var sphereMaterial2 = getMaterial('standard', 'rgb(110, 127, 120)');
    var sphere = getSphere(sphereMaterial, 25, 24);
    var sphere1 = getSphere(sphereMaterial1, 8, 24);
    var sphere2 = getSphere(sphereMaterial2, 15, 24);

    var cyMaterial = getMaterial('standard', 'rgb(110, 127, 120)');
    var cylinder = getCylinder(cyMaterial, 20, 20, 10, 40)

    var boxMaterial = getMaterial('lambert', 'rgb(0, 255, 255)');
    var box = getBox(boxMaterial, 60, 15, 15);

    var icoMaterial = getMaterial('phong', 'rgb(255, 255, 0)');
    var ico1 = getIcosahedron(icoMaterial, 4);
    var ico6 = getIcosahedron(icoMaterial, 4);
    var ico2 = getIcosahedron(icoMaterial, 4);
    var ico5 = getIcosahedron(icoMaterial, 4);
    var ico3 = getIcosahedron(icoMaterial, 4);
    var ico4 = getIcosahedron(icoMaterial, 4);

    var planeMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
    var plane = getPlane(planeMaterial, 200);
    console.log("plane: ", plane);

    var lightLeft = getSpotLight(7000, 'rgb(255, 220, 180)');
    var lightRight = getSpotLight(7000, 'rgb(255, 220, 180)');
    var directionalLight = getDirectionalLight(10);

    sphere.position.y = sphere.geometry.parameters.radius;
    sphere.position.x = 68;
    sphere.position.z = -60;
    sphere2.position.y = 20;
    sphere2.position.x = -65;
    sphere2.position.z = -30;
    sphere1.position.x = 14;
    sphere1.position.y = 23;
    sphere1.position.z = -60;
    plane.rotation.x = Math.PI/2;
    box.position.x = -5;
    box.position.y = 7.6;
    box.position.z = -60;
    cylinder.position.x = -65;
    cylinder.position.y = 6;
    cylinder.position.z = -30;

    ico1.position.x = -70;
    ico1.position.y = 6;
    ico1.position.z = 20;
    ico6.position.x = 70;
    ico6.position.y = 6;
    ico6.position.z = 20;

    ico2.position.x = -45;
    ico2.position.y = 6;
    ico2.position.z = 40;
    ico5.position.x = 45;
    ico5.position.y = 6;
    ico5.position.z = 40;

    ico3.position.x = -22;
    ico3.position.y = 6;
    ico3.position.z = 60;
    ico4.position.x = 22;
    ico4.position.y = 6;
    ico4.position.z = 60;

    
    lightLeft.position.x = -32;
    lightLeft.position.y = 10;
    lightLeft.position.z = 8;

    lightRight.position.x = 32;
    lightRight.position.y = 10;
    lightRight.position.z = 8;

    directionalLight.position.x = 9;
    directionalLight.position.y = 2.5;
    directionalLight.position.z = 15;
    directionalLight.intensity = 6;

    //load the cube map
    var path = '/texture/'
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    var reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBAFormat;

    scene.background = reflectionCube;

    var loader = new THREE.TextureLoader();
    planeMaterial.map = loader.load('/texture/brick_diffuse.jpg');
    planeMaterial.bumpMap = loader.load('/texture/brick_diffuse.jpg');
    planeMaterial.roughnessMap = loader.load('/texture/brick_diffuse.jpg');
    planeMaterial.bumpScale = 0.01;
    planeMaterial.metalness = 1;
    planeMaterial.roughness = 1;
    planeMaterial.envMap = reflectionCube;

    sphereMaterial.roughnessMap = loader.load('/texture/fingerprint.jpg');
    sphereMaterial.roughness = 0.8;
    sphereMaterial.metalness = 1;
    sphereMaterial.envMap = reflectionCube;

    sphereMaterial1.roughnessMap = loader.load('/texture/fingerprint.jpg');
    sphereMaterial1.roughness = 0.06;
    sphereMaterial1.metalness = 0.5;
    sphereMaterial1.envMap = reflectionCube;

    sphereMaterial2.roughnessMap = loader.load('/texture/fingerprint.jpg');
    sphereMaterial2.roughness = 0.05;
    sphereMaterial2.metalness = 1;
    sphereMaterial2.envMap = reflectionCube;

    boxMaterial.normalMap = loader.load('/texture/water.jpg');
    boxMaterial.envMap = reflectionCube;

    icoMaterial.roughnessMap = loader.load('/texture/water.jpg');
    icoMaterial.metalness = 0.1;
    icoMaterial.envMap = reflectionCube;

    var maps = ['map', 'bumpMap', 'roughnessMap'];
    maps.forEach(function(mapName) {
        var texture = planeMaterial[mapName];
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(15, 15);
    });
    

    gui = new dat.GUI();
    var folder1 = gui.addFolder('spotlight_1');
    folder1.add(lightLeft, 'intensity', 0, 10000);
    folder1.add(lightLeft.position, 'x', -100, 100);
    folder1.add(lightLeft.position, 'y', -80, 80);
    folder1.add(lightLeft.position, 'z', -100, 100);

    var folder2 = gui.addFolder('spotlight_2');
    folder2.add(lightRight, 'intensity', 0, 10000);
    folder2.add(lightRight.position, 'x', -100, 100);
    folder2.add(lightRight.position, 'y', -80, 80);
    folder2.add(lightRight.position, 'z', -100, 100);

    var folder3 = gui.addFolder('directional_light');
    folder3.add(directionalLight, 'intensity', 0, 10);
    folder3.add(directionalLight.position, 'x', -40, 40);
    folder3.add(directionalLight.position, 'y', -40, 40);
    folder3.add(directionalLight.position, 'z', -40, 40);

    var folder4 = gui.addFolder('materials');
    folder4.add(sphereMaterial, 'roughness', -1, 1);
    folder4.add(sphereMaterial, 'metalness', -1, 1);
    folder4.add(sphereMaterial1, 'roughness', -1, 1);
    folder4.add(sphereMaterial1, 'metalness', -1, 1);
    folder4.add(sphereMaterial2, 'roughness', -1, 1);
    folder4.add(sphereMaterial2, 'metalness', -1, 1);
    folder4.add(planeMaterial, 'roughness', -1, 1);
    folder4.add(planeMaterial, 'metalness', -1, 1);
    folder4.open();

    scene.add(sphere);
    scene.add(sphere1);
    scene.add(sphere2);
    scene.add(box);
    scene.add(cylinder);
    scene.add(ico6);
    scene.add(ico1);
    scene.add(ico2);
    scene.add(ico5);
    scene.add(ico3);
    scene.add(ico4);
    scene.add(plane);

    rotateThings.push(ico6);
    rotateThings.push(ico1);
    rotateThings.push(ico2);
    rotateThings.push(ico5);
    rotateThings.push(ico3);
    rotateThings.push(ico4);

    //scene.add(lightLeft);
    //scene.add(lightRight);
    //scene.add(directionalLight);
    
}

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );

    // scene
    scene = new THREE.Scene();

    const light = new THREE.DirectionalLight(0xffffff,1); //1: cuong do anh sang
    light.position.set(2,2,5);
    scene.add(light)


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

    addThingsToScene(scene);
    window.addEventListener( 'resize', onWindowResize, false );
}

function loadModels ( callback ) {

    function load ( index ) {

        if ( index >= modelParams.length ) {

            callback();
            return;

        }

        var param = modelParams[ index ];

        loader.loadModel( param.file, function ( object ) {

            var mesh = object;

            helper.add( mesh );
            helper.setPhysics( mesh );

            resetPosition();

            world = mesh.physics.world;

            scene.add( mesh );

            //createGround();

            load( index + 1 );

            }, onProgress, onError );

    }

    load( 0 );

}

function loadVmds ( mesh, callback ) {

    function load ( index ) {

        if ( index >= motionParams.length ) {

            callback();
            return;

        }

        var param = motionParams[ index ];

        loader.loadVmds( param.files, function ( vmd ) {

            loader.pourVmdIntoModel( mesh, vmd, param.name );

            load( index + 1 );

            }, onProgress, onError );

    }

    load( 0 );

}

function loadVpds ( mesh, callback ) {

    function load ( index ) {

        if ( index >= poseParams.length ) {

            callback();
            return;

        }

        var param = poseParams[ index ];

        loader.loadVpd( param.file, function ( vpd ) {

        poses[ param.name ] = vpd;

        load( index + 1 );

        }, onProgress, onError );

    }

    load( 0 );

}

function createDictionary ( mesh ) {

    var bones = mesh.skeleton.bones;

    for ( var i = 0; i < bones.length; i++ ) {

        var b = bones[ i ];
        boneDictionary[ b.name ] = i;

    }

    for ( var i = 0; i < motionParams.length; i++ ) {

        var p = motionParams[ i ];
        motionDictionary[ p.name ] = i;

    }

}

function createRigidBody ( size, weight, position ) {

    var shape = new Ammo.btBoxShape( new Ammo.btVector3( size[ 0 ], size[ 1 ], size[ 2 ] ) );
    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    shape.calculateLocalInertia( weight, localInertia );

    var form = new Ammo.btTransform();
    form.setIdentity();
    form.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );

    var state = new Ammo.btDefaultMotionState( form );
    var info = new Ammo.btRigidBodyConstructionInfo( weight, state, shape, localInertia );

    return new Ammo.btRigidBody( info );

}

function createGround () {

    var gridHelper = new THREE.GridHelper( 1000, 500 );
    gridHelper.position.y = -15;

    var body = createRigidBody( [ 1000, 1, 1000 ], 0, gridHelper.position );
    body.setRestitution( 1 );
    body.setFriction( 1 );
    body.setDamping( 0, 0 );
    body.setSleepingThresholds( 0, 0 );
    world.addRigidBody( body );

    scene.add( gridHelper );

}

function onWindowResize () {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    //effect.setSize( window.innerWidth, window.innerHeight );

}

//

function rotate(things) {
    things.forEach(thing => {
        thing.rotation.x += 0.01;
        thing.rotation.y += 0.1;
        thing.rotation.z += 0.01;
    });
}

function update() {

    requestAnimationFrame( update );

    if ( ready ) {
        var delta = clock.getDelta();
        input.update(delta);

        if(controlState == CONTROL_STATES.MIKU) {
            updateMotionStatus(motionStatus, input);
            manageMove( delta );
            helper.animate( delta );
        } else {
            firstPersonCamera.update(delta);
        }

    }

    //effect.render( scene, camera );
    //console.log(scene);
    rotate(rotateThings);
    renderer.render( scene, camera );

}

function startMotion ( mesh, key ) {

    var name = key;
    mesh.mixer.clipAction( name ).play();
    mesh.mixer.clipAction( name + 'Morph' ).play();

}

function stopMotion ( mesh, key ) {

    var name = key;
    mesh.mixer.clipAction( name ).stop();
    mesh.mixer.clipAction( name + 'Morph' ).stop();

}

function startBlink ( mesh ) {

    mesh.mixer.clipAction( 'blinkMorph' ).play();

}

function stopBlink ( mesh ) {

    mesh.mixer.clipAction( 'blinkMorph' ).stop();

}

function startWalking ( mesh ) {

    motionStatus.inStartWalking = true;
    motionStatus.inStopWalking = false;
    motionStatus.elapsedTimeSinceStartWalking = 0.0;
    //startMotion( mesh, 'walk' );

}

function startRunning ( mesh ) {

    motionStatus.inStartRunning = true;
    motionStatus.inStopRunning = false;
    motionStatus.elapsedTimeSinceStartRunning = 0.0;
    //startMotion( mesh, 'run' );

}

function stopWalking ( mesh ) {

    motionStatus.inStartWalking = false;
    motionStatus.inStopWalking = true;
    motionStatus.elapsedTimeSinceStopWalking = 0.0;

}

function stopRunning ( mesh ) {

    motionStatus.inStartRunning = false;
    motionStatus.inStopRunning = true;
    motionStatus.elapsedTimeSinceStopRunning = 0.0;

}

function manageMove ( delta ) {

    var mesh = helper.meshes[ 0 ];

    var isMoving = motionStatus.inMovingForward || motionStatus.inMovingBackward;
    var isRotating = motionStatus.inRotatingLeft || motionStatus.inRotatingRight;

    var isWalking = motionStatus.inMovingForward || motionStatus.inMovingBackward ||
        motionStatus.inRotatingLeft  || motionStatus.inRotatingRight;

    var isRunning = isWalking && motionStatus.runFlag;

    if ( isMoving ) {

        //var speed = ( motionStatus.runFlag ? 0.6 : 0.2 ) * delta * 60;
        var speed = mesh.mixer.clipAction( 'run' ).weight * 0.4 +
            mesh.mixer.clipAction( 'walk' ).weight * 0.2;
        speed *= delta * 60;

        var dz = speed * Math.cos( motionStatus.direction );
        var dx = speed * Math.sin( motionStatus.direction );

        if ( motionStatus.inMovingForward ) {

            mesh.position.z += dz;
            mesh.position.x += dx;

        }

        if ( motionStatus.inMovingBackward ) {

            mesh.position.z -= dz;
            mesh.position.x -= dx;

        }

    }

    if ( isRotating ) {

        var dr = Math.PI * 2 / 360 * 5 * delta * 60;

        if ( motionStatus.inRotatingLeft ) {

            motionStatus.direction += dr;
            mesh.rotateY( dr );

        }

        if ( motionStatus.inRotatingRight ) {

            motionStatus.direction -= dr;
        mesh.rotateY( -dr );

        }

    }

    if ( motionStatus.inStartWalking ) {

        motionStatus.elapsedTimeSinceStartWalking += delta;
        var action = mesh.mixer.clipAction( 'walk' );
        action.weight += delta * 2;

        if ( action.weight > 1.0 ) {

            action.weight = 1.0;
            motionStatus.inStartWalking = false;

        }

    }

    if ( motionStatus.inStopWalking ) {

        motionStatus.elapsedTimeSinceStopWalking += delta;
        var action = mesh.mixer.clipAction( 'walk' );
        action.weight -= delta;

        if ( action.weight < 0.0 ) {

            action.weight = 0.0;
            motionStatus.inStopWalking = false;
            //stopMotion( mesh, 'walk' );

        }

    }

    if ( motionStatus.inStartRunning ) {

        motionStatus.elapsedTimeSinceStartRunning += delta;
        var action = mesh.mixer.clipAction( 'run' );
        action.weight += delta * 2;

        if ( action.weight > 1.0 ) {

            action.weight = 1.0;
            motionStatus.inStartRunning = false;

        }

    }

    if ( motionStatus.inStopRunning ) {

        motionStatus.elapsedTimeSinceStopRunning += delta;
        var action = mesh.mixer.clipAction( 'run' );
        action.weight -= delta;

        if ( action.weight < 0.0 ) {

            action.weight = 0.0;
            motionStatus.inStopRunning = false;
            //stopMotion( mesh, 'run' );

        }

    }

    if ( ! motionStatus.inWalking && isWalking ) {

    if ( isRunning ) {

            startRunning( mesh );

        } else {

            startWalking( mesh );

        }

    }

    if ( motionStatus.inWalking && ! isWalking ) {

        stopWalking( mesh );

        if ( motionStatus.inRunning ) {

        stopRunning( mesh );

        }

    }

    if ( motionStatus.inWalking && isWalking ) {

        if ( isRunning && ! motionStatus.inRunning ) {

        stopWalking( mesh );
            startRunning( mesh );

        }

        if ( ! isRunning && motionStatus.inRunning ) {

        stopRunning( mesh );
            startWalking( mesh );

        }

    }

    motionStatus.inWalking = isWalking;
    motionStatus.inRunning = isRunning;

}

function resetPosition () {

if ( camera ) {
        camera.position.copy( cameraParams[ 0 ].position );
        camera.up.set( 0, 1, 0 );
        camera.rotation.set( 0, 0, 0 );
        if(controlState == CONTROL_STATES.MIKU) {
            controls.update();
        }

    }

    if ( helper && helper.meshes.length > 0 ) {

        var mesh = helper.meshes[ 0 ];
        mesh.position.copy( modelParams[ 0 ].position );

        motionStatus.direction = 0;
        mesh.rotation.set( 0, 0, 0 );

        if ( mesh.physics ) {

            mesh.updateMatrixWorld( true );
            mesh.physics.reset();

        }

    }

}

function letObjectVisible ( obj ) {

    obj.visible = true;

}

function letObjectInvisible ( obj ) {

    if ( ! debug ) {

        obj.visible = false;

    }

}

function removeContainer() {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
}

// dat.GUI setup
// gui.add(state, 'control', ['camera', 'miku']).name('Control').onChange(handleStateChange);
//
// // Function to handle state changes
// function handleStateChange(value) {
//     switch(value) {
//         case 'camera':
//             console.log("Camera Control selected");
//             // Handle camera control state
//             break;
//         case 'miku':
//             console.log("Miku Control selected");
//             // Handle Miku control state
//             break;
//         default:
//             console.log("Unknown state selected");
//     }
// }

document.addEventListener("DOMContentLoaded", function() {
    var controlSelect = document.getElementById("controlSelect");

    controlSelect.addEventListener("change", function() {
        var selectedValue = controlSelect.value;
        handleStateChange(selectedValue);
    });

    function handleStateChange(state) {
        switch(state) {
            case "camera":
                console.log("Camera Control selected");
                // Handle camera control state
                controlState = CONTROL_STATES.CAMERA;
                removeContainer();
                if(gui)
                    gui.destroy();
                init(); 
                break;
            case "miku":
                console.log("Miku Control selected");
                // Handle Miku control state
                controlState = CONTROL_STATES.MIKU;
                removeContainer();
                if(gui)
                    gui.destroy();
                init(); 
                break;
            default:
                console.log("Unknown state selected");
        }
    }
});

init();
update();
