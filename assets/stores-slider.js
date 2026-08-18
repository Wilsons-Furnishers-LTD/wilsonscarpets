document.addEventListener("DOMContentLoaded", function () {
  let slideIndex = 0;
  const slides = document.querySelectorAll(".slideshow-container .slide");
  let slideTimer;

  function showSlide(n) {
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === n);
    });
  }

  function startAutoSlide() {
    clearInterval(slideTimer);

    slideTimer = setInterval(() => {
      slideIndex = (slideIndex + 1) % slides.length;
      showSlide(slideIndex);
    }, 5000);
  }

  function plusSlides(n) {
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    showSlide(slideIndex);

    // Restart the timer after manual navigation
    startAutoSlide();
  }

  // Previous arrow
  document.querySelector(".slideshow-container .prev")
    .addEventListener("click", () => plusSlides(-1));

  // Next arrow
  document.querySelector(".slideshow-container .next")
    .addEventListener("click", () => plusSlides(1));

  // Show the first slide
  showSlide(slideIndex);

  // Start automatic slideshow
  startAutoSlide();
});