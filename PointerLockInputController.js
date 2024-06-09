export class PointerLockInputController {
    constructor(renderer) {
        this._renderer = renderer;
        this.pointerLock = false;
        this._initialize();
    }

    _initialize() {
        this._current = {
            leftButton: false, 
            rightButton: false, 
            mouseX: 0,
            mouseY: 0,
            mouseXDelta: 0, 
            mouseYDelta: 0, 
        }

        this._previous = null;

        this._keys = {};
        this._previousKeys = {};

        this._renderer.domElement.addEventListener('click', () => {
            this._renderer.domElement.requestPointerLock();
        });

        document.addEventListener("mousedown", (e) => this._onMouseDown(e), false);
        document.addEventListener("mouseup", (e) => this._onMouseUp(e), false);
        document.addEventListener("mousemove", (e) => this._onMouseMove(e), false);
        document.addEventListener("keyup", (e) => this._onKeyUp(e), false);
        document.addEventListener("keydown", (e) => this._onKeyDown(e), false);
        document.addEventListener('pointerlockchange', () => this._onPointerLockChange(), false);
    }

    _onPointerLockChange() {
        if (document.pointerLockElement === this._renderer.domElement) {
            this.pointerLock = true;
            console.log('Pointer locked');
        } else {
            console.log('Pointer unlocked');
            this.pointerLock = false;
        }
    }

    _onMouseDown(event) {
        if(!this.pointerLock) return;
        switch(event.button) {
            case 0: {
                this._current.leftButton = true; 
                break;
            } 
            case 1: {
                this._current.rightButton = true; 
                break;
            } 
        }
    }
    
    _onMouseUp(event) {
        if(!this.pointerLock) return;
        switch(event.button) {
            case 0: {
                this._current.leftButton = false; 
                break;
            } 
            case 1: {
                this._current.rightButton = false; 
                break;
            } 
        }
    }

    _onMouseMove(event) {
        if(!this.pointerLock) return;
        if (document.pointerLockElement === this._renderer.domElement) {
            this._current.mouseXDelta = event.movementX || 0;
            this._current.mouseYDelta = event.movementY || 0;
        } else {
            this._current.mouseX = event.pageX - window.innerWidth / 2;
            this._current.mouseY = event.pageY - window.innerHeight / 2;
            if (this._previous === null) {
                this._previous = {...this._current};
            }
            this._current.mouseXDelta = this._current.mouseX - this._previous.mouseX; 
            this._current.mouseYDelta = this._current.mouseY - this._previous.mouseY; 
        }
    }

    _onKeyUp(event) {
        if(!this.pointerLock) return;
        this._keys[event.keyCode] = false;
        if (event.key === 'Control') {
            document.exitPointerLock();
        }
    }

    _onKeyDown(event) {
        if(!this.pointerLock) return;
        this._keys[event.keyCode] = true;
    }

    key(keyCode) {
        return this._keys[keyCode] || false;
    }

    update(dt) {
        this._current.mouseXDelta = 0;
        this._current.mouseYDelta = 0;
        this._previous = {...this._current};
        this._previousKeys = {...this._keys};
    }
}

