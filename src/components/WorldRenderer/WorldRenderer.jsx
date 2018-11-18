import React, { Component } from "react";
import * as THREE from "three";

import styles from "./WorldRenderer.module.scss";

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const VIEW_ANGLE = 75;
const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
const NEAR = 0.1;
const FAR = 1000;

class WorldRenderer extends Component {
  componentDidMount() {
    const $container = document.querySelector("#world-renderer");

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene = new THREE.Scene();
    $container.appendChild(this.renderer.domElement);

    this.scene.add(this.camera);

    this.camera.position.z = 5;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    this.scene.add(pointLight);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop);
  }

  renderLoop = () => {
    requestAnimationFrame(this.renderLoop);

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return <div id="world-renderer" className={styles.WorldRenderer} />;
  }
}

export default WorldRenderer;
