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
