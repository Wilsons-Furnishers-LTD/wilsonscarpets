class Products {
    constructor() {
        const variantData = document.getElementById(
            'ProductVariants'
        );
        
        if (!variantData) return;

        this.selects = document.querySelectorAll('.single-option-selector'),
        this.variants = JSON.parse(variantData.textContent),
        this.moneyFormat = variantData.getAttribute('data-money-format'),
        this.priceElement = document.querySelector('#product-price .product-price');

        document.addEventListener('DOMContentLoaded', this.updateVariantSelection.bind(this));

        document.addEventListener('colour:changed', (event) => {
            this.updateVariant();
        });
        
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
                    
        if (!variant) return;

        // Update hidden variant ID
        const variantInput = document.querySelector(
        'form[action="/cart/add"] select[name="id"]'
        );

        if (variantInput) {
            variantInput.value = variant.id;
        }

        // Update price
        if (this.priceElement) {
            this.priceElement.textContent =
            Shopify.formatMoney(variant.price, this.moneyFormat);
        }
    }
}
new Products();
