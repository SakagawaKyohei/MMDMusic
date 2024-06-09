import { PointerLockInputController } from './PointerLockInputController';
import * as THREE from 'three';

export class PointerLockFirstPersonCamera {
    constructor(camera, renderer) {
        this._camera = camera;
        this._input = new PointerLockInputController(renderer);
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

        const speed = 80;

        const forwardVel = (this._input.key(KEYS.w) ? 1 : 0) + (this._input.key(KEYS.s) ? -1 : 0);
        const strafeVel = (this._input.key(KEYS.a) ? 1 : 0) + (this._input.key(KEYS.d) ? -1 : 0);

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this._rotation);
        forward.normalize().multiplyScalar(forwardVel * dt * speed);

        const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(this._rotation);
        left.normalize().multiplyScalar(strafeVel * dt * speed);

        this._translation.add(forward);
        this._translation.add(left);
    }

    _updateRotation(dt) {
        const xh = this._input._current.mouseXDelta / window.innerWidth;
        const yh = this._input._current.mouseYDelta / window.innerHeight;

        const magicNumber = 5;
        this._phi += -xh * magicNumber;
        this._theta = Math.max(-Math.PI / 3, Math.min(this._theta + -yh * magicNumber, Math.PI / 3));

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
