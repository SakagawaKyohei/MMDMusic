import {InputController} from './InputController'
import * as THREE from 'three';

export class FirstPersonCamera {
    constructor(camera) {
        this._camera = camera;
        this._input = new InputController();
        this._rotation = new THREE.Quaternion();
        this._translation = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
        this._phi = 0; 
        this._theta = 0; 
    }

    update(dt) {
        this._updateRotation(dt);
        this._updateCamera(dt);
        this._updateTranslation(dt);
        this._input.update(dt);
    }

    _updateCamera(dt) {
        //console.log(this._rotation);
        this._camera.quaternion.copy(this._rotation);
        this._camera.position.copy(this._translation);
    }

    _updateTranslation(dt) {
        const KEYS = {
            w: 87, 
            a: 65, 
            s: 83, 
            d: 68
        }; 

        // NOTE: Magic number
        const speed = 80;

        const forwardVel = (this._input.key(KEYS.w) ? 1: 0) + (this._input.key(KEYS.s) ? -1 : 0); 
        const strafeVel = (this._input.key(KEYS.a) ? 1: 0) + (this._input.key(KEYS.d) ? -1 : 0); 
        console.log(forwardVel, strafeVel);

        // Get camera's forward direction
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this._rotation);
        forward.normalize().multiplyScalar(forwardVel * dt * speed);

        // Get camera's left direction
        const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(this._rotation);
        left.normalize().multiplyScalar(strafeVel * dt * speed);

        // const qx = new THREE.Quaternion();
        // qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this._phi);
        //
        // const forward = new THREE.Vector3(0, 0, -1);
        // forward.applyQuaternion(qx);
        // forward.multiplyScalar(forwardVel * dt * speed);
        //
        // const left = new THREE.Vector3(-1, 0, 0);
        // left.applyQuaternion(qx);
        // left.multiplyScalar(strafeVel * dt * speed);

        this._translation.add(forward);
        this._translation.add(left);

        //console.log(this._translation);
    }

    _updateRotation(dt) {
        //console.log(this._camera.quaternion);
        const xh = this._input._current.mouseXDelta/window.innerWidth;
        const yh = this._input._current.mouseYDelta/window.innerHeight;
        //console.log(this._input._current.mouseXDelta, this._input._current.mouseYDelta, xh, yh);

        const magicNumber = 5;
        this._phi += -xh *magicNumber;
        //this._theta += clamp(this._theta + -yh*5, -Math.PI /3, Math.PI/3);
        this._theta = Math.max(-Math.PI /3, Math.min(this._theta + -yh*magicNumber, Math.PI/3));

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this._phi);

        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this._theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this._rotation.copy(q);
    }
}
