import React, { Component } from "react";
import * as THREE from "three";
import Stats from "stats-js";

import styles from "./WorldRenderer.module.scss";

// import FirstPersonControls from "first-person-controls";

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const VIEW_ANGLE = 90;
const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
const NEAR = 0.1;
const FAR = 1000;

const player = {
  height: 2.0,
  speed: 0.2,
  turnSpeed: Math.PI * 0.01
};

const tileSize = 4.0;
const mapFloor = [[1, 1, 1, 1], [0, 0, 0, 1], [0, 0, 0, 1]];
const mapWall = [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0]];

class WorldRenderer extends Component {
  componentDidMount() {
    const $canvas = document.querySelector("#world-canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
      antialias: false
    });
    this.renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.renderer.setClearColor(0x2a5263, 1.0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene = new THREE.Scene();

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

    this.camera.position.set(0, player.height, -5);
    this.camera.lookAt(new THREE.Vector3(0, player.height, 0));

    // Bind key events
    this.keyboard = [];
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);

    this.generateMap();
    this.generateCustomCube();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop);
  }

  generateCustomCube = () => {
    const cubeGroup = new THREE.Group();

    const sideFront = this.makeSideMesh(0xffff00);
    sideFront.position.set(0, tileSize / 2, -tileSize / 2);

    const sideBottom = this.makeSideMesh(0xff0000);
    sideBottom.rotation.x = Math.PI / 2;

    const sideTop = this.makeSideMesh(0x00ff00);
    sideTop.position.set(0, tileSize, 0);
    sideTop.rotation.x = Math.PI / 2;

    const sideBack = this.makeSideMesh(0x0000ff);
    sideBack.position.set(0, tileSize / 2, tileSize / 2);

    cubeGroup.add(sideFront);
    cubeGroup.add(sideBottom);
    cubeGroup.add(sideTop);
    cubeGroup.add(sideBack);

    cubeGroup.position.set(-5, 0, 0);
    this.scene.add(cubeGroup);
  };

  makeSideMesh = (color = 0xffffff) => {
    return new THREE.Mesh(
      new THREE.PlaneBufferGeometry(tileSize, tileSize, 1, 1),
      new THREE.MeshLambertMaterial({
        color,
        wireframe: false,
        side: THREE.DoubleSide
      })
    );
  };

  generateMap = () => {
    for (let x = 0; x < mapFloor.length; x += 1) {
      for (let y = 0; y < mapFloor[0].length; y += 1) {
        if (mapFloor[x][y] === 1) {
          // Floor
          const meshFloor = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(tileSize, tileSize, 1, 1),
            new THREE.MeshLambertMaterial({ color: 0x00ffff, wireframe: false })
          );
          meshFloor.position.set(x * tileSize, 0, y * tileSize);
          meshFloor.rotation.x = -Math.PI / 2;
          meshFloor.receiveShadow = true;
          this.scene.add(meshFloor);
        }
      }
    }

    for (let x = 0; x < mapWall.length; x += 1) {
      for (let y = 0; y < mapWall[0].length; y += 1) {
        if (mapWall[x][y] === 1) {
          // Wall
          const meshWall = new THREE.Mesh(
            new THREE.BoxBufferGeometry(tileSize, tileSize, tileSize),
            new THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: false })
          );
          meshWall.position.set(x * tileSize, tileSize / 2, y * tileSize);
          meshWall.rotation.x = -Math.PI / 2;
          meshWall.receiveShadow = true;
          const faces = meshWall.geometry;
          console.log(faces);
          this.scene.add(meshWall);
        }
      }
    }

    // Cube
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      wireframe: false
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.y = 1.5;
    this.cube.castShadow = true;
    this.scene.add(this.cube);

    // Point Light
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 5, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 500;
    this.scene.add(pointLight);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
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
