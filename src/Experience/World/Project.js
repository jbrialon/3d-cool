import * as THREE from "three/webgpu";
import {
  texture,
  uniform,
  Fn,
  time,
  cos,
  sin,
  positionLocal,
  vec3,
} from "three/tsl";

import Experience from "../Experience";
import Tile from "./Tile";

export default class Project {
  constructor() {
    this.experience = new Experience();
    this.tile = new Tile();

    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.inputEvents = this.experience.inputEvents;
    this.resources = this.experience.resources;

    // Mouse position (normalized 0-1)
    this.mouse = { x: 0.5, y: 0.5 };

    // Tilt settings
    this.tiltAmount = 0.15;
    this.tiltSmoothing = 0.05;

    // Parallax settings for planeMeshes
    this.parallaxAmount = 0.08;
    this.parallaxSmoothing = 0.03;
    this.parallax = { x: 0, y: 0 };
    this.parallaxTwo = { x: 0, y: 0 };

    // resources
    this.photoOne = this.resources.items.photoOne;
    this.photoOne.colorSpace = THREE.SRGBColorSpace;
    this.photoTwo = this.resources.items.photoTwo;
    this.photoTwo.colorSpace = THREE.SRGBColorSpace;

    // Setup
    this.initEvents();
    this.setObject();

    // Debug
    this.setDebug();
  }

  initEvents() {
    this.inputEvents.on("mousemove", this.onMouseMove.bind(this));
  }

  onMouseMove() {
    this.mouse.x = this.inputEvents.mouse.x / this.sizes.width;
    this.mouse.y = this.inputEvents.mouse.y / this.sizes.height;
  }

  setObject() {
    this.project = new THREE.Group();

    const uRadiusX = uniform(0.025);
    const uRadiusY = uniform(0.05);

    const makeFloating = (offsetVal) => {
      const uOffset = uniform(offsetVal);
      return Fn(() => {
        const pos = positionLocal.toVar();
        const animTime = time.mul(0.8).add(uOffset);
        const floatX = pos.x.add(cos(animTime).mul(uRadiusX));
        const floatY = pos.y.add(sin(animTime).mul(uRadiusY));
        return vec3(floatX, floatY, pos.z);
      })();
    };

    const planeMaterial = new THREE.NodeMaterial();
    planeMaterial.fragmentNode = texture(this.photoOne);
    planeMaterial.positionNode = makeFloating(0);
    planeMaterial.transparent = true;
    planeMaterial.side = THREE.DoubleSide;

    const img = this.photoOne.image;
    const aspect = img.width / img.height;
    const planeHeight = 0.5;
    const planeWidth = planeHeight * aspect;
    this.planeSize = { w: planeWidth, h: planeHeight };

    this.planeGeometry = new THREE.PlaneGeometry();
    this.planeMesh = new THREE.Mesh(this.planeGeometry, planeMaterial);
    this.planeMesh.scale.set(planeWidth, planeHeight, 1);

    const planeMaterialTwo = new THREE.NodeMaterial();
    planeMaterialTwo.fragmentNode = texture(this.photoTwo);
    planeMaterialTwo.positionNode = makeFloating(1.5);
    planeMaterialTwo.transparent = true;
    planeMaterialTwo.side = THREE.DoubleSide;

    const imgTwo = this.photoTwo.image;
    const aspectTwo = imgTwo.width / imgTwo.height;
    const planeHeightTwo = 0.5;
    const planeWidthTwo = planeHeightTwo * aspectTwo;
    this.planeSizeTwo = { w: planeWidthTwo, h: planeHeightTwo };

    this.planeMeshTwo = new THREE.Mesh(this.planeGeometry, planeMaterialTwo);
    this.planeMeshTwo.scale.set(planeWidthTwo, planeHeightTwo, 1);

    this.project.add(this.tile);
    this.project.add(this.planeMesh);
    this.project.add(this.planeMeshTwo);
    this.scene.add(this.project);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder({
        title: "Project",
      });
    }
  }

  update() {
    this.tile.update();

    // Parallax offset for planeMesh
    const targetParallaxX = (this.mouse.x - 0.5) * this.parallaxAmount;
    const targetParallaxY = -(this.mouse.y - 0.5) * this.parallaxAmount;
    this.parallax.x +=
      (targetParallaxX - this.parallax.x) * this.parallaxSmoothing;
    this.parallax.y +=
      (targetParallaxY - this.parallax.y) * this.parallaxSmoothing;

    const halfW = this.tile.scale.x / 2;
    const halfH = this.tile.scale.y / 2;

    this.planeMesh.position.set(
      halfW + this.parallax.x,
      halfH + this.parallax.y,
      0.07,
    );

    const targetParallaxTwoX = (this.mouse.x - 0.5) * this.parallaxAmount;
    const targetParallaxTwoY = -(this.mouse.y - 0.5) * this.parallaxAmount;
    this.parallaxTwo.x +=
      (targetParallaxTwoX - this.parallaxTwo.x) * this.parallaxSmoothing;
    this.parallaxTwo.y +=
      (targetParallaxTwoY - this.parallaxTwo.y) * this.parallaxSmoothing;

    this.planeMeshTwo.position.set(
      -halfW + this.parallaxTwo.x,
      -halfH + this.parallaxTwo.y,
      0.005,
    );

    const targetY = (this.mouse.x - 0.5) * 2 * this.tiltAmount;
    const targetX = (this.mouse.y - 0.5) * 2 * this.tiltAmount;

    this.project.rotation.y +=
      (targetY - this.project.rotation.y) * this.tiltSmoothing;
    this.project.rotation.x +=
      (targetX - this.project.rotation.x) * this.tiltSmoothing;
  }
}
