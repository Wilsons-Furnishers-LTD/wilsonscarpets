class Search {
    constructor() {
        // layout/theme.liquid: a fixed marker at the top of the page, outside the header.
        // Watching #mastHeadTop flickered, as header-sticky collapses it, which toggled the class back
        const headerSentinel = document.getElementById('headerSentinel');

        if (headerSentinel) {
            const observer = new IntersectionObserver(this.handleIntersection);
            observer.observe(headerSentinel);
        }

        window.addEventListener("scroll", () => {
            const hoverBox = document.getElementById('klevu-pt-rs-hover');
            if(hoverBox && hoverBox.style.display === 'block') {
                hoverBox.style.display = 'none';
            }
        }, { passive: true });
    }

    // Sticky once the marker has scrolled out of view
    handleIntersection([entry]) {
        document.body.classList.toggle('header-sticky', !entry.isIntersecting);
    }
}
new Search();
