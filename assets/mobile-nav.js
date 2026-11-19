// Search in the bar at the bottom of the page (snippets/mobile-nav.liquid) opens and closes the header search.
// It opens with the header's toggle (assets/all.js), which is hidden below 1024px, so this also closes it.
// It's closed here, as all.js marks search as closed on any click outside it without closing it, so its
// toggle would open it again. The link goes to the search page if the toggle isn't there
document.addEventListener('click', event => {
    if (!event.target.closest('.mobile-nav__link--search')) return;

    const searchToggle = document.getElementById('searchToggle');
    if (!searchToggle) return;

    event.preventDefault();

    const root = document.documentElement;

    if (root.classList.contains('offCanvasSearch')) {
        root.classList.remove('offCanvasSearch');
        if (window.juno) window.juno.searchIsRevealed = false;
        return;
    }

    searchToggle.click();
});
