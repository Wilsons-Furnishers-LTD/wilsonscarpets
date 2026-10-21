class Search {
    constructor() {
        const mastHeadTop = document.querySelector('#mastHeadTop');
        console.log(mastHeadTop);
        const observer = new IntersectionObserver(this.handleIntersection);
        observer.observe(mastHeadTop);

        window.addEventListener("scroll", () => {
            const hoverBox = document.getElementById('klevu-pt-rs-hover');
            if(hoverBox && hoverBox.style.display === 'block') {
                hoverBox.style.display = 'none';
            }
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                document.body.classList.remove('header-sticky');
            } else {
                document.body.classList.add('header-sticky');
            }
        });
    }
}
new Search();
