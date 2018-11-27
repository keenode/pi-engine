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
  height: 1.0,
  speed: 0.2,
  turnSpeed: Math.PI * 0.01
};

class WorldRenderer extends Component {
  componentDidMount() {
    const $canvas = document.querySelector("#world-canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: $canvas,
      antialias: false
    });
    this.renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.renderer.setClearColor(0x2a5263, 1.0);
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

    // Floor
    const meshFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10, 10, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: false })
    );
    meshFloor.rotation.x = -Math.PI / 2;
    this.scene.add(meshFloor);

    // Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.y = 1;
    this.scene.add(this.cube);

    // Point Light
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(0, 5, 0);
    this.scene.add(pointLight);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop);

    // Bind key events
    this.keyboard = [];
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
  }

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
