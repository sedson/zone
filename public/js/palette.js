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
  console.log(scheme)
  if (scheme) {
    console.log(root, scheme)
    root && (root.className = scheme);
  }
} catch (e) {
  scheme = schemes[0];
}

function cyclePalette(){
  scheme = schemes[(schemes.indexOf(scheme) + 1) % schemes.length];
  console.log(scheme)
  root && (root.className = scheme);
  try {
    localStorage.setItem("zone-scheme", scheme);
    console.log(localStorage)
  } catch (e) {}
}