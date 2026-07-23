import { Pane } from "tweakpane";

export default class Debug {
  constructor() {
    this.active = true;
    this.ui = new Pane({ title: "Parameters" });
    this.ui.hidden = true;
    this.setupKeyboardToggle();
  }

  setupKeyboardToggle() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "d" || event.key === "D") {
        this.ui.hidden = !this.ui.hidden;
      }
    });
  }
}
