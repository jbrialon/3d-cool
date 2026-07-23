import Experience from "../Experience";
// import Environment from "./Environment";
import Loader from "./Loader";
import Background from "./Background";
import Project from "./Project";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // this.loader = new Loader();

    // Wait for resources to be loaded
    this.resources.on("ready", () => {
      // Setup
      // this.ground = new Ground();

      this.background = new Background();
      // this.plane = new Plane();
      // this.tile = new Tile();
      this.project = new Project();
      // this.environment = new Environment();

      // Show Experience
      // this.loader.hideLoader();
    });
  }

  update() {
    if (this.plane) this.plane.update();
    if (this.background) this.background.update();
    if (this.tile) this.tile.update();
    if (this.project) this.project.update();
  }
}
