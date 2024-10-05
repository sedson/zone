const schemes = [
  "scheme",
  "scheme-quiet",
  "scheme-dark",
  "scheme-quiet-dark",
  "scheme-mode",
  "scheme-lake",
  "scheme-pool",
];

let scheme;
const root = document.querySelector(":root");

try {
  scheme = localStorage.getItem("zone-scheme");
  if (scheme) {
    root && (root.className = scheme);
  }
} catch (e) {
  scheme = schemes[0];
}

export function cyclePalette(){
  scheme = schemes[(schemes.indexOf(scheme) + 1) % schemes.length];
  root && (root.className = scheme);
  try {
    localStorage.setItem("zone-scheme", scheme);
    console.log(localStorage)
  } catch (e) {}
}