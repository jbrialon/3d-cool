import * as THREE from "three/webgpu";
import Experience from "../Experience";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.options = {
      ambientLightColor: 0xffffff,
      sunLightColor: 0xffffff,
      showHelper: false,
    };

    // Setup

    this.setAmbientLight();
    this.setSunLight();

    // Debug
    this.setDebug();
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(
      this.options.ambientLightColor,
      0.8,
    );
    this.scene.add(this.ambientLight);
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight(this.options.sunLightColor, 2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.far = 45;
    this.sunLight.shadow.camera.left = -5;
    this.sunLight.shadow.camera.top = 5;
    this.sunLight.shadow.camera.right = 5;
    this.sunLight.shadow.camera.bottom = -5;
    this.sunLight.shadow.bias = -0.0001;
    this.sunLight.position.set(2, 8, 8);
    this.scene.add(this.sunLight);
  }

  setDebug() {
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder({
        title: "Env",
        expanded: false,
      });

      this.debugFolder.addBinding(this.ambientLight, "intensity", {
        min: 0,
        max: 10,
        step: 0.001,
        label: "Ambient",
      });

      this.debugFolder
        .addBinding(this.options, "ambientLightColor", {
          view: "color",
          label: "color",
        })
        .on("change", () => {
          this.ambientLight.color.set(this.options.ambientLightColor);
        });

      this.debugFolder.addBinding(this.sunLight, "intensity", {
        min: 0,
        max: 10,
        step: 0.001,
        label: "Directionnal",
      });

      this.debugFolder
        .addBinding(this.options, "sunLightColor", {
          view: "color",
          label: "color",
        })
        .on("change", () => {
          this.sunLight.color.set(this.options.sunLightColor);
        });

      // Toggle Env Map
      this.debugFolder
        .addBinding(this.options, "useEnvMap")
        .on("change", () => {
          this.scene.environment = this.options.useEnvMap ? this.envMap : null;
        });

      this.debugFolder
        .addBinding(this.options, "showEnvMap")
        .on("change", () => {
          this.scene.background = this.options.showEnvMap ? this.envMap : null;
        });

      this.debugFolder
        .addBinding(this.options, "envMapRotation", {
          min: -Math.PI,
          max: Math.PI,
        })
        .on("change", () => {
          this.scene.backgroundRotation.y = this.options.envMapRotation;
          this.scene.environmentRotation.y = this.options.envMapRotation;
        });

      this.debugFolder.addBinding(this.scene, "environmentIntensity", {
        min: 0,
        max: 5,
        step: 0.001,
      });

      // Show/Hide Directional Light Helper
      this.debugFolder
        .addBinding(this.options, "showHelper")
        .on("change", () => {
          if (this.options.showHelper) {
            this.scene.add(this.helper); // Add the helper to the scene
          } else {
            this.scene.remove(this.helper); // Remove the helper from the scene
          }
        });

      // // Initially add the helper if showHelper is true
      // // Create the helper but don't add it to the scene yet
      this.helper = new THREE.DirectionalLightHelper(this.sunLight, 5);
      if (this.options.showHelper) {
        this.scene.add(this.helper);
      }
    }
  }
}
