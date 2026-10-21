class Search {
    constructor() {
        const mastHeadTop = document.querySelector('#mastHeadTop');
        
        const observer = new IntersectionObserver(this.handleIntersection, {
                root: mastHeadTop,
                
                threshold: 0
            });
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
            console.log(!entry.isIntersecting);
            if (!entry.isIntersecting) {
                document.body.classList.add('header-sticky');
            } else {
                document.body.classList.remove('header-sticky');
            }
        });
    }
}
new Search();
