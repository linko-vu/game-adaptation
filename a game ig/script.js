AFRAME.registerComponent('click-listener', {
  schema: {
    // Define any properties for the component
  },
  init: function () {
    const el = this.el;

    el.addEventListener('model-loaded', () => {
      const mesh = el.getObject3D('mesh');
      if (!mesh) return;

      mesh.traverse((node) => {
        console.log('Mesh name:', node.name);
        if (node.name === 'Cube1') {
          node.userData.clickable = true;
          console.log('Target mesh found!');
        }
      });
    });

    el.addEventListener('click', (evt) => {
      console.log('Entity clicked');

      const intersection = evt.detail.intersection;
      if (!intersection) {
        console.log('No intersection data');
        return;
      }

      const obj = intersection.object;
      console.log('Hit object:', obj.name);
      if (obj.name === 'Cube1') {
        console.log('clicked');
        const msg = document.querySelector('#message');
        msg.setAttribute('visible', 'true');
        setTimeout(() => {
          msg.setAttribute('visible', false);
        }, 2000);
      }
    });
  }
});

AFRAME.registerComponent('character-interaction', {
  schema: {
    character: { type: 'string', default: 'npc9' },
    message: { type: 'string', default: 'Hello there!' },
    character2: { type: 'string', default: 'npc3' },
    message2: { type: 'string', default: 'Hello there!' },
    character3: { type: 'string', default: 'npc5' },
    message3: { type: 'string', default: 'Hello there!' },
    character4: { type: 'string', default: 'npc6' },
    message4: { type: 'string', default: 'Hello there!' },
    character5: { type: 'string', default: 'npc4' },
    message5: { type: 'string', default: 'Hello there!' }
  },
  init: function () {
    this.character = null;
    this.character2 = null;
    this.character3 = null;
    this.character4 = null;
    this.character5 = null;
    this.bubbles = [];
    this.hideTimer = null;
    this.cameraPosition = new THREE.Vector3();
    this.cameraQuaternion = new THREE.Quaternion();
    this.findCharacter = () => {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh) return;

      mesh.traverse((node) => {
        const name = node.name.trim().toLowerCase();
        if (name === this.data.character.toLowerCase()) {
          this.character = node;
        }
        if (name === this.data.character2.toLowerCase()) {
          this.character2 = node;
        }
        if (name === this.data.character3.toLowerCase()) {
          this.character3 = node;
        }
        if (name === this.data.character4.toLowerCase()) {
          this.character4 = node;
        }
        if (name === this.data.character5.toLowerCase()) {
          this.character5 = node;
        }
      });
    };

    this.el.addEventListener('model-loaded', this.findCharacter);
    this.el.addEventListener('click', (event) => {
      if (!event.detail.intersection) return;

      let object = event.detail.intersection.object;
      while (object) {
        if (object === this.character) {
          this.showBubble(this.character, this.bubbles[0]);
          return;
        }
        if (object === this.character2) {
          this.showBubble(this.character2, this.bubbles[1]);
          return;
        }
        if (object === this.character3) {
          this.showBubble(this.character3, this.bubbles[2]);
          return;
        }
        if (object === this.character4) {
          this.showBubble(this.character4, this.bubbles[3]);
          return;
        }
        if (object === this.character5) {
          this.showBubble(this.character5, this.bubbles[4]);
          return;
        }
        object = object.parent;
      }
    });

    this.createBubble(this.data.message, 'npc9');
    this.createBubble(this.data.message2, 'npc3');
    this.createBubble(this.data.message3, 'npc5');
    this.createBubble(this.data.message4, 'npc6');
    this.createBubble(this.data.message5, 'npc4');
  },
  createBubble: function (message, id) {
    const bubble = document.createElement('a-entity');
    bubble.setAttribute('visible', 'false');
    bubble.setAttribute('scale', '0.2 0.2 0.2');

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 220;
    canvas.id = `${id}-speech-bubble`;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fffaf0';
    context.beginPath();
    context.roundRect(12, 12, 488, 155, 38);
    context.moveTo(115, 165);
    context.quadraticCurveTo(105, 202, 68, 210);
    context.quadraticCurveTo(130, 205, 158, 165);
    context.fill();
    document.body.appendChild(canvas);

    const background = document.createElement('a-plane');
    background.setAttribute('material', `src: #${id}-speech-bubble; shader: flat; side: double; transparent: true`);
    background.setAttribute('width', '2.5');
    background.setAttribute('height', '0.65');

    const text = document.createElement('a-text');
    text.setAttribute('value', message.replace(/\\n/g, '\n'));
    text.setAttribute('align', 'center');
    text.setAttribute('anchor', 'center');
    text.setAttribute('baseline', 'center');
    text.setAttribute('color', '#263326');
    text.setAttribute('width', '2.15');
    text.setAttribute('wrap-count', '24');
    text.setAttribute('line-height', '55');
    text.setAttribute('position', '0 0 0.08');

    bubble.appendChild(background);
    bubble.appendChild(text);
    this.el.sceneEl.appendChild(bubble);
    this.bubbles.push(bubble);
  },
  showBubble: function (character, bubble) {
    if (!bubble || !character) return;

    const bounds = new THREE.Box3().setFromObject(character);
    const position = bounds.getCenter(new THREE.Vector3());
    position.y = bounds.max.y + 0.15;
    bubble.object3D.position.copy(position);
    bubble.setAttribute('visible', 'true');

    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      bubble.setAttribute('visible', 'false');
    }, 4000);
  },
  tick: function () {
    const camera = this.el.sceneEl.querySelector('[camera]');
    if (!camera) return;

    camera.object3D.getWorldPosition(this.cameraPosition);
    camera.object3D.getWorldQuaternion(this.cameraQuaternion);
    this.bubbles.forEach((bubble) => {
      if (bubble.object3D.visible) {
        bubble.object3D.quaternion.copy(this.cameraQuaternion);
      }
    });
  },
  remove: function () {
    this.el.removeEventListener('model-loaded', this.findCharacter);
    clearTimeout(this.hideTimer);
    this.bubbles.forEach((bubble) => bubble.remove());
    ['npc9', 'npc3', 'npc5', 'npc6', 'npc4'].forEach((id) => {
      const canvas = document.querySelector(`#${id}-speech-bubble`);
      if (canvas) canvas.remove();
    });
  }
});

AFRAME.registerComponent('hide-ground', {
  init: function () {
    this.el.addEventListener('model-loaded', () => {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh) {
        console.error('Unable to hide original ground: model mesh was not found.');
        return;
      }

      mesh.traverse((node) => {
        if (node.name.trim().toLowerCase() === 'da ground') {
          node.visible = false;
          node.traverse((child) => {
            child.visible = false;
          });
        }
      });
    });
  }
});

AFRAME.registerComponent('vr-movement', {
  schema: {
    speed: { type: 'number', default: 0.04 },
    keyboardSpeed: { type: 'number', default: 0.04 },
    minX: { type: 'number', default: -8 },
    maxX: { type: 'number', default: 8 },
    minZ: { type: 'number', default: -8 },
    maxZ: { type: 'number', default: 6 }
  },
  init: function () {
    this.keys = new Set();
    this.camera = null;
    this.handleKeyDown = (event) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        this.keys.add(event.code);
        event.preventDefault();
      }
    };
    this.handleKeyUp = (event) => {
      this.keys.delete(event.code);
    };
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.moveFromThumbstick = (event) => {
      const x = event.detail.x || 0;
      const z = -(event.detail.y || 0);
      const camera = this.camera || this.el.sceneEl.querySelector('[camera]');
      if (!camera) return;

      const forward = new THREE.Vector3();
      camera.object3D.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);
      const position = this.el.object3D.position;

      position.x = THREE.MathUtils.clamp(
        position.x + (right.x * x + forward.x * z) * this.data.speed,
        this.data.minX,
        this.data.maxX
      );
      position.z = THREE.MathUtils.clamp(
        position.z + (right.z * x + forward.z * z) * this.data.speed,
        this.data.minZ,
        this.data.maxZ
      );
    };

    this.el.sceneEl.addEventListener('loaded', () => {
      this.camera = this.el.sceneEl.querySelector('[camera]');
      this.el.sceneEl.querySelectorAll('[laser-controls]').forEach((controller) => {
        controller.addEventListener('thumbstickmoved', this.moveFromThumbstick);
      });
    });
  },
  tick: function () {
    const position = this.el.object3D.position;
    const camera = this.camera || this.el.sceneEl.querySelector('[camera]');
    if (!camera) return;

    const forward = new THREE.Vector3();
    camera.object3D.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    let deltaX = 0;
    let deltaZ = 0;

    if (this.keys.has('KeyA')) {
      deltaX += right.x * this.data.keyboardSpeed;
      deltaZ += right.z * this.data.keyboardSpeed;
    }
    if (this.keys.has('KeyD')) {
      deltaX -= right.x * this.data.keyboardSpeed;
      deltaZ -= right.z * this.data.keyboardSpeed;
    }
    if (this.keys.has('KeyW')) {
      deltaX -= forward.x * this.data.keyboardSpeed;
      deltaZ -= forward.z * this.data.keyboardSpeed;
    }
    if (this.keys.has('KeyS')) {
      deltaX += forward.x * this.data.keyboardSpeed;
      deltaZ += forward.z * this.data.keyboardSpeed;
    }

    position.x += deltaX;
    position.z += deltaZ;
    position.x = THREE.MathUtils.clamp(position.x, this.data.minX, this.data.maxX);
    position.z = THREE.MathUtils.clamp(position.z, this.data.minZ, this.data.maxZ);
  },
  remove: function () {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.el.sceneEl.querySelectorAll('[laser-controls]').forEach((controller) => {
      controller.removeEventListener('thumbstickmoved', this.moveFromThumbstick);
    });
  }
});

AFRAME.registerComponent('terrain-follow', {
  schema: {
    eyeHeight: { type: 'number', default: 0.55 },
    smoothing: { type: 'number', default: 0.2 }
  },
  init: function () {
    this.raycaster = new THREE.Raycaster();
    this.rayOrigin = new THREE.Vector3();
    this.rayDirection = new THREE.Vector3(0, -1, 0);
    this.terrain = null;
    this.handleTerrainLoaded = () => {
      this.terrain = this.el.sceneEl.querySelector('#landscape-ground');
    };

    this.el.sceneEl.addEventListener('loaded', this.handleTerrainLoaded);
  },
  tick: function () {
    if (!this.terrain) {
      this.terrain = this.el.sceneEl.querySelector('#landscape-ground');
    }

    if (!this.terrain || !this.terrain.getObject3D('mesh')) return;

    const position = this.el.object3D.position;
    this.rayOrigin.set(position.x, position.y + 10, position.z);
    this.raycaster.set(this.rayOrigin, this.rayDirection);
    const intersections = this.raycaster.intersectObject(this.terrain.object3D, true);
    if (!intersections.length) return;

    const targetY = intersections[0].point.y + this.data.eyeHeight;
    position.y += (targetY - position.y) * this.data.smoothing;
  },
  remove: function () {
    this.el.sceneEl.removeEventListener('loaded', this.handleTerrainLoaded);
  }
});

AFRAME.registerComponent('grounded', {
  init: function () {
    this.el.addEventListener('model-loaded', () => {
      const mesh = this.el.getObject3D('mesh');
      if (!mesh) {
        console.error('Unable to ground model: mesh was not found.');
        return;
      }

      const bounds = new THREE.Box3().setFromObject(mesh);
      this.el.object3D.position.y -= bounds.min.y;

      const cameraRig = this.el.sceneEl.querySelector('#camera-rig');
      if (cameraRig) {
        cameraRig.object3D.position.set(0, 0.55, -4.2);
        cameraRig.object3D.rotation.set(
          THREE.MathUtils.degToRad(-1.9),
          THREE.MathUtils.degToRad(174.1),
          THREE.MathUtils.degToRad(-0.9)
        );
      }
    });
  }
});

AFRAME.registerComponent('expand-landscape', {
  schema: {
    scale: { type: 'number', default: 2.5 }
  },
  init: function () {
    this.el.addEventListener('model-loaded', () => {
      this.el.object3D.scale.x = this.data.scale;
      this.el.object3D.scale.z = this.data.scale;
    });
  }
});
