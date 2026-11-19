// Search in the bar at the bottom of the page (snippets/mobile-nav.liquid) opens the header search,
// using its toggle in the header (assets/all.js). The link goes to the search page if the toggle isn't there
document.addEventListener('click', event => {
    if (!event.target.closest('.mobile-nav__link--search')) return;

    const searchToggle = document.getElementById('searchToggle');
    if (!searchToggle) return;

    event.preventDefault();
    searchToggle.click();
});
