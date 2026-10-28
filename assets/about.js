class Slider {
    constructor() {
        this.cmsStoreData = this.formatCmsStoreData();

        this.setupSlider(this.cmsStoreData);
    }
    formatCmsStoreData() {
        let data = window.themeAssets.store_data;
        return data.address.map((address, index) => ({
                category: "store",
                address,
                name: data.name ? data.name[index] : '',
                thumbnail: data.thumbnail ? data.thumbnail[index] : '',
                address: data.address ? data.address[index] : '',
                url: data.url ? data.url[index] : '',
                phone: data.address ? data.phone[index] : '',
                lat: data.lat[index] ? data.lat[index] : '',
                long: data.long[index] ? data.long[index] : '',
                social: data.social ? data.social[index] : '',
                tags: data.tags ? data.tags[index] : [],
                opening_times: data.opening_times ? data.opening_times[index] : '',
                country: data.country ? data.country[index] : '',
                region: data.region ? data.region[index] : '',
                city: data.city ? data.city[index] : '',
                schedule: data.schedule ? data.schedule[index] : '',
                schedule_text: data.schedule ? data.schedule_text[index] : '',
                id: data.store_id ? Number(data.store_id[index]) : '',
                email: data.email ? data.email[index] : '',
                carousel_title: data.carousel_title ? data.carousel_title[index] : '',
        }))
    }

    setupSlider(data) {
        const storeCarousel = $('.store-carousel');
        data.forEach(item => {
        storeCarousel.append(`
                <div class="store-carousel__item">
                    <a href="${item.url}">
                        <div class="store-carousel__image">
                            <img src="${item.thumbnail}" alt="${item.name}">
                        </div>
                        <div class="store-carousel__title">
                            ${item.name}
                        </div>
                    </a>
                </div>
            `);
        });

        // Initialize Slick
        storeCarousel.owlCarousel({
            loop:true,
            margin:25,
            nav:true,
            dots: false,
            autoplay:true,
            autoplayTimeout:2000,
            
            navText: [
                '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8L11 15L18 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 8L19 15L12 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
            ],
            responsive:{
                0:{
                    items:1.5
                },
                600:{
                    items:2
                },
                1000:{
                    items:3.3
                }
            }
        });
    }
}

new Slider();
