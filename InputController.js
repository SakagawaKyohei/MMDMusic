export class InputController {
    constructor() {
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

        document.addEventListener("mousedown", (e) => this._onMouseDown(e), false);
        document.addEventListener("mouseup", (e) => this._onMouseUp(e), false);
        document.addEventListener("mousemove", (e) => this._onMouseMove(e), false);
        document.addEventListener("keyup", (e) => this._onkeyUp(e), false);
        document.addEventListener("keydown", (e) => this._onkeyDown(e), false);
    }

    _onMouseDown(event) {
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
        this._current.mouseX = event.pageX - window.innerWidth/2;
        this._current.mouseY = event.pageY - window.innerHeight/2;
        if(this._previous === null) {
            this._previous = {...this._current};
        }

        this._current.mouseXDelta = this._current.mouseX - this._previous.mouseX; 
        this._current.mouseYDelta = this._current.mouseY - this._previous.mouseY; 
    }

    _onkeyUp(event) {
        this._keys[event.keyCode] = false;
    }

    _onkeyDown(event) {
        this._keys[event.keyCode] = true;
    }

    key(keyCode) {
        return this._keys[keyCode];
    }

    update(dt) {
        this._current.mouseXDelta = 0;
        this._current.mouseYDelta = 0;
        this._previous = {...this._current};

        //this._keys[event.keyCode] = false;
        this._previousKeys = {...this._keys};
    }
}
