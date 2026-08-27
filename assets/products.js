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
        document.addEventListener('DOMContentLoaded', this.setupCarousel.bind(this));

        document.addEventListener('colour:changed', (event) => {
            this.updateVariant();
        });

        this.detailTitles.forEach(detailTitle => {
            detailTitle.addEventListener('click', this.changeProductDetailView.bind(this, detailTitle));
        });
        
    }

    changeProductDetailView(detailTitle) {
        let item = detailTitle.getAttribute('data-item');
        let tabs = document.querySelectorAll('.product-main-details__item');
        let activeElement = document.getElementById('tab-' + item);
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        if(activeElement.length) {
            activeElement.classList.add('active');
        }
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


    setupCarousel() {
        
    }

}
new Products();
