import {InputController} from './InputController'
import * as THREE from 'three';

export class FirstPersonCamera {
    constructor(camera) {
        this._camera = camera;
        this._input = new InputController();
        this._rotation = new THREE.Quaternion();
        this._phi = 0; 
        this._theta = 0; 
    }

    update(dt) {
        this._updateRotation(dt);
        this._updateCamera();
    }

    _updateCamera() {
        //console.log(this._rotation);
        this._camera.quaternion.copy(this._rotation);
    }

    _updateRotation(dt) {
        //console.log(this._camera.quaternion);
        const xh = this._input._current.mouseXDelta/window.innerWidth;
        const yh = this._input._current.mouseYDelta/window.innerHeight;
        //console.log(this._input._current.mouseXDelta, this._input._current.mouseYDelta, xh, yh);

        this._phi += -xh *5;
        //this._theta += clamp(this._theta + -yh*5, -Math.PI /3, Math.PI/3);
        this._theta = Math.max(-Math.PI /3, Math.min(this._theta + -yh*5, Math.PI/3));

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this._phi);

        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this._theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this._rotation.copy(q);
        this._phi = 0;
        this._theta = 0;
    }
}
