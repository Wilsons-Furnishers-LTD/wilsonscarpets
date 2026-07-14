document.addEventListener("DOMContentLoaded", function () {
  let slideIndex = 0;
  const slides = document.querySelectorAll(".slideshow-container .slide");

  function showSlide(n) {
    slides.forEach((slide, index) => {
      slide.classList.remove("active");
      if (index === n) {
        slide.classList.add("active");
      }
    });
  }

  function plusSlides(n) {
    slideIndex = (slideIndex + n + slides.length) % slides.length;
    showSlide(slideIndex);
  }

  function autoSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
  }

  // Attach to global so buttons can call it
  window.plusSlides = plusSlides;

  setInterval(autoSlide, 5000); // 5s autoplay
  showSlide(slideIndex);
});
