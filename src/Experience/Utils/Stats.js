import Stats from "stats-gl";

export default class Performance {
  constructor() {
    this.active = false;

    this.stats = new Stats({
      trackGPU: true,
      trackHz: true,
      trackCPT: true,
      minimal: false,
      mode: 2,
      horizontal: false,
    });
    document.body.appendChild(this.stats.dom);
    this.stats.dom.style.display = this.active ? "block" : "none";

    this.setupKeyboardToggle();
  }

  setupKeyboardToggle() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "d" || event.key === "D") {
        this.active = !this.active;
        this.stats.dom.style.display = this.active ? "block" : "none";
      }
    });
  }

  init(renderer) {
    this.stats.init(renderer);
  }

  begin() {
    if (this.active) this.stats.begin();
  }

  update() {
    if (this.active) this.stats.update();
  }

  end() {
    if (this.active) this.stats.end();
  }
}
