class Search {
    constructor() {
        // Adds mast-head-top-hidden to body while #mastHeadTop is out of the viewport
        const mastHeadTop = document.getElementById('mastHeadTop');

        if (mastHeadTop) {
            const observer = new IntersectionObserver(([entry]) => {
                document.body.classList.toggle('header-sticky', !entry.isIntersecting);
            });
            observer.observe(mastHeadTop);
        }

        window.addEventListener("scroll", () => {
            const hoverBox = document.getElementById('klevu-pt-rs-hover')
            if(hoverBox && hoverBox.style.display === 'block') {
                hoverBox.style.display = 'none'
            }
        });
    }
}
new Search();
