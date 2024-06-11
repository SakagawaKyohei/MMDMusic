import * as THREE_NPM from 'three';
import * as dat from 'dat.gui';
import {PointerLockFirstPersonCamera} from './PointerLockFirstPersonCamera.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js'; 
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
//import {FirstPersonCamera} from './FirstPersonCamera.js';
var renderer = new THREE_NPM.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('dance').appendChild(renderer.domElement);

 var camera = new THREE_NPM.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        1,
        1000);

    camera.position.x = 2;
    camera.position.y = 8;
    camera.position.z = 100;

    camera.lookAt(new THREE_NPM.Vector3(0, 0, 0));
    
function init() {
    gui = new dat.GUI();
    var scene = new THREE_NPM.Scene();

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

    var reflectionCube = new THREE_NPM.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE_NPM.RGBAFormat;

    scene.background = reflectionCube;

    var loader = new THREE_NPM.TextureLoader();
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
        texture.wrapS = THREE_NPM.RepeatWrapping;
        texture.wrapT = THREE_NPM.RepeatWrapping;
        texture.repeat.set(15, 15);
    });
    
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
    scene.add(lightLeft);
    scene.add(lightRight);
    scene.add(directionalLight);
    
   
    //var controls = new THREE.OrbitControls(camera, renderer.domElement);
 

    animate(scene, camera, renderer, ico1);
    animate(scene, camera, renderer, ico2);
    animate(scene, camera, renderer, ico3);
    animate(scene, camera, renderer, ico4);
    animate(scene, camera, renderer, ico5);
    animate(scene, camera, renderer, ico6);

    return scene;

}
let gui

function init2() {
    gui = new dat.GUI();
    var scene = new THREE_NPM.Scene();




    var sphereMaterial = getMaterial('standard', 'rgb(255, 4, 255)');

    var sphereMaterial1 = getMaterial('standard', 'rgb(255, 106, 106)');

    var sphereMaterial2 = getMaterial('standard', 'rgb(255, 215, 0)');

    var sphereMaterial3 = getMaterial('standard', 'rgb(84, 255, 159)');

    var sphere = getSphere(sphereMaterial, 3, 24);

    var sphere1 = getSphere(sphereMaterial1, 3, 24);

    var sphere2 = getSphere(sphereMaterial2, 3, 24);

    var sphere3 = getSphere(sphereMaterial3, 3, 24);

    var sphere4 = getSphere(sphereMaterial1, 18, 24);



    var cyMaterial = getMaterial('standard', 'rgb(110, 127, 120)');

    var cylinder = getCylinder(cyMaterial, 20, 20, 10, 40)



    var boxMaterial = getMaterial('standard', 'rgb(27, 79, 147)');

    var boxMaterial1 = getMaterial('standard', 'rgb(255, 255, 255)');

    var boxMaterial2 = getMaterial('standard', 'rgb(238, 130, 238)');

    var boxMaterial3 = getMaterial('standard', 'rgb(255, 255, 255)');

    var box = getBox(boxMaterial, 15, 45, 15);

    var box1 = getBox(boxMaterial1, 15, 10, 15);

    var box2 = getBox(boxMaterial2, 15, 20, 15);

    var box3 = getBox(boxMaterial3, 15, 30, 15);



    var icoMaterial = getMaterial('standard', 'rgb(220, 20, 60)');

    var ico1 = getIcosahedron(icoMaterial, 4);

    var ico6 = getIcosahedron(icoMaterial, 4);

    var ico2 = getIcosahedron(icoMaterial, 4);

    var ico5 = getIcosahedron(icoMaterial, 4);

    var ico3 = getIcosahedron(icoMaterial, 4);

    var ico4 = getIcosahedron(icoMaterial, 4);



    var planeMaterial = getMaterial('standard', 'rgb(255, 255, 255)');

    var plane = getPlane(planeMaterial, 200);



    var lightLeft = getSpotLight(7000, 'rgb(255, 0, 0)');

    var lightRight = getSpotLight(7000, 'rgb(255, 255, 0)');

    var directionalLight = getDirectionalLight(10);



    sphere.position.y = sphere.geometry.parameters.radius;

    sphere.position.x = -35;

    sphere.position.z = -18;



    sphere2.position.y = 9;

    sphere2.position.x = -35;

    sphere2.position.z = -18;



    sphere1.position.x = -35;

    sphere1.position.y = 15;

    sphere1.position.z = -18;



    sphere3.position.x = -35;

    sphere3.position.y = 21;

    sphere3.position.z = -18;



    sphere4.position.x = -60;

    sphere4.position.y = sphere4.geometry.parameters.radius;

    sphere4.position.z = -90;



    plane.rotation.x = Math.PI/2;



    box.position.x = -50;

    box.position.y = 22.6;

    box.position.z = -60;



    box1.position.x = -20;

    box1.position.y = 5.2;

    box1.position.z = -60;



    box2.position.x = 20;

    box2.position.y = 10.2;

    box2.position.z = -60;



    box3.position.x = 50;

    box3.position.y = 15.1;

    box3.position.z = -60;



    cylinder.position.x = -65;

    cylinder.position.y = 6;

    cylinder.position.z = -30;



    ico1.position.x = -70;

    ico1.position.y = 6;

    ico1.position.z = 10;

    ico6.position.x = 70;

    ico6.position.y = 6;

    ico6.position.z = 10;



    ico2.position.x = -45;

    ico2.position.y = 6;

    ico2.position.z = 30;

    ico5.position.x = 45;

    ico5.position.y = 6;

    ico5.position.z = 30;



    ico3.position.x = -22;

    ico3.position.y = 6;

    ico3.position.z = 50;

    ico4.position.x = 22;

    ico4.position.y = 6;

    ico4.position.z = 50;



    

    lightLeft.position.x = -36;

    lightLeft.position.y = 10;

    lightLeft.position.z = 30;



    lightRight.position.x = 50;

    lightRight.position.y = 8;

    lightRight.position.z = -36;



    directionalLight.position.x = 9;

    directionalLight.position.y = -25;

    directionalLight.position.z = 15;

    directionalLight.intensity = 6;



    //load the cube map

    var path = '/texture/'

    var format = '.jpg';

    var urls = [

        path + 'px_2' + format, path + 'nx_2' + format,

        path + 'py_2' + format, path + 'ny_2' + format,

        path + 'pz_2' + format, path + 'nz_2' + format

    ];

    var reflectionCube = new THREE_NPM.CubeTextureLoader().load(urls);

    reflectionCube.format = THREE_NPM.RGBAFormat;



    scene.background = reflectionCube;



    var loader = new THREE_NPM.TextureLoader();

    planeMaterial.map = loader.load('/texture/checkerboard_2.jpg');

    planeMaterial.bumpMap = loader.load('/texture/checkerboard_2.jpg');

    planeMaterial.roughnessMap = loader.load('/texture/checkerboard_2.jpg');

    planeMaterial.bumpScale = 0.01;

    planeMaterial.metalness = 1;

    planeMaterial.roughness = 1;

    planeMaterial.envMap = reflectionCube;



    sphereMaterial.roughnessMap = loader.load('/texture/fingerprint_2.jpg');

    sphereMaterial.roughness = 0.06;

    sphereMaterial.metalness = 0.5;

    sphereMaterial.envMap = reflectionCube;



    sphereMaterial1.roughnessMap = loader.load('/texture/fingerprint_2.jpg');

    sphereMaterial1.roughness = 0.06;

    sphereMaterial1.metalness = 0.5;

    sphereMaterial1.envMap = reflectionCube;



    sphereMaterial2.roughnessMap = loader.load('/texture/fingerprint_2.jpg');

    sphereMaterial2.roughness = 0.06;

    sphereMaterial2.metalness = 0.5;

    sphereMaterial2.envMap = reflectionCube;



    sphereMaterial3.roughnessMap = loader.load('/texture/fingerprint_2.jpg');

    sphereMaterial3.roughness = 0.06;

    sphereMaterial3.metalness = 0.5;

    sphereMaterial3.envMap = reflectionCube;



    boxMaterial.normalMap = loader.load('/texture/glass_2.jpg');

    boxMaterial.envMap = reflectionCube;

    boxMaterial1.normalMap = loader.load('/texture/glass_2.jpg');

    boxMaterial1.envMap = reflectionCube;

    boxMaterial2.normalMap = loader.load('/texture/glass_2.jpg');

    boxMaterial2.envMap = reflectionCube;

    boxMaterial3.normalMap = loader.load('/texture/glass_2.jpg');

    boxMaterial3.envMap = reflectionCube;



    icoMaterial.roughnessMap = loader.load('/texture/water_2.jpg');

    icoMaterial.metalness = 0.1;

    icoMaterial.envMap = reflectionCube;



    var maps = ['map', 'bumpMap', 'roughnessMap'];

    maps.forEach(function(mapName) {

        var texture = planeMaterial[mapName];

        texture.wrapS = THREE_NPM.RepeatWrapping;

        texture.wrapT = THREE_NPM.RepeatWrapping;

        texture.repeat.set(15, 15);

    });

    

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

    folder4.add(planeMaterial, 'roughness', -1, 1);

    folder4.add(planeMaterial, 'metalness', -1, 1);

    folder4.open();



    scene.add(sphere);

    scene.add(sphere1);

    scene.add(sphere2);

    scene.add(sphere3);

    scene.add(sphere4);

    scene.add(box);

    scene.add(box1);

    scene.add(box2);

    scene.add(box3);

    //scene.add(cylinder);

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

    

    //var controls = new THREE.OrbitControls(camera, renderer.domElement);

    // update(renderer, scene, camera, controls);



    animate2(scene, camera, renderer, sphere4);



    animate(scene, camera, renderer, ico1);

    animate(scene, camera, renderer, ico2);

    animate(scene, camera, renderer, ico3);

    animate(scene, camera, renderer, ico4);

    animate(scene, camera, renderer, ico5);

    animate(scene, camera, renderer, ico6);



    return scene;



}

function update(renderer, scene, camera, controls) {
    renderer.render(scene, camera);

    controls.update();

    requestAnimationFrame(function() {
        update(renderer, scene, camera, controls);
    });
}

function update_1(thing) {
    thing.rotation.x += 0.01;
    thing.rotation.y += 0.1;
    thing.rotation.z += 0.01;
}

const clock=new THREE_NPM.Clock()

const loader1 = new MMDLoader();
var miku ='miku_v2.pmd';
const helper = new MMDAnimationHelper();



function animate(scene, camera, renderer, thing) {
    update_1(thing); // Gọi hàm update() để cập nhật trạng thái của các đối tượng trong cảnh

    renderer.render(scene, camera); // Vẽ lại cảnh

    requestAnimationFrame(function () {
        animate(scene, camera, renderer, thing); // Sử dụng requestAnimationFrame để gọi lại hàm animate() ở lần kế tiếp
    });
}

// Gọi hàm render

var step = 0;

function animate2(scene, camera, renderer, thing) {

  step += 0.04;

  thing.position.x = 20 + 30 * Math.cos(step);

  thing.position.y = 20 + 25 * Math.abs(Math.sin(step));

  requestAnimationFrame(function () {animate2(scene, camera, renderer, thing);});

  renderer.render(scene, camera);
  firstPersonCamera.update(clock.getDelta());

}

function getSpotLight(intensity, color) {
    color = color === undefined ? 'rgb(255, 255, 255)' : color;
    var light = new THREE_NPM.SpotLight(color, intensity);
    light.castShadow = true;
    light.penumbra = 0.5;

    light.shadow.mapSize.height =  2048;
    light.shadow.mapSize.width =  2048;
    light.shadow.bias = 0.001;
    return light;
}

function getDirectionalLight(intensity) {
    var light = new THREE_NPM.DirectionalLight(0xffffff, intensity);
    light.castShadow = true;

    light.shadow.camera.left = -10;
    light.shadow.camera.bottom = -10;
    light.shadow.camera.right = 10;
    light.shadow.camera.top = 10;

    return light;
}

function getBox(material, w, h, d)
{
    var geometry = new THREE_NPM.BoxGeometry(w, h, d);
    var obj = new THREE_NPM.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}

function getSphere(material, size, segments)
{
    var geometry = new THREE_NPM.SphereGeometry(size, segments, segments);
    var obj = new THREE_NPM.Mesh(geometry, material);
    obj.castShadow = true;
    return obj;
}
function getPlane(material, size)
{
    var geometry = new THREE_NPM.PlaneGeometry(size, size);
    material.side = THREE_NPM.DoubleSide;
    var obj = new THREE_NPM.Mesh(geometry, material);
    obj.receiveShadow = true;
    return obj;
}

function getIcosahedron(material, size) {
    var geometry = new THREE_NPM.IcosahedronGeometry(size);
    var mesh = new THREE_NPM.Mesh(geometry, material);
    return mesh;
}

function getCylinder(material, r_top, r_bot, h, radial) {
    var geometry = new THREE_NPM.CylinderGeometry(r_top, r_bot, h, radial); 
    var cylinder = new THREE_NPM.Mesh(geometry, material );
    return cylinder
}

function getMaterial(type, color){
    var selectedMaterial;
    var materialOptions = {
        color: color === undefined ? 'rgb(255, 255, 255)' : color,
    };

    switch (type) {
        case 'basic':
            selectedMaterial = new THREE_NPM.MeshBasicMaterial(materialOptions);
            break;
        case 'lambert':
            selectedMaterial = new THREE_NPM.MeshLambertMaterial(materialOptions);
            break;
        case 'phong':
            selectedMaterial = new THREE_NPM.MeshPhongMaterial(materialOptions);
            break;
        case 'standard':
            selectedMaterial = new THREE_NPM.MeshStandardMaterial(materialOptions);
            break;
        default:
            selectedMaterial = new THREE_NPM.MeshBasicMaterial(materialOptions);
            break;
    }
    return selectedMaterial;
}

var scene = init();

//bao 

let count=0;
const firstPersonCamera = new PointerLockFirstPersonCamera(camera, renderer);
function animate1() {
    requestAnimationFrame(animate1); // Thêm dòng này để loop animation
   
	helper.update( clock.getDelta() );

    renderer.render(scene, camera);
    firstPersonCamera.update(clock.getDelta());
}

let select1="pmd/miku_v2.pmd";
let select2="vmd/wavefile_v2.vmd";

document.getElementById("mySelect").addEventListener("change", function() {
    select1 = this.value;
});
document.getElementById("mySelect1").addEventListener("change", function() {
    select2 = this.value;
});

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
            //currentModel = mmd.mesh;
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
  

animate1();
