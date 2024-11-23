const markup = `
<div class="bb p100" style="display: flex; flex-flow: row wrap">
  <div style="display: flex; justify-content">
    <div style="background-color: var(--gray-1);" class="swatch"></div>
    <div style="background-color: var(--gray-2);" class="swatch"></div>
    <div style="background-color: var(--gray-3);" class="swatch"></div>
    <div style="background-color: var(--gray-4);" class="swatch"></div>
  </div>
  <div style="display: flex; justify-content:">
    <div style="background-color: var(--yellow-1);" class="swatch"></div>
    <div style="background-color: var(--yellow-2);" class="swatch"></div>
    <div style="background-color: var(--yellow-3);" class="swatch"></div>
    <div style="background-color: var(--yellow-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--orange-1);" class="swatch"></div>
    <div style="background-color: var(--orange-2);" class="swatch"></div>
    <div style="background-color: var(--orange-3);" class="swatch"></div>
    <div style="background-color: var(--orange-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--red-1);" class="swatch"></div>
    <div style="background-color: var(--red-2);" class="swatch"></div>
    <div style="background-color: var(--red-3);" class="swatch"></div>
    <div style="background-color: var(--red-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--pink-1);" class="swatch"></div>
    <div style="background-color: var(--pink-2);" class="swatch"></div>
    <div style="background-color: var(--pink-3);" class="swatch"></div>
    <div style="background-color: var(--pink-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--purple-1);" class="swatch"></div>
    <div style="background-color: var(--purple-2);" class="swatch"></div>
    <div style="background-color: var(--purple-3);" class="swatch"></div>
    <div style="background-color: var(--purple-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--blue-1);" class="swatch"></div>
    <div style="background-color: var(--blue-2);" class="swatch"></div>
    <div style="background-color: var(--blue-3);" class="swatch"></div>
    <div style="background-color: var(--blue-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--cyan-1);" class="swatch"></div>
    <div style="background-color: var(--cyan-2);" class="swatch"></div>
    <div style="background-color: var(--cyan-3);" class="swatch"></div>
    <div style="background-color: var(--cyan-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--teal-1);" class="swatch"></div>
    <div style="background-color: var(--teal-2);" class="swatch"></div>
    <div style="background-color: var(--teal-3);" class="swatch"></div>
    <div style="background-color: var(--teal-4);" class="swatch"></div>
  </div>
  <div style="display: flex;">
    <div style="background-color: var(--green-1);" class="swatch"></div>
    <div style="background-color: var(--green-2);" class="swatch"></div>
    <div style="background-color: var(--green-3);" class="swatch"></div>
    <div style="background-color: var(--green-4);" class="swatch"></div>
  </div>
</div>
`.trim();

export class SwatchViewer extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = markup;
  }
}

customElements.define('swatch-viewer', SwatchViewer);