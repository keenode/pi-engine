import React, { Component } from "react";
import * as THREE from "three";
import Stats from "stats-js";

import styles from "./WorldRenderer.module.scss";

import FirstPersonControls from "first-person-controls";

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const VIEW_ANGLE = 75;
const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
const NEAR = 0.1;
const FAR = 1000;

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

    this.controls = new FirstPersonControls(this.camera);
    this.controls.lookSpeed = 0.25;
    this.controls.movementSpeed = 10;

    this.clock = new THREE.Clock(true);

    this.scene.add(this.camera);

    // this.camera.position.z = 10;

    // Cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Buffer Plane
    const geometry2 = new THREE.PlaneBufferGeometry(1, 1, 1);
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geometry2, material2);
    plane.position.z = 2;
    this.scene.add(plane);

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    this.scene.add(pointLight);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop);
  }

  renderLoop = () => {
    this.stats.begin();
    requestAnimationFrame(this.renderLoop);

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.controls.update(this.clock.getDelta());

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  };

  render() {
    return <canvas id="world-canvas" className={styles.WorldCanvas} />;
  }
}

export default WorldRenderer;
