import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import EventEmitter from "./EventEmitter";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    // Options
    this.sources = sources;

    // Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.dracoLoader = new DRACOLoader();
    this.loaders.dracoLoader.setDecoderPath("/draco/");

    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);

    this.loaders.textureLoader = new THREE.TextureLoader();

    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(
          source.path,
          (file) => {
            this.sourceLoaded(source, file);
          },
          (progress) => this.onProgress(progress),
          (error) => this.onError(error, source)
        );
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(
          source.path,
          (file) => {
            this.sourceLoaded(source, file);
          },
          (progress) => this.onProgress(progress),
          (error) => this.onError(error, source)
        );
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(
          source.path,
          (file) => {
            this.sourceLoaded(source, file);
          },
          (progress) => this.onProgress(progress),
          (error) => this.onError(error, source)
        );
      } else if (source.type === "video") {
        this.loadVideo(source);
      } else if (source.type === "image") {
        this.loadImage(source);
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }

  loadVideo(source) {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = 0.1;
    };

    video.oncanplay = () => {
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      this.sourceLoaded(source, videoTexture);
    };

    video.onerror = (error) => {
      this.onError(error, source);
    };

    video.src = source.path;
  }

  loadImage(source) {
    let image = new Image();

    image.onload = () => {
      this.sourceLoaded(source, image);
    };

    image.onerror = (error, source) => {
      this.onError(error, source);
    };

    image.src = source.path;
  }

  onProgress(progress) {
    // console.log(progress);
  }

  onError(error, source) {
    console.log(error, source);
  }
}
