class Template {
    constructor() {
        
        const accordionTitles = document.querySelectorAll(".wc-accordion-item__title");
        accordionTitles.forEach((accordion) => {
            accordion.addEventListener('click', this.toggleAccordion.bind(this));
        });

        this.setupSlider();
    }
    toggleAccordion(title) {
        let accordionTitle = title.target
        
        accordionTitle.classList.toggle("is-open");

        let content = accordionTitle.nextElementSibling;

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
        content.style.maxHeight = content.scrollHeight + "px";
        }
    }

    setupSlider() {
         let payPalCarousel = $('.wc-paypal__carousel')
        payPalCarousel.owlCarousel({
            loop:true,
            
            nav:true,
            dots: false,
            autoplay:true,
            autoplayTimeout:5000,
            stagePadding: 150,
            navText: [
                '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8L11 15L18 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 8L19 15L12 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
            ],
            responsive:{
                0:{
                    items:1,
                    stagePadding: 50
                },
                600: {
                    items:1,
                    stagePadding: 150
                },
                1024:{
                    items:3,
                    autoplay:false,
                    stagePadding: 0,
                    margin: 40,
                    mouseDrag: false,
                    touchDrag: false
                },
                1150:{
                    items:3,
                    autoplay:false,
                    stagePadding: 0,
                    margin: 50,
                    mouseDrag: false,
                    touchDrag: false
                }
            }
        })
    }
}

new Template();
