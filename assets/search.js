class Search {
    constructor() {
        this.header = document.getElementsByTagName('header')[0];
        window.addEventListener("scroll", () => {
            const hoverBox = document.getElementById('klevu-pt-rs-hover');
            if(hoverBox && hoverBox.style.display === 'block') {
                hoverBox.style.display = 'none';
            }
        });

        // Add event listener to check scroll direction
		document.addEventListener('scroll', this.toggleStickyNav.bind(this)); // eslint-disable-line
    }

    /*
	 * Adds / removes top navigation from viewport on scroll up / down
	 *
	 * @return    {void}
	 */
	toggleStickyNav() {
		const offset = window.pageYOffset || document.documentElement.scrollTop;
		if (offset > this.lastScrollTop) {
			this.header.classList.remove('header--scroll-active');
			if (offset > 150) {
				this.header.classList.remove('header--scroll-active');
			} else {
				this.header.classList.remove('header--scroll-active');
			}
		} else {
			this.header.classList.add('header--scroll-active');
		}
		this.lastScrollTop = offset <= 0 ? 0 : offset;
	}
}
new Search();
