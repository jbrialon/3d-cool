import * as THREE from "three/webgpu";
import {
  uniform,
  vec2,
  vec3,
  vec4,
  uv,
  viewportUV,
  sin,
  fract,
  dot,
  mix,
  distance,
  smoothstep,
  screenCoordinate,
  viewportSize,
  clamp,
  floor,
  min,
  array,
  Fn,
  positionLocal,
  time,
  cos,
} from "three/tsl";
import gsap from "gsap";
import Experience from "../Experience";

export default class Background {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.inputEvents = this.experience.inputEvents;

    // Options
    this.options = {
      opacity: 1.0,
    };

    this.uProgress = uniform(0);
    this.uOpacity = uniform(this.options.opacity);
    this.uMouse = uniform(vec2(0.5, 0.5));

    // Mouse position (normalized 0-1)
    this.mouse = { x: 0.5, y: 0.5 };

    // Setup
    this.initEvents();
    // this.setBackground();
    this.setAnimation();
    this.setGeometry();
    this.setMaterial();
    this.setMesh();

    // Debug
    this.setDebug();
  }

  initEvents() {
    this.inputEvents.on("mousemove", this.onMouseMove.bind(this));
  }

  onMouseMove() {
    this.mouse.x = this.inputEvents.mouse.x / this.sizes.width;
    this.mouse.y = this.inputEvents.mouse.y / this.sizes.height;
    this.uMouse.value.x = this.mouse.x;
    this.uMouse.value.y = this.mouse.y;
  }

  setBackground() {
    // Hash function for pseudo-random noise
    const hash32 = Fn(([p]) => {
      // Convert 2D input to 3D by duplicating components
      const p3 = fract(vec3(p.x, p.y, p.x).mul(vec3(0.1031, 0.103, 0.0973)));

      // Mix components together
      const dotResult = dot(p3, vec3(p3.y, p3.x, p3.z).add(33.33));
      const p3Mixed = p3.add(dotResult);

      // Final hash - create pseudo-random output
      return fract(
        vec3(p3Mixed.x, p3Mixed.x, p3Mixed.y)
          .mul(p3Mixed.x)
          .add(
            vec3(p3Mixed.y, p3Mixed.z, p3Mixed.z)
              .mul(p3Mixed.z)
              .mul(p3Mixed.y)
              .mul(p3Mixed.x),
          ),
      );
    });

    // Create background shader using Fn
    const backgroundShader = Fn(([uv]) => {
      // Remap UVs to NDC Space (-1 to 1)
      let st = uv.mul(2).sub(1);
      st.x = st.x.mul(viewportSize.x.div(viewportSize.y));

      // For distance calculations, we need 0-1 range with aspect correction
      const aspect = viewportSize.x.div(viewportSize.y);
      const adjustedUv = uv.toVar();
      adjustedUv.x.assign(adjustedUv.x.mul(aspect));

      const fragCoord = screenCoordinate.xy;

      // Background color palette (9 colors)
      const bgColors = array([
        vec3(0.992, 0.933, 0.875), // #FDEEDF
        vec3(0.922, 0.769, 0.753), // #EBC4C0
        vec3(0.918, 0.835, 0.761), // #EAD5C2
        vec3(0.773, 0.784, 0.773), // #C5C8C5
        vec3(0.576, 0.714, 0.788), // #93B6C9
        vec3(0.675, 0.749, 0.776), // #ACBFC6
        vec3(0.329, 0.459, 0.596), // #547598
        vec3(0.039, 0.149, 0.298), // #0A264C
        vec3(0.133, 0.137, 0.157), // #222328
      ]);

      // Circle 1 color palette (9 colors)
      const circle1Colors = array([
        vec3(0.91, 0.722, 0.533), // #E8B888
        vec3(0.894, 0.812, 0.82), // #E4CFD1
        vec3(0.937, 0.89, 0.827), // #EFE3D3
        vec3(0.843, 0.667, 0.518), // #D7AA84
        vec3(0.369, 0.522, 0.635), // #5E85A2
        vec3(0.961, 0.71, 0.584), // #F5B595
        vec3(0.831, 0.682, 0.616), // #D4AE9D
        vec3(0.616, 0.541, 0.584), // #9D8A95
        vec3(0.204, 0.286, 0.439), // #334970
      ]);

      // Circle 2 color palette (9 colors)
      const circle2Colors = array([
        vec3(0.714, 0.706, 0.761), // #B6B4C2
        vec3(0.996, 0.831, 0.773), // #FED4C5
        vec3(0.812, 0.769, 0.761), // #CFC4C2
        vec3(0.247, 0.294, 0.286), // #3F4B49
        vec3(0.992, 0.702, 0.408), // #FDB368
        vec3(0.905, 0.643, 0.671), // #E7A4AB
        vec3(0.82, 0.478, 0.424), // #D17A6C
        vec3(0.545, 0.392, 0.467), // #8B6477
        vec3(0.784, 0.792, 0.843), // #C8CAD7
      ]);

      // Determine stage and interpolation
      const fullProgress = clamp(this.uProgress.mul(8.0), 0.0, 8.0);
      const index = floor(fullProgress);
      const t = fract(fullProgress);

      // Interpolate background color
      const bg = mix(
        bgColors.element(index),
        bgColors.element(min(index.add(1), 8)),
        t,
      );

      // Circle 1 follows mouse
      const circle1center = vec2(this.uMouse.x.mul(aspect), this.uMouse.y);
      const dist1 = distance(adjustedUv, circle1center);
      const circle1 = smoothstep(0.75, 0.0, dist1);

      // Circle 2 follows mouse inverted
      const circle2center = vec2(
        this.uMouse.x.oneMinus().mul(aspect),
        this.uMouse.y.oneMinus(),
      );
      const dist2 = distance(adjustedUv, circle2center);
      const circle2 = smoothstep(0.75, 0.0, dist2);

      // Circle colors
      const circle1color = mix(
        circle1Colors.element(index),
        circle1Colors.element(min(index.add(1), 8)),
        t,
      );
      // const circle1color = vec3(1.0, 0.0, 0.0);
      const circle2color = mix(
        circle2Colors.element(index),
        circle2Colors.element(min(index.add(1), 8)),
        t,
      );

      // Blend circles
      const mix1 = mix(bg, circle1color, smoothstep(0.0, 1.0, circle1));
      const mix2 = mix(mix1, circle2color, smoothstep(0.0, 1.0, circle2));

      // Subtle Film grain (animated over time)
      const grain = fract(
        sin(dot(fragCoord.add(time.mul(0.0002)), vec2(12.9898, 78.233))).mul(
          43758.5453,
        ),
      );

      const grainAdjusted = grain.sub(0.5).mul(0.1);
      const finalColor = mix2.add(grainAdjusted);

      return vec4(finalColor, 1.0);
    });

    this.scene.backgroundNode = backgroundShader(viewportUV);
  }

  setMouseListener() {
    window.addEventListener("mousemove", (event) => {
      // Normalize mouse position to 0-1 range
      this.mouse.x = event.clientX / window.innerWidth;
      this.mouse.y = event.clientY / window.innerHeight;

      this.uMouse.value.x = this.mouse.x;
      this.uMouse.value.y = this.mouse.y;
    });
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.NodeMaterial();
    this.material.transparent = true;
    this.material.depthTest = false;
    this.material.depthWrite = false;

    this.material.vertexNode = vec4(positionLocal.xy, vec2(1.0, 1.0));

    // Fragment shader
    const fragmentShader = Fn(() => {
      // uv
      const st = uv();

      const fragCoord = screenCoordinate.xy;

      // Correct UV for aspect ratio using built-in viewportSize
      const aspect = viewportSize.x.div(viewportSize.y);
      const adjustedUv = st.toVar();
      adjustedUv.x.assign(adjustedUv.x.mul(aspect));

      // Background color palette (9 colors)
      const bgColors = array([
        vec3(0.992, 0.933, 0.875), // #FDEEDF
        vec3(0.922, 0.769, 0.753), // #EBC4C0
        vec3(0.918, 0.835, 0.761), // #EAD5C2
        vec3(0.773, 0.784, 0.773), // #C5C8C5
        vec3(0.576, 0.714, 0.788), // #93B6C9
        vec3(0.675, 0.749, 0.776), // #ACBFC6
        vec3(0.329, 0.459, 0.596), // #547598
        vec3(0.039, 0.149, 0.298), // #0A264C
        vec3(0.133, 0.137, 0.157), // #222328
      ]);

      // Circle 1 color palette (9 colors)
      const circle1Colors = array([
        vec3(0.91, 0.722, 0.533), // #E8B888
        vec3(0.894, 0.812, 0.82), // #E4CFD1
        vec3(0.937, 0.89, 0.827), // #EFE3D3
        vec3(0.843, 0.667, 0.518), // #D7AA84
        vec3(0.369, 0.522, 0.635), // #5E85A2
        vec3(0.961, 0.71, 0.584), // #F5B595
        vec3(0.831, 0.682, 0.616), // #D4AE9D
        vec3(0.616, 0.541, 0.584), // #9D8A95
        vec3(0.204, 0.286, 0.439), // #334970
      ]);

      // Circle 2 color palette (9 colors)
      const circle2Colors = array([
        vec3(0.714, 0.706, 0.761), // #B6B4C2
        vec3(0.996, 0.831, 0.773), // #FED4C5
        vec3(0.812, 0.769, 0.761), // #CFC4C2
        vec3(0.247, 0.294, 0.286), // #3F4B49
        vec3(0.992, 0.702, 0.408), // #FDB368
        vec3(0.905, 0.643, 0.671), // #E7A4AB
        vec3(0.82, 0.478, 0.424), // #D17A6C
        vec3(0.545, 0.392, 0.467), // #8B6477
        vec3(0.784, 0.792, 0.843), // #C8CAD7
      ]);

      // Determine stage and interpolation
      const fullProgress = clamp(this.uProgress.mul(8.0), 0.0, 8.0);
      const index = floor(fullProgress);
      const t = fract(fullProgress);

      // Interpolate background color
      const bg = mix(
        bgColors.element(index),
        bgColors.element(min(index.add(1), 8)),
        t,
      );

      // Circle 1 follows mouse
      // const circle1center = vec2(this.uMouse.x.mul(aspect), this.uMouse.y);

      const circle1center = vec2(
        sin(time.mul(0.4)).mul(0.3).add(0.5),
        cos(time.mul(0.3)).mul(0.45).add(0.5),
      );

      const dist1 = distance(adjustedUv, circle1center);
      const circle1 = smoothstep(0.75, 0.0, dist1);

      // Circle 2 follows mouse inverted
      // const circle2center = vec2(
      //   this.uMouse.x.oneMinus().mul(aspect),
      //   this.uMouse.y.oneMinus()
      // );

      const circle2center = vec2(
        cos(time.mul(0.6)).mul(0.2).add(aspect.mul(0.5)),
        sin(time.mul(0.5)).mul(0.35).add(0.5),
      );

      const dist2 = distance(adjustedUv, circle2center);
      const circle2 = smoothstep(0.75, 0.0, dist2);

      // Circle colors
      const circle1color = mix(
        circle1Colors.element(index),
        circle1Colors.element(min(index.add(1), 8)),
        t,
      );

      const circle2color = mix(
        circle2Colors.element(index),
        circle2Colors.element(min(index.add(1), 8)),
        t,
      );

      // Blend circles
      const mix1 = mix(bg, circle1color, smoothstep(0.0, 1.0, circle1));
      const mix2 = mix(mix1, circle2color, smoothstep(0.0, 1.0, circle2));

      // Subtle Film grain (animated over time)
      const grain = fract(
        sin(dot(fragCoord.add(time.mul(0.0002)), vec2(12.9898, 78.233))).mul(
          43758.5453,
        ),
      );

      const grainAdjusted = grain.sub(0.5).mul(0.1);
      const finalColor = mix2.add(grainAdjusted);

      return vec4(finalColor, this.uOpacity);
    });

    this.material.fragmentNode = fragmentShader();
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -9999;
    this.scene.add(this.mesh);
  }

  setAnimation() {
    gsap.to(this.uProgress, {
      value: 1,
      duration: 5,
      ease: "none",
      repeat: -1,
      yoyo: true,
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder({
        title: "Background",
      });

      this.debugFolder
        .addBinding(this.options, "opacity", {
          min: 0,
          max: 1,
          step: 0.01,
        })
        .on("change", (ev) => {
          this.uOpacity.value = ev.value;
        });
    }
  }

  update() {}
}
