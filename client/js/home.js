import { select } from "./dom-utils.js";
import { cyclePalette } from "./palette.js";

window.addEventListener("DOMContentLoaded", () => {
  select("#themes")?.addEventListener("click", cyclePalette);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "1" && e.metaKey) {
    console.log("ksdlhflfhksdjfh")
    window.location.href = "/";
    e.preventDefault();
  }
  if (e.key === "2" && e.metaKey) {
    console.log("ksdlhflfhksdjfh")
    window.location.href = "/editor";
    e.preventDefault();
  }
});
