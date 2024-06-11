import * as THREE_NPM from 'three';
import {InputController} from './InputController'
import {FirstPersonCamera} from './FirstPersonCamera.js';
import {PointerLockInputController} from './PointerLockInputController'
import {PointerLockFirstPersonCamera} from './PointerLockFirstPersonCamera.js';


const CONTROL_STATES = {
    CAMERA: 0, 
    MIKU: 1, 
}

console.log(THREE_NPM);
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
        position: new THREE.Vector3( 0, 0, -25 )
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

function onKeyDown(event) {
    // Handle key down
    if (event.key === 'Control') {
        document.exitPointerLock();
    }
}

function init() {

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

            createGround();

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
// const gui = new dat.GUI();
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
                init(); 
                break;
            case "miku":
                console.log("Miku Control selected");
                // Handle Miku control state
                controlState = CONTROL_STATES.MIKU;
                removeContainer();
                init(); 
                break;
            default:
                console.log("Unknown state selected");
        }
    }
});

init();
update();
