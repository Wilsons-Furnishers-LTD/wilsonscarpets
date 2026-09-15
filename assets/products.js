class Products {
    constructor() {
        const variantData = document.getElementById(
            'ProductVariants'
        );
        
        if (!variantData) return;

        this.selects = document.querySelectorAll('.single-option-selector'),
        this.variants = JSON.parse(variantData.textContent),
        this.moneyFormat = variantData.getAttribute('data-money-format'),
        this.productTitle = variantData.getAttribute('data-product-title'),
        this.productType = variantData.getAttribute('data-product-type'),
        this.hideDefaultTitle = false,
        this.soldOut = variantData.getAttribute('data-sold-out'),
        this.unavailable = variantData.getAttribute('data-unavailable'),
        this.detailTitles = document.querySelectorAll('.product-main-details__title');

        if(variantData.getAttribute('data-hide-default-title') == 'true') {
            this.hideDefaultTitle = true;
        }
        document.addEventListener('DOMContentLoaded', this.updateVariantSelection.bind(this));
        document.addEventListener('DOMContentLoaded', this.setupRelatedProductCarousel.bind(this));
        document.addEventListener('DOMContentLoaded', this.setupSwatchCarousel.bind(this));

        this.setupRelatedProductCarousel.bind(this);

        document.addEventListener('colour:changed', (event) => {
            this.updateVariant();
        });

        this.detailTitles.forEach(detailTitle => {
            detailTitle.addEventListener('click', this.changeProductDetailView.bind(this, detailTitle));
        });
        
    }

    changeProductDetailView(detailTitle) {
        let item = detailTitle.getAttribute('data-item'),
            tabs = document.querySelectorAll('.product-main-details__item'),
            activeElement = document.getElementById('tab-' + item),
            activeClass = 'active';

        tabs.forEach(tab => {
            tab.classList.remove(activeClass);
        });
        
        if(activeElement) {
            activeElement.classList.add(activeClass);
        }

        this.detailTitles.forEach(detailTitle => {
            detailTitle.classList.remove(activeClass);
        });

        detailTitle.classList.add(activeClass);
    }
    updateVariantSelection() {        

        this.selects.forEach(select => {
            select.addEventListener('change', this.updateVariant.bind(this));
        });
              
        this.updateVariant();
    }

    updateVariant() {
        const selectedOptions = Array.from(this.selects).map(select => select.value);
        const variant = this.variants.find(variant =>
            variant.options.every(
                (option, index) => option === selectedOptions[index]
            )
        );
        
        this.checkVariant(variant);

        if (!variant) return;

        // Update hidden variant ID
        const variantInput = document.querySelector(
        'form[action="/cart/add"] select[name="id"]'
        );

        if (variantInput) {
            variantInput.value = variant.id;
        }
        
        // Update price
        let productPrice = document.querySelector('#product-price .product-price');
        if (productPrice) {
            productPrice.textContent = Shopify.formatMoney(variant.price, this.moneyFormat);
            $('.update-on-change').html(Shopify.formatMoney(variant.price, this.moneyFormat));
        }
        
    }

    checkVariant(variant) {
        if (variant) {
            if (variant.available) { // Enabling add to cart button.
                // If item is backordered yet can still be ordered, we'll show special message.
                if (variant.inventory_management && variant.inventory_quantity <= 0) {
                    if(this.hideDefaultTitle) {
                        document.querySelector('#selected-variant').textContent = `${this.productTitle}`;
                    } else {
                        document.querySelector('#selected-variant').textContent = `${this.productTitle} - ${variant.title}`;
                    }

                    
                    document.querySelector('#backorder').classList.remove("hidden");
                } else {
                    document.querySelector('#backorder').classList.add("hidden");
                }
            } else { // Variant is sold out.
                document.querySelector('#backorder').classList.add("hidden");

                let cartButton = document.querySelector('#AddToCart');
                if(this.productType == 'Carpets' || this.productType == 'Vinyl' || this.productType == 'Artificial Grass') {
                    cartButton = document.querySelector('#carpetAddToCart');
                }
                if(cartButton) {
                    cartButton.value = this.soldOut;
                    cartButton.classList.add('disabled');
                    cartButton.disabled = true;
                }
            }
            updatePrice();
            
            if(this.productType == 'Carpets' || this.productType == 'Vinyl' || this.productType == 'Artificial Grass') {
                updateSampleAvailability();    
            }


            if(jQuery('#first_load').val() != 'false' || !jQuery('.option-colour #select-option-colour').length) {
                var selectedOption = jQuery('#product-select').find('option:selected'),
                    stock_level = selectedOption.data('stocklevel'),
                    deliveryestimate = selectedOption.data('deliveryestimate');
                    selectedOption.data('quantity');
                    var is_in_stock = selectedOption.data('instock'),
                    variantid = selectedOption.attr('value');
                
                if(is_in_stock > 0 ) {
                    if(stock_level == 'Yes') {
                        jQuery('#stockLevel').removeClass().addClass('limitedStock').html('<i class="icon-instock"></i> Order Now');
                        jQuery('#properties_stockLevel').val('Order Now');
                    }
                    else {
                        jQuery('#stockLevel').removeClass().addClass('inStock').html('<i class="icon-instock"></i> In stock');
                        jQuery('#properties_stockLevel').val('In stock');
                    }
                    jQuery('#carpetAddToCart').removeClass('disabled').removeAttr('disabled').html('Add to Basket');
                    jQuery('#AddToCart').removeClass('disabled').removeAttr('disabled').html('Add to Basket');
                    jQuery('#fake-add-card-btn').removeClass('disabled').removeAttr('disabled').html('Add to Basket');
                }
                else {
                    jQuery('#stockLevel').removeClass().addClass('outOfStock').html('<i class="icon-outofstock"></i> Out of stock');
                    jQuery('#properties_stockLevel').val('Out of stock');
                    jQuery('#carpetAddToCart').addClass('disabled').attr('disabled', true).html('Out of Stock');
                    jQuery('#AddToCart').addClass('disabled').attr('disabled', true).html('Out of Stock');
                    jQuery('#fake-add-card-btn').addClass('disabled').attr('disabled', true).html('Out of Stock');
                }

                if (deliveryestimate) {
                //  jQuery('#deliveryEstimate').html('<span class="location__icon icon icon"><img src="{{ 'icon-location.svg' | asset_url }}" alt="location"></span> ' + deliveryestimate);
                    jQuery('#properties_deliveryEstimate').val(deliveryestimate);
                }

                jQuery('#properties_variantID').val(variantid);
            }
            jQuery('#first_load').val(true);
        } else {
            // variant doesn't exist.
            jQuery('#backorder').addClass('hidden');
            jQuery('#AddToCart').val(this.unavailable).addClass('disabled').prop('disabled', true);
        }
    }

    setupSwatchCarousel() {
       
        if (jQuery('.ct-owl.owl-carousel').length) {
            var $swatchCarousel = $('.product-photo-thumbs.owl-carousel');
            $swatchCarousel.owlCarousel({
                loop: true,
                autoplay: false,
                margin: 10,
                nav: true,
                navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                dots: false,
                responsive: {
                    0: {
                        items: 1
                    },
                    768: {
                        items: 2.5
                    },
                    1400: {
                        items: 10
                    }
                }
            });
        }
    }
    setupRelatedProductCarousel() {
        if (jQuery('.related-products-refresh .owl-carousel').length) {
            var $featuredCollection = $('.related-products-refresh .owl-carousel');
            $featuredCollection.owlCarousel({
                loop: true,
                autoplay: false,
                margin: 20,
                nav: true,
                navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                dots: false,
                responsive: {
                    0: {
                        items: 1
                    },
                    768: {
                        items: 2.5
                    },
                    1400: {
                        items: 3.5
                    }
                },
                onInitialized: match_height,
                onResized: match_height
            });

            $featuredCollection.on('translated.owl.carousel',function(event){
                $(event.target).find(".owl-item.active .product-name").sameHeight();
            });

            function match_height(event) {
                var img_height = jQuery(event.target).find('.owl-item.active').first().find('.product-image-wrap').height();
                if(isIpadOS()){
                    var img_height = jQuery(event.target).find('.owl-item.active').first().height();
                }
                
                

                $(event.currentTarget).find('.owl-item .product-name').removeAttr('style');
                $(event.currentTarget).find('.owl-item.active .product-name').sameHeight();


                $(window).width();
                jQuery(event.currentTarget).find('.owl-prev,.owl-next').css('top', img_height / 2);
                
            }
        }
    }

}
new Products();
