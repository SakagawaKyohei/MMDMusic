// //thanh
import * as THREE2 from 'three';
import { MMDPhysics } from 'three/addons/animation/MMDPhysics.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js'; 
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import {FirstPersonCamera} from './FirstPersonCamera.js';
import {FirstPersonControls} from 'three/addons/controls/FirstPersonControls';
var renderer = new THREE2.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('webgl').appendChild(renderer.domElement);
let physicss;
 var camera = new THREE2.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        1,
        1000);

    camera.position.x = 2;
    camera.position.y = 8;
    camera.position.z = 100;

    camera.lookAt(new THREE2.Vector3(0, 0, 0));
function init() {
    var scene = new THREE2.Scene();
    var gui = new dat.GUI();

    var sphereMaterial = getMaterial('standard', 'rgb(255, 4, 255)');
    var sphereMaterial1 = getMaterial('standard', 'rgb(255, 0, 0)');
    var sphereMaterial2 = getMaterial('standard', 'rgb(110, 127, 120)');
    var sphere = getSphere(sphereMaterial, 22, 24);
    var sphere1 = getSphere(sphereMaterial1, 10, 24);
    var sphere2 = getSphere(sphereMaterial2, 15, 24);

    var cyMaterial = getMaterial('standard', 'rgb(20, 180, 220)');
    var cylinder = getCylinder(cyMaterial, 20, 20, 10, 40)

    var boxMaterial = getMaterial('phong', 'rgb(0, 255, 255)');
    var box = getBox(boxMaterial, 60, 20, 20);

    var icoMaterial = getMaterial('phong', 'rgb(255, 255, 0)');
    var ico1 = getIcosahedron(icoMaterial, 5);
    var ico6 = getIcosahedron(icoMaterial, 5);
    var ico2 = getIcosahedron(icoMaterial, 5);
    var ico5 = getIcosahedron(icoMaterial, 5);
    var ico3 = getIcosahedron(icoMaterial, 5);
    var ico4 = getIcosahedron(icoMaterial, 5);

    var planeMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
    var plane = getPlane(planeMaterial, 300);

    var lightLeft = getSpotLight(6, 'rgb(255, 220, 180)');
    var lightRight = getSpotLight(6, 'rgb(255, 220, 180)');
    var directionalLight = getDirectionalLight(1);

    sphere.position.y = sphere.geometry.parameters.radius;
    sphere.position.x = 68;
    sphere2.position.y = 20;
    sphere2.position.x = -65;
    sphere2.position.z = 30;
    sphere1.position.x = 14;
    sphere1.position.y = 30;
    sphere1.position.z = -10;
    plane.rotation.x = Math.PI/2;
    box.position.x = -200;
    box.position.y = 10.1;
    box.position.z = -10;
    cylinder.position.x = -65;
    cylinder.position.y = 6;
    cylinder.position.z = 30;

    ico1.position.x = -70;
    ico1.position.y = 6;
    ico1.position.z = 70;
    ico6.position.x = 70;
    ico6.position.y = 6;
    ico6.position.z = 70;

    ico2.position.x = -45;
    ico2.position.y = 6;
    ico2.position.z = 92;
    ico5.position.x = 45;
    ico5.position.y = 6;
    ico5.position.z = 92;

    ico3.position.x = -22;
    ico3.position.y = 6;
    ico3.position.z = 110;
    ico4.position.x = 22;
    ico4.position.y = 6;
    ico4.position.z = 110;

    
    lightLeft.position.x = -100;
    lightLeft.position.y = -10;
    lightLeft.position.z = 100;

    lightRight.position.x = 100;
    lightRight.position.y = -10;
    lightRight.position.z = 100;

    directionalLight.position.x = 7;
    directionalLight.position.y = 4;
    directionalLight.position.z = 20;
    directionalLight.intensity = 5;

    //load the cube map
    var path = '/texture/'
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    var reflectionCube = new THREE2.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE2.RGBAFormat;

    scene.background = reflectionCube;

    var loader = new THREE2.TextureLoader();
    planeMaterial.map = loader.load('/texture/brick_diffuse.jpg');
    planeMaterial.bumpMap = loader.load('/texture/brick_diffuse.jpg');
    planeMaterial.roughnessMap = loader.load('/texture/brick_diffuse.jpg');
    planeMaterial.bumpScale = 0.01;
    planeMaterial.metalness = 0.7;
    planeMaterial.roughness = 0.7;
    planeMaterial.envMap = reflectionCube;

    sphereMaterial.roughnessMap = loader.load('/texture/fingerprint.jpg');
    sphereMaterial.roughness = 0.5;
    sphereMaterial.metalness = 1;
    sphereMaterial.envMap = reflectionCube;

    sphereMaterial1.roughnessMap = loader.load('/texture/fingerprint.jpg');
    sphereMaterial1.roughness = 0.5;
    sphereMaterial1.metalness = 1;
    sphereMaterial1.envMap = reflectionCube;

    sphereMaterial2.roughnessMap = loader.load('/texture/fingerprint.jpg');
    sphereMaterial2.roughness = 0.5;
    sphereMaterial2.metalness = 1;
    sphereMaterial2.envMap = reflectionCube;

    boxMaterial.normalMap = loader.load('/texture/water.jpg');
    boxMaterial.metalness = 0.1;
    boxMaterial.envMap = reflectionCube;

    icoMaterial.roughnessMap = loader.load('/texture/water.jpg');
    icoMaterial.metalness = 0.1;
    icoMaterial.envMap = reflectionCube;

    var maps = ['map', 'bumpMap', 'roughnessMap'];
    maps.forEach(function(mapName) {
        var texture = planeMaterial[mapName];
        texture.wrapS = THREE2.RepeatWrapping;
        texture.wrapT = THREE2.RepeatWrapping;
        texture.repeat.set(15, 15);
    });
    
    var folder1 = gui.addFolder('spotlight_1');
    folder1.add(lightLeft, 'intensity', 0, 10000000);
    folder1.add(lightLeft.position, 'x', -100, 100);
    folder1.add(lightLeft.position, 'y', -60, 60);
    folder1.add(lightLeft.position, 'z', -100, 100);

    var folder2 = gui.addFolder('spotlight_2');
    folder2.add(lightRight, 'intensity', 0, 10000000);
    folder2.add(lightRight.position, 'x', -100, 100);
    folder2.add(lightRight.position, 'y', -60, 60);
    folder2.add(lightRight.position, 'z', -100, 100);

    var folder3 = gui.addFolder('directional_light');
    folder3.add(directionalLight, 'intensity', 0, 10);
    folder3.add(directionalLight.position, 'x', -20, 20);
    folder3.add(directionalLight.position, 'y', -20, 20);
    folder3.add(directionalLight.position, 'z', -20, 20);
    
    var folder4 = gui.addFolder('materials');
    folder4.add(sphereMaterial, 'roughness', 0, 1);
    folder4.add(planeMaterial, 'roughness', 0, 1);
    folder4.add(sphereMaterial, 'metalness', 0, 1);
    folder4.add(planeMaterial, 'metalness', 0, 1);
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
    scene.add(lightLeft);
    scene.add(lightRight);
    scene.add(directionalLight);
    

   

   
    var controls = new THREE.OrbitControls(camera, renderer.domElement);


    animate(scene, camera, renderer, ico1);
    animate(scene, camera, renderer, ico2);
    animate(scene, camera, renderer, ico3);
    animate(scene, camera, renderer, ico4);
    animate(scene, camera, renderer, ico5);
    animate(scene, camera, renderer, ico6);

    return scene;

}



function update_1(thing) {
    thing.rotation.x += 0.01;
    thing.rotation.y += 0.1;
    thing.rotation.z += 0.01;
}

const clock=new THREE2.Clock()
const changeViewButton = document.querySelector("#change-view-button");




const loader1 = new MMDLoader();
var miku ='miku_v2.pmd';
var rin ='rin.pmd';
const helper = new MMDAnimationHelper();


function animate(scene, camera, renderer, thing) {
    update_1(thing); // Gọi hàm update() để cập nhật trạng thái của các đối tượng trong cảnh

    renderer.render(scene, camera); // Vẽ lại cảnh

    requestAnimationFrame(function () {
        animate(scene, camera, renderer, thing); // Sử dụng requestAnimationFrame để gọi lại hàm animate() ở lần kế tiếp
    });
}

function getSpotLight(intensity, color) {
    color = color === undefined ? 'rgb(255, 255, 255)' : color;
    var light = new THREE2.SpotLight(color, intensity);
    light.castShadow = true;
    light.penumbra = 0.5;

    light.shadow.mapSize.height =  2048;
    light.shadow.mapSize.width =  2048;
    light.shadow.bias = 0.001;
    return light;
}

function getDirectionalLight(intensity) {
    var light = new THREE2.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;

    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;

    return light;
}

function getBox(material, w, h, d)
{
    var geometry = new THREE2.BoxGeometry(w, h, d);
    var obj = new THREE2.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getSphere(material, size, segments)
{
    var geometry = new THREE2.SphereGeometry(size, segments, segments);
    var obj = new THREE2.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}
function getPlane(material, size)
{
    var geometry = new THREE2.PlaneGeometry(size, size);
    material.side = THREE2.DoubleSide;
    var obj = new THREE2.Mesh(geometry, material);
    obj.receiveShadow = true;
    return obj;
}

function getIcosahedron(material, size) {
    var geometry = new THREE2.IcosahedronGeometry(size);
    var mesh = new THREE2.Mesh(geometry, material);
    return mesh;
}

function getCylinder(material, r_top, r_bot, h, radial) {
    var geometry = new THREE2.CylinderGeometry(r_top, r_bot, h, radial); 
    var cylinder = new THREE2.Mesh(geometry, material );
    return cylinder
}

function getMaterial(type, color){
    var selectedMaterial;
    var materialOptions = {
        color: color === undefined ? 'rgb(255, 255, 255)' : color,
    };

    switch (type) {
        case 'basic':
            selectedMaterial = new THREE2.MeshBasicMaterial(materialOptions);
            break;
        case 'lambert':
            selectedMaterial = new THREE2.MeshLambertMaterial(materialOptions);
            break;
        case 'phong':
            selectedMaterial = new THREE2.MeshPhongMaterial(materialOptions);
            break;
        case 'standard':
            selectedMaterial = new THREE2.MeshStandardMaterial(materialOptions);
            break;
        default:
            selectedMaterial = new THREE2.MeshBasicMaterial(materialOptions);
            break;
    }
    return selectedMaterial;
}

var scene = init();


//bao 







const firstPersonCamera = new FirstPersonCamera(camera);
function animate1() {
    requestAnimationFrame(animate1); // Thêm dòng này để loop animation
   
	helper.update( clock.getDelta() );

    renderer.render(scene, camera);
    firstPersonCamera.update(clock.getDelta());
    if ( physicss !== undefined ) physicss.update( delta );
}
var button = document.getElementById("myButton");

let count=0;
// Thêm sự kiện click vào button
button.addEventListener("click", function() {
    count=count+1;
 // Assuming you have a reference to your scene called 'scene'
// Get the last object added to the scene
if(count>1)
    {
        const lastObject = scene.children[scene.children.length - 1];

        // Remove the last object from the scene
        scene.remove(lastObject);
    }


    // Thực thi một hành động nào đó khi button được click
    alert("Button clicked!");

    // Thay đổi giá trị của biến miku
    if (miku === "miku_v2.pmd") {
        miku = "rin.pmd";
    } else {
        miku = "miku_v2.pmd";
    }
    console.log(miku);


    // Load mô hình 3D mới
    loader1.loadWithAnimation(
        miku,
        "wavefile_v2.vmd",
        function(mmd) {
            helper.add(mmd.mesh, {
                animation: mmd.animation,
                physics: true
            });
 
            scene.add(mmd.mesh);
            // Lưu trữ tham chiếu đến mô hình 3D mới
            currentModel = mmd.mesh;
            // Load âm thanh
            new THREE2.AudioLoader().load(
                'examples_models_mmd_audios_wavefile_short.mp3',
                function(buffer) {
                    const listener = new THREE2.AudioListener();
                    const audio = new THREE2.Audio(listener).setBuffer(buffer);
                    listener.position.z = 1;
                    scene.add(audio);
                    scene.add(listener);
                }
            );
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log(error);
        }
    );
});


animate1();



