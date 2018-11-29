import React, { Component } from "react";
import * as THREE from "three";
import Stats from "stats-js";

import styles from "./WorldRenderer.module.scss";

// import FirstPersonControls from "first-person-controls";
// view-source:https://stemkoski.github.io/Three.js/Collision-Detection.html

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const VIEW_ANGLE = 60;
const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
const NEAR = 0.1;
const FAR = 1000;

const player = {
  height: 2.0,
  speed: 0.2,
  turnSpeed: Math.PI * 0.01
};

const tileSize = 4.0;
const mapMaxNegDepth = 1;
const levelNeg1 = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0],
  [0, 0, 1, 1, 0]
];
const level0 = [
  [1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0]
];
const level1 = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0],
  [0, 0, 1, 1, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0]
];
const mapGeometry = [levelNeg1, level0, level1];

class WorldRenderer extends Component {
  collidableMeshList = [];

  componentDidMount() {
    const $canvas = document.querySelector("#world-canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
      antialias: true
    });
    this.renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.renderer.setClearColor(0x6cc9ff, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.05);

    this.stats = new Stats();
    this.stats.setMode(0);
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.left = "0px";
    this.stats.domElement.style.top = "0px";
    document.body.appendChild(this.stats.domElement);

    // this.controls = new FirstPersonControls(this.camera);
    // this.controls.lookSpeed = 0.25;
    // this.controls.movementSpeed = 10;

    this.clock = new THREE.Clock(true);

    this.scene.add(this.camera);

    this.camera.position.set(0, player.height, 0);
    this.camera.lookAt(new THREE.Vector3(0, player.height, 5));

    // Create player collision mesh
    this.playerMesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 2.5, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    );
    this.playerMesh.position.set(0, 1.25, 0);
    this.scene.add(this.playerMesh);
    // this.collidableMeshList.push(playerMesh);

    // Bind key events
    this.keyboard = [];
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);

    this.generateMap();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop);
  }

  makeCube = (x, y, level) => {
    const cubeGroup = new THREE.Group();

    const sideFront = this.makeSideMesh(0xff00ff);
    sideFront.position.set(tileSize / 2, tileSize / 2, 0);
    sideFront.rotation.y = Math.PI / 2;
    sideFront.receiveShadow = true;
    sideFront.castShadow = true;

    const sideBack = this.makeSideMesh(0x00ffff);
    sideBack.position.set(-tileSize / 2, tileSize / 2, 0);
    sideBack.rotation.y = -Math.PI / 2;
    sideBack.receiveShadow = true;
    sideBack.castShadow = true;

    const sideTop = this.makeSideMesh(0x00ff00);
    sideTop.position.set(0, tileSize, 0);
    sideTop.rotation.x = -Math.PI / 2;
    sideTop.receiveShadow = true;
    sideTop.castShadow = true;

    const sideBottom = this.makeSideMesh(0xff0000);
    sideBottom.rotation.x = Math.PI / 2;
    sideBottom.receiveShadow = true;
    sideBottom.castShadow = true;

    const sideLeft = this.makeSideMesh(0xffff00);
    sideLeft.rotation.x = Math.PI;
    sideLeft.position.set(0, tileSize / 2, -tileSize / 2);
    sideLeft.receiveShadow = true;
    sideLeft.castShadow = true;

    const sideRight = this.makeSideMesh(0x0000ff);
    sideRight.position.set(0, tileSize / 2, tileSize / 2);
    sideRight.receiveShadow = true;
    sideRight.castShadow = true;

    cubeGroup.add(sideFront);
    cubeGroup.add(sideBack);
    cubeGroup.add(sideTop);
    cubeGroup.add(sideBottom);
    cubeGroup.add(sideLeft);
    cubeGroup.add(sideRight);

    cubeGroup.position.set(x * tileSize, level * tileSize, y * tileSize);
    return cubeGroup;
  };

  makeSideMesh = (color = 0xffffff) => {
    return new THREE.Mesh(
      new THREE.PlaneBufferGeometry(tileSize, tileSize, 10, 10),
      new THREE.MeshLambertMaterial({
        color,
        wireframe: false
        // side: THREE.DoubleSide
      })
    );
  };

  generateMap = () => {
    const map = new THREE.Group();
    for (let level = 0; level < mapGeometry.length; level += 1) {
      for (let x = 0; x < mapGeometry[level].length; x += 1) {
        for (let y = 0; y < mapGeometry[level][0].length; y += 1) {
          if (mapGeometry[level][x][y] === 1) {
            const cube = this.makeCube(x, y, level - mapMaxNegDepth);
            map.add(cube);
          }
        }
      }
    }
    const mS = new THREE.Matrix4().identity();
    mS.elements[0] = -1;
    map.applyMatrix(mS);
    map.rotation.y = -Math.PI / 2;
    map.position.x = (mapGeometry[0][0].length * tileSize) / 2;
    map.position.z = mapGeometry[0][0].length * tileSize - tileSize / 2;
    this.scene.add(map);

    // Cube
    const geometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      wireframe: false
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, 1.5, 5);
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    // // Point Light
    // const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    // pointLight.position.set(0, 5, 5);
    // pointLight.castShadow = true;
    // pointLight.shadow.mapSize.width = 2048;
    // pointLight.shadow.mapSize.height = 2048;
    // pointLight.shadow.camera.near = 0.5;
    // pointLight.shadow.camera.far = 500;
    // this.scene.add(pointLight);

    // Sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(-40, 60, -25);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.distance = 0;
    directionalLight.intensity = 1;
    directionalLight.shadow.mapSize.height = 16384;
    directionalLight.shadow.mapSize.width = 16384;
    this.scene.add(directionalLight);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0x6cc9ff, 0.5);
    this.scene.add(ambientLight);
  };

  keyDown = event => {
    this.keyboard[event.keyCode] = true;
  };

  keyUp = event => {
    this.keyboard[event.keyCode] = false;
  };

  renderLoop = () => {
    this.stats.begin();
    requestAnimationFrame(this.renderLoop);

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    if (this.keyboard[87] || this.keyboard[38]) {
      // W / UP
      this.camera.position.x -= Math.sin(this.camera.rotation.y) * player.speed;
      this.camera.position.z += Math.cos(this.camera.rotation.y) * player.speed;
    }
    if (this.keyboard[83] || this.keyboard[40]) {
      // S / DOWN
      this.camera.position.x += Math.sin(this.camera.rotation.y) * player.speed;
      this.camera.position.z -= Math.cos(this.camera.rotation.y) * player.speed;
    }
    if (this.keyboard[65]) {
      // A
      this.camera.position.x +=
        Math.sin(this.camera.rotation.y + Math.PI / 2) * player.speed;
      this.camera.position.z -=
        Math.cos(this.camera.rotation.y + Math.PI / 2) * player.speed;
    }
    if (this.keyboard[68]) {
      // D
      this.camera.position.x +=
        Math.sin(this.camera.rotation.y - Math.PI / 2) * player.speed;
      this.camera.position.z -=
        Math.cos(this.camera.rotation.y - Math.PI / 2) * player.speed;
    }
    if (this.keyboard[37]) {
      // LEFT
      this.camera.rotation.y -= Math.PI * player.turnSpeed;
    }
    if (this.keyboard[39]) {
      // RIGHT
      this.camera.rotation.y += Math.PI * player.turnSpeed;
    }

    // this.controls.update(this.clock.getDelta());

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  };

  render() {
    return <canvas id="world-canvas" className={styles.WorldCanvas} />;
  }
}

export default WorldRenderer;
