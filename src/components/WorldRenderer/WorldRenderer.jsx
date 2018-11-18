import React, { Component } from "react";
import * as THREE from "three";

// Set the scene size.
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

// Set some camera attributes.
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

    // Add the camera to the scene.
    this.scene.add(this.camera);

    // Set up the sphere vars
    const RADIUS = 50;
    const SEGMENTS = 16;
    const RINGS = 16;

    // create the sphere's material
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0xcc0000
    });

    // Create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS),

      sphereMaterial
    );

    // Move the Sphere back in Z so we
    // can see it.
    sphere.position.z = -300;

    // Finally, add the sphere to the scene.
    this.scene.add(sphere);

    // create a point light
    const pointLight = new THREE.PointLight(0xffffff);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    this.scene.add(pointLight);

    // Draw!
    this.renderer.render(this.scene, this.camera);

    // Schedule the first frame.
    requestAnimationFrame(this.renderLoop);
  }

  renderLoop = () => {
    // Draw!
    this.renderer.render(this.scene, this.camera);

    // Schedule the next frame.
    requestAnimationFrame(this.renderLoop);
  };

  render() {
    return <div id="world-renderer" />;
  }
}

export default WorldRenderer;
