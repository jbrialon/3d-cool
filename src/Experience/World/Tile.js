import * as THREE from "three/webgpu";
import Experience from "../Experience";

import {
  texture,
  uv,
  Fn,
  time,
  fract,
  sin,
  dot,
  screenCoordinate,
  vec2,
  positionLocal,
  uniform,
  cos,
  vec3,
} from "three/tsl";

export default class Tile extends THREE.Mesh {
  constructor() {
    const experience = new Experience();
    const debug = experience.debug;

    // Video setup
    const video = document.createElement("video");
    video.src = "/video/video.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play();

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    const videoTexture = new THREE.CanvasTexture(canvas);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    // Material
    const material = new THREE.NodeMaterial();

    const fragmentShader = Fn(() => {
      const fragCoord = screenCoordinate.xy;

      const grain = fract(
        sin(dot(fragCoord.add(time.mul(0.0002)), vec2(12.9898, 78.233))).mul(
          43758.5453,
        ),
      );
      const grainAdjusted = grain.sub(0.5).mul(0.1);
      const videoTex = texture(videoTexture, uv());
      const finalColor = videoTex.add(grainAdjusted);

      return finalColor;
    });

    material.fragmentNode = fragmentShader();
    material.transparent = true;
    material.side = THREE.DoubleSide;

    // Vertex Shader
    const uOffset = uniform(0); // Time offset for floating animation
    const uRadiusX = uniform(0.025); // Horizontal floating radius
    const uRadiusY = uniform(0.05); // Vertical floating radius

    // Floating animation - translates the entire mesh
    const floatingAnimation = Fn(() => {
      const pos = positionLocal.toVar();

      const animTime = time.mul(0.8).add(uOffset);
      const offsetX = cos(animTime).mul(uRadiusX);
      const offsetY = sin(animTime).mul(uRadiusY);

      const floatX = pos.x.add(offsetX);
      const floatY = pos.y.add(offsetY);
      return vec3(floatX, floatY, pos.z);
    });

    // Combine wobble and floating animations
    material.positionNode = floatingAnimation();

    // Geometry + super call
    const geometry = new THREE.PlaneGeometry();
    super(geometry, material);

    // Store references for update
    this._video = video;
    this._canvas = canvas;
    this._ctx = ctx;
    this._videoTexture = videoTexture;
    this._debug = debug;

    video.addEventListener("loadedmetadata", () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;

      const aspect = w / h;
      this.scale.set(aspect, 1, 1);
    });

    // Debug
    this.setDebug();
  }

  setDebug() {
    if (this._debug.active) {
      this.debugFolder = this._debug.ui.addFolder({
        title: "Tile",
      });
    }
  }

  update() {
    if (
      this._ctx &&
      this._video &&
      this._video.readyState >= this._video.HAVE_CURRENT_DATA
    ) {
      this._ctx.drawImage(
        this._video,
        0,
        0,
        this._canvas.width,
        this._canvas.height,
      );
      this._videoTexture.needsUpdate = true;
    }
  }
}
