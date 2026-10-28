class Compare {
    constructor(options = {}) {
        this.storageKey = 'compare_product_handles';
        // Set when the header link sends someone to the carpets collection with nothing to compare
        this.hintStorageKey = 'compare_show_hint';
        this.maxProducts = 4;
        this.modalContainerClass = 'compare-modal-container';
        this.modalOpenClass = 'compare-modal-open';
        this.modalContainer = document.querySelector(`.${this.modalContainerClass}`);
        this.gridsContainer = options.gridsContainer || document.querySelector('.compare-modal__grids');
        this.nav = options.nav || document.querySelector('.compare-modal__nav');
        this.viewFullLink = options.products ? null : document.querySelector('.compare-modal__view-full');
        this.addProductContainer = options.products ? null : document.querySelector('.compare-modal__add-product');
        this.productsByType = new Map();
        // The label column is narrower below 769px, see the labelColumnWidth getter
        this.smallScreenQuery = window.matchMedia('(max-width: 768px)');
        // The product columns are narrower below 500px, see the productColumnWidth getter
        this.extraSmallScreenQuery = window.matchMedia('(max-width: 499px)');
        // Types where someone tried to add a product past the limit, which shows the limit warning
        this.limitReachedTypes = new Set();
        // When set, these products are shown instead of the ones in local storage
        this.products = options.products || null;
        this.emptyMessage = options.emptyMessage || null;
        // Called after a product is added or removed
        this.onChange = options.onChange || null;
        this.activeType = null;
        this.specifications = ['Pile Height', 'Material', 'TOG Rating', 'Backing', 'Style'];
        this.specificationsLaminate = ['Pack Size (M²)', 'Planks Per Pack', 'Plank Size', 'Oak Layer', 'Finish', 'Style'];
        this.specificationsVinyl = ['Thickness', 'Wear Layer', 'Backing', 'Suitability', 'Style'];
        this.specificationsLVT = ['Thickness', 'Wear Layer', 'Pack Size (M²)', 'Planks Per Pack', 'Plank Size', 'Installation System', 'Style', 'Usage Class'];
        this.specificationsRealWood = ['Thickness', 'Pack Size (M²)', 'Planks Per Pack', 'Plank Size', 'Oak Layer', 'Finish', 'Style'];
        this.specificationsAccessories = ['TOG Rating', 'Pack Size (M²)', 'Density', 'Impact sound reduction', 'Material', 'Style', 'Door Bar Length'];
        this.specificationsRugs = ['Material', 'Pile Height', 'Style', 'Door Bar Length'];
        this.specificationsArtificialGrass = ['Pile Height', 'Material', 'Pile Weight', 'Total Weight', 'Style', 'Drainage Holes'];

        if (!this.products) this.bindModalEvents();

        // Resize the columns of the tables already shown when crossing 769px or 500px
        const resizeColumns = () => {
            if (!this.gridsContainer) return;

            this.gridsContainer
                .querySelectorAll('.compare-modal__product-grid:not(.compare-modal__product-grid--empty)')
                .forEach(grid => this.setGridColumns(grid));
            this.updateGridWidths();
        };

        this.smallScreenQuery.addEventListener('change', resizeColumns);
        this.extraSmallScreenQuery.addEventListener('change', resizeColumns);

        this.renderNav();
        this.renderGrid();
    }

    bindModalEvents() {
        // Fixed button to reopen the modal, shown once a product has been added
        this.openButton = document.querySelector('.compare-open-button');
        this.openButton?.addEventListener('click', () => {
            Compare.track('compare_open', { compare_count: this.getProducts().length });
            this.openModal();
        });

        // Header icon. With nothing to compare yet it goes to the carpets collection and points at the first
        // product's compare button, and without the modal it links to the comparison page
        this.headerButton = document.querySelector('.header-compare');
        this.headerButton?.addEventListener('click', event => {
            if (!this.getProducts().length) {
                event.preventDefault();

                try {
                    sessionStorage.setItem(this.hintStorageKey, '1');
                } catch (error) {
                    // Still go to the collection, just without the tooltip
                }

                window.location.href = '/collections/carpets';
                return;
            }

            if (!this.modalContainer) return;

            event.preventDefault();
            Compare.track('compare_open', { compare_count: this.getProducts().length, source: 'header' });
            this.openModal();
        });

        let compareButtons = document.querySelectorAll('.compare-button');
        let that = this;
        compareButtons.forEach(compareButton => {
            compareButton.addEventListener('click', function(e) {
                e.preventDefault();
                that.handleCompareClick(compareButton);
            });
        });

        const clearButton = document.getElementById('clear-product-ids');
        if (clearButton) {
            clearButton.addEventListener('click', this.clearProducts.bind(this));
        }

        const closeButton = document.getElementById('close-compare-modal');
        if (closeButton) {
            closeButton.addEventListener('click', this.closeModal.bind(this));
        }

        const modalBackground = document.querySelector('.compare-modal-background');
        if (modalBackground) {
            modalBackground.addEventListener('click', this.closeModal.bind(this));
        }

        this.bindHeaderActions();

        this.addProductClose = this.addProductContainer?.querySelector('.compare-modal__add-product--close');
        this.moreProductsButton = document.querySelector('.compare-modal__more-products');

        if (this.addProductClose) {
            this.addProductClose.addEventListener('click', () => this.setAddProductVisible(false));
        }

        if (this.moreProductsButton) {
            this.moreProductsButton.addEventListener('click', () => this.setAddProductVisible(true));
        }

        // Filters the add product list by title, waiting for a pause in typing
        this.addProductSearch = this.addProductContainer?.querySelector('#compare-add-product-search');
        this.addProductSearch?.addEventListener('input', () => {
            clearTimeout(this.addProductSearchTimer);
            this.addProductSearchTimer = setTimeout(() => this.renderAddProducts(), 250);
        });

        // Under 900px the add product panel is a popup. Closed by default at all sizes, opened with "Add products"
        this.mobileQuery = window.matchMedia('(max-width: 899px)');

        if (this.addProductContainer) {
            const applyLayout = () => this.setAddProductVisible(false, { focus: false, animate: false });

            // Runs on load and whenever the viewport crosses 900px
            applyLayout();
            this.mobileQuery.addEventListener('change', applyLayout);

            document.querySelector('.compare-modal__add-product-backdrop')
                ?.addEventListener('click', () => this.setAddProductVisible(false));

            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && this.mobileQuery.matches && this.isAddProductOpen()) {
                    this.setAddProductVisible(false);
                }
            });
        }
    }

    // Below 769px "Add products" and "Share" move out of the header into their own row.
    // Moving the elements keeps their event listeners
    bindHeaderActions() {
        const actions = document.querySelector('.compare-modal__actions');
        const headerCol = document.querySelector('.compare-modal__header--col');
        const buttons = [
            document.querySelector('.compare-modal__more-products-wrapper'),
            document.querySelector('.compare-modal__header .comparison-page__share'),
        ].filter(Boolean);

        if (!actions || !headerCol || !buttons.length) return;

        const smallQuery = window.matchMedia('(max-width: 768px)');
        const placeButtons = () => {
            if (smallQuery.matches) {
                actions.append(...buttons);
            } else {
                headerCol.before(...buttons);
            }
        };

        placeButtons();
        smallQuery.addEventListener('change', placeButtons);
    }

    // Sent to Google Analytics through Google Tag Manager, see the GA4 tag triggered by "compare_" events
    static track(event, params = {}) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event, ...params });
    }

    // Sent once per browser, the first time any compare button is clicked
    static trackFirstClick(button, source) {
        const storageKey = 'compare_first_click_tracked';

        try {
            if (localStorage.getItem(storageKey)) return;
            localStorage.setItem(storageKey, '1');
        } catch (error) {
            return;
        }

        Compare.track('compare_first_click', {
            product_type: button.dataset.type,
            product_handle: button.dataset.handle,
            source,
        });
    }

    clearProducts() {
        Compare.track('compare_clear', { compare_count: this.getProducts().length });

        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Unable to clear compare products', error);
        }

        this.renderNav();
        this.renderGrid();
        this.closeModal();
    }

    updateCount() {
        const countElement = document.getElementById('compare-count');

        if (!countElement) return;

        const count = this.getProducts()
            .filter(({ type = '' }) => type === this.activeType)
            .length;

        const inner = document.createElement('span');
        inner.className = 'compare-count__inner';
        inner.textContent = `${count}/${this.maxProducts}`;
        countElement.replaceChildren(inner);
    }

    getProductTypes() {
        return [...new Set(this.getProducts().map(({ type = '' }) => type))];
    }

    getTypes() {
        // Only types that have products are shown in the nav
        return this.getProductTypes();
    }

    renderNav() {
        const types = this.getTypes();

        if (!types.includes(this.activeType)) this.activeType = types[0] ?? null;

        if (this.nav) {
            const links = types.map(type => {
                const link = document.createElement('a');
                link.href = '#';
                link.dataset.type = type;
                link.textContent = type || 'Other';
                link.addEventListener('click', event => {
                    event.preventDefault();
                    this.selectType(type);
                });

                return link;
            });

            this.nav.replaceChildren(...links);
            // Nothing to switch between with a single type
            this.nav.hidden = types.length < 2;
        }

        this.updateViewFullLink();
        this.updateOpenButton();
        this.updateActiveType();
    }

    updateOpenButton() {
        const count = this.getProducts().length;

        if (this.headerButton) {
            this.headerButton.setAttribute('aria-label', `Compare products (${count})`);

            const headerCount = this.headerButton.querySelector('.header-compare__count');
            if (headerCount) {
                headerCount.textContent = count;
                headerCount.hidden = !count;
            }
        }

        if (!this.openButton) return;

        this.openButton.hidden = !count;
        this.openButton.setAttribute('aria-label', `Compare products (${count})`);

        const countElement = this.openButton.querySelector('.compare-open-button__count');
        if (countElement) countElement.textContent = count;

    }

    updateViewFullLink() {
        if (!this.viewFullLink) return;

        const url = new URL(this.viewFullLink.getAttribute('href'), window.location.origin);
        const products = this.getProducts();

        if (products.length) {
            url.searchParams.set('compare', Compare.toUrlParam(products));
        } else {
            url.searchParams.delete('compare');
        }

        this.viewFullLink.href = url.pathname + url.search;
    }

    selectType(type) {
        // A search is for one collection, so start the next type with its full list
        if (this.addProductSearch && type !== this.activeType) this.addProductSearch.value = '';

        this.activeType = type;
        this.updateActiveType();
        this.renderAddProducts();
    }

    updateActiveType() {
        this.updateCount();
        this.updateLimitWarning();

        if (this.nav) {
            this.nav.querySelectorAll('a').forEach(link => {
                const isActive = link.dataset.type === this.activeType;

                link.classList.toggle('active', isActive);

                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        if (this.gridsContainer) {
            this.gridsContainer.querySelectorAll('.compare-modal__product-grid').forEach(grid => {
                grid.hidden = grid.dataset.type !== this.activeType;
            });
        }
    }

    handleCompareClick(button) {
        const { handle, type, variantId } = button.dataset;

        Compare.trackFirstClick(button, 'button');
        this.addProduct(handle, type, variantId ? Number(variantId) : null);
        this.openModal();
    }

    openModal() {
        if (!this.modalContainer) return;

        this.modalContainer.classList.add(this.modalOpenClass);
        // Stops the page behind the modal from scrolling. Set on <html>, as that's what scrolls the page
        document.documentElement.classList.add('compare-modal-is-open');
    }

    closeModal() {
        if (!this.modalContainer) return;

        this.modalContainer.classList.remove(this.modalOpenClass);
        document.documentElement.classList.remove('compare-modal-is-open');
    }

    static parseProducts(json) {
        try {
            const products = JSON.parse(json);
            if (!Array.isArray(products)) return [];

            // Skip entries saved in the old plain-handle format
            return products.filter(product => product && typeof product.handle === 'string');
        } catch (error) {
            return [];
        }
    }

    // Links list each product as "handle" or "handle:variant", e.g. ?compare=oxford-twist:123,berber-loop
    // The type isn't in the link, the comparison page gets it from the product data
    static toUrlParam(products) {
        return products
            .map(({ handle, variant }) => (variant ? `${handle}:${variant}` : handle))
            .join(',');
    }

    static getUrlProducts() {
        const value = new URLSearchParams(window.location.search).get('compare') || '';

        // Links shared before the short format list the products as JSON
        if (value.startsWith('[')) return Compare.parseProducts(value);

        return value
            .split(',')
            .filter(Boolean)
            .map(entry => {
                const [handle, variant] = entry.split(':');

                return variant ? { handle, variant: Number(variant) } : { handle };
            });
    }

    // After the header link sent someone here, scrolls to the first product and shows its compare tooltip
    showCompareHint() {
        try {
            if (!sessionStorage.getItem(this.hintStorageKey)) return;
            sessionStorage.removeItem(this.hintStorageKey);
        } catch (error) {
            return;
        }

        const button = document.querySelector('.product-grid .compare-button');
        if (!button) return;

        const product = button.closest('.item') || button;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // The header is fixed and covers the top of the page, and it gets shorter once scrolled
        const getHeaderBottom = () => Math.max(0, ...['shopify-section-header', 'mastHeadTop']
            .map(id => document.getElementById(id)?.getBoundingClientRect().bottom || 0));

        // Puts the top of the product, where the compare button is, just below the header.
        // Centring it instead pushed the button off the top below 1024px, where products are taller than the screen
        const scrollToProduct = behavior => {
            const top = product.getBoundingClientRect().top + window.scrollY - getHeaderBottom() - 16;
            window.scrollTo({ top: Math.max(0, top), behavior });
        };

        scrollToProduct(reduceMotion ? 'auto' : 'smooth');

        // Wait for the scroll to finish so the tooltip's animation isn't missed. The timeout covers
        // browsers without scrollend, and pages that didn't need to scroll
        let shown = false;
        const showTooltip = () => {
            if (shown) return;
            shown = true;

            // The header shrinking or images loading above can move the product while scrolling, so correct for it
            const { top, bottom } = button.getBoundingClientRect();
            if (top < getHeaderBottom() || bottom > window.innerHeight) scrollToProduct('auto');

            button.classList.add('compare-button--show-tooltip');
            setTimeout(() => button.classList.remove('compare-button--show-tooltip'), 4000);
        };

        window.addEventListener('scrollend', showTooltip, { once: true });
        setTimeout(showTooltip, 1000);
    }

    getStoredProducts() {
        try {
            return Compare.parseProducts(localStorage.getItem(this.storageKey));
        } catch (error) {
            return [];
        }
    }

    getProducts() {
        return this.products || this.getStoredProducts();
    }

    // Identifies an entry, so different variants of the same product can be compared
    static getEntryKey({ handle, variant = null }) {
        return variant ? `${handle}:${variant}` : handle;
    }

    // source is where it was added from, "button" for compare buttons or "add_panel" for the add product panel
    // On the comparison page it's added to the products on the page and the page's URL, not local storage
    addProduct(handle, type, variantId = null, source = 'button') {
        const products = [...this.getProducts()];
        const key = Compare.getEntryKey({ handle, variant: variantId });

        if (products.some(product => Compare.getEntryKey(product) === key)) return false;

        const sameTypeCount = products.filter(product => (product.type || '') === (type || '')).length;
        if (sameTypeCount >= this.maxProducts) {
            this.showLimitReached(type);
            return false;
        }

        const isNewCategory = sameTypeCount === 0;

        // Buttons on the product page are per colour, so save which variant was picked
        products.push(variantId ? { type, handle, variant: variantId } : { type, handle });

        if (this.products) {
            this.products = products;
        } else {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(products));
            } catch (error) {
                console.warn('Unable to save compare products', error);
                return false;
            }
        }

        Compare.track('compare_add', {
            product_type: type,
            product_handle: handle,
            variant_id: variantId,
            source,
            compare_count: products.length,
        });

        // The first product of a type starts a new table in the comparison
        if (isNewCategory) {
            Compare.track('compare_category_add', {
                product_type: type,
                product_handle: handle,
                origin: source,
                category_count: new Set(products.map(product => product.type || '')).size,
            });
        }

        this.activeType = type;
        // Scrolled into view once the grid has been rebuilt
        this.scrollToKey = key;

        this.updateUrl(products);
        this.renderNav();
        this.renderGrid();
        this.onChange?.();

        return true;
    }

    updateUrl(products) {
        const url = new URL(window.location.href);

        if (products.length) {
            url.searchParams.set('compare', Compare.toUrlParam(products));
        } else {
            url.searchParams.delete('compare');
        }

        window.history.replaceState(window.history.state, '', url);
    }

    removeProduct(key) {
        const removed = this.getProducts().find(product => Compare.getEntryKey(product) === key);

        if (removed) {
            Compare.track('compare_remove', {
                product_type: removed.type,
                product_handle: removed.handle,
            });
        }

        if (this.products) {
            this.products = this.products.filter(product => Compare.getEntryKey(product) !== key);

            this.updateUrl(this.products);
            this.renderNav();
            this.renderGrid();
            this.onChange?.();
            return;
        }

        const products = this.getStoredProducts().filter(product => Compare.getEntryKey(product) !== key);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(products));
        } catch (error) {
            console.warn('Unable to remove compare product', error);
            return;
        }

        this.renderNav();
        this.renderGrid();
    }

    // Shared between the modal and the comparison page, so a product is only fetched once
    static productRequests = new Map();

    fetchProduct(handle) {
        if (!Compare.productRequests.has(handle)) {
            Compare.productRequests.set(handle, this.requestProduct(handle));
        }

        return Compare.productRequests.get(handle);
    }

    async requestProduct(handle) {
        const root = window.Shopify?.routes?.root || '/';

        try {
            // templates/product.compare.liquid: the products/{handle}.js data plus the Juno metafields
            const response = await fetch(`${root}products/${handle}?view=compare`);

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const { product, metafields: { variants: variantMetafields = [], ...metafields } } = await response.json();
            const metafieldsByVariantId = new Map(variantMetafields.map(({ id, ...fields }) => [id, fields]));

            return {
                ...product,
                metafields,
                variants: (product.variants || []).map(variant => ({
                    ...variant,
                    metafields: metafieldsByVariantId.get(variant.id) || {},
                })),
            };
        } catch (error) {
            console.warn(`Unable to load product ${handle}`, error);
            return null;
        }
    }

    // The variant saved when it was added from the product page. Collection and related product
    // compare buttons add the whole product, so have no variant and show the product's own details
    getSelectedVariant(product, variantId) {
        if (!variantId) return null;

        return (product.variants || []).find(variant => variant.id === variantId) || null;
    }

    // The variant's option values without the size, e.g. "Grey / 4m" -> "Grey"
    getVariantName(product, variant) {
        if (!variant) return '';

        // Products without options have a single "Default Title" variant
        if (variant.title === 'Default Title') return '';

        // products/{handle}.js gives options as objects, the Liquid json filter may give plain names
        const optionNames = (product.options || []).map(option => (typeof option === 'string' ? option : option.name) || '');
        const values = variant.options || [variant.option1, variant.option2, variant.option3].filter(Boolean);

        return values
            .filter((value, index) => !this.isSizeOption(optionNames[index]))
            .join(' / ');
    }

    // Matches the option names snippets/product-details.liquid treats as sizes
    isSizeOption(name = '') {
        const optionName = name.trim().toLowerCase();

        return optionName === 'width' || optionName.includes('size');
    }

    // From the variant's Juno is_in_stock metafield (templates/product.compare.liquid)
    getStockStatus(variant) {
        const inStock = variant?.metafields?.is_in_stock;

        if (inStock === '1') {
            return 'In stock';
        }
        return 'Out of stock';
    }

    // The selected variant's stock, or for a whole product, in stock if any of its variants are
    getProductStockStatus(product) {
        if (product.selectedVariant) return this.getStockStatus(product.selectedVariant);

        const anyInStock = (product.variants || []).some(variant => this.getStockStatus(variant) === 'In stock');

        return anyInStock ? 'In stock' : 'Out of stock';
    }

    createStockValue(product) {
        const status = this.getProductStockStatus(product);

        if (status === '-') return status;

        const stockLevel = document.createElement('p');
        stockLevel.id = 'stockLevel';
        stockLevel.className = status === 'In stock' ? 'instock' : 'outofstock';
        stockLevel.textContent = status;

        const icon = document.createElement('i');
        icon.className = status === 'In stock' ? 'icon-instock' : 'icon-outofstock';
        stockLevel.prepend(icon, ' ');

        return stockLevel;
    }

    getProductUrl(product) {
        const root = window.Shopify?.routes?.root || '/';

        return product.url || `${root}products/${product.handle}`;
    }

    createProductImage(product) {
        const productUrl = this.getProductUrl(product);

        const image = document.createElement('img');

        // Variants without their own image have featured_image set to null
        image.src = product.selectedVariant?.featured_image?.src || product.featured_image;
        // The title link names the product, so the image doesn't need to
        image.alt = '';
        image.loading = 'lazy';

        // Duplicate of the title link, so keep it out of the tab order and screen readers
        const imageLink = document.createElement('a');
        imageLink.href = productUrl;
        imageLink.tabIndex = -1;
        imageLink.setAttribute('aria-hidden', 'true');
        imageLink.appendChild(image);

        // Show the loading skeleton until the image has loaded. Images already in the browser's cache
        // are complete straight away, so products already in the table don't flash the skeleton when it re-renders
        if (!(image.complete && image.naturalWidth)) {
            imageLink.classList.add('compare-skeleton', 'compare-product-image--loading');

            const showImage = () => imageLink.classList.remove('compare-skeleton', 'compare-product-image--loading');
            image.addEventListener('load', showImage, { once: true });
            // Don't leave the skeleton shimmering if the image fails
            image.addEventListener('error', showImage, { once: true });
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'compare-product-image';
        wrapper.appendChild(imageLink);

        const titleLink = document.createElement('a');
        titleLink.href = productUrl;
        titleLink.textContent = product.title;

        const trackClick = () => Compare.track('compare_product_click', {
            product_type: product.type,
            product_handle: product.handle,
        });
        imageLink.addEventListener('click', trackClick);
        titleLink.addEventListener('click', trackClick);

        const variantTitle = this.getVariantName(product, product.selectedVariant);

        if (variantTitle) {
            const variantName = document.createElement('div');
            variantName.className = 'compare-product-title__variant';
            variantName.textContent = variantTitle;
            titleLink.append(' ', variantName);
        }

        const title = document.createElement('div');
        title.className = 'compare-product-title';
        title.appendChild(titleLink);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'compare-product-remove';
        removeButton.setAttribute('aria-label', `Remove ${product.title} from comparison`);
        removeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
        `;
        removeButton.addEventListener('click', () => this.removeProduct(product.compareKey));

        const productCard = document.createElement('div');
        productCard.className = 'compare-product';
        productCard.dataset.key = product.compareKey;
        productCard.append(removeButton, wrapper, title);

        return productCard;
    }

    getSpecificationValue(product, specification) {
        const prefix = `${specification}_`;

        const value = (product.tags || [])
            .filter(tag => tag.startsWith(prefix))
            .map(tag => tag.replace(prefix, ''))
            .join(', ');

        return value || '-';
    }

    formatPrice(cents) {
        const currency = window.Shopify?.currency?.active || 'GBP';

        return new Intl.NumberFormat(document.documentElement.lang || 'en-GB', {
            style: 'currency',
            currency,
        }).format(cents / 100);
    }

    // From the "Pack Size (M²)_" tag, e.g. "Pack Size (M²)_2.22m²" -> 2.22, matching snippets/product-details-top.liquid
    getPackSize(product) {
        const prefix = 'Pack Size (M²)_';
        const tag = (product.tags || []).find(tag => tag.includes(prefix));
        const packSize = tag ? parseFloat(tag.replace(prefix, '').split('m')[0]) : NaN;

        return packSize > 0 ? packSize : null;
    }

    createPriceValue(product) {
        const fragment = document.createDocumentFragment();

        const isPackPriced = ['Laminate', 'LVT', 'Real Wood'].includes(product.type);

        // These are priced per pack, so show them per m² like the product page
        const packSize = (isPackPriced && this.getPackSize(product)) || 1;
        const priceCents = Math.round(product.price / packSize);
        const rrpPrice = this.getRrpPrice(product, priceCents / 100, true, packSize);

        if (rrpPrice) {
            const rrp = document.createElement('s');
            rrp.className = 'compare-product-rrp';
            rrp.textContent = `${rrpPrice.label} ${rrpPrice.amount}`;
            fragment.append(rrp, ' ');
        }

        const price = document.createElement('span');
        price.className = 'compare-product-price';
        const only = document.createElement('span');
        only.className = 'compare-product-price__only';
        only.textContent = 'Only';
        price.append(only, ` ${this.formatPrice(priceCents)}${this.getPriceUnit(product.type)} `);
        fragment.prepend(price);

        return fragment;
    }

    createRow(labelText, products, getValue) {
        const fragment = document.createDocumentFragment();

        const label = document.createElement('div');
        label.className = 'specification';
        label.textContent = labelText;
        fragment.appendChild(label);

        products.forEach(product => {
            const value = document.createElement('div');
            value.className = 'specification-value';
            value.dataset.key = product.compareKey;
            value.append(getValue(product));
            fragment.appendChild(value);
        });

        return fragment;
    }

    createSkeletonLine() {
        const line = document.createElement('div');
        line.className = 'compare-skeleton compare-skeleton__line';

        return line;
    }

    groupByType(storedProducts) {
        const groups = new Map();

        storedProducts.forEach(entry => {
            const type = entry.type || '';

            if (!groups.has(type)) groups.set(type, []);
            groups.get(type).push(entry);
        });

        return groups;
    }

    get labelColumnWidth() {
        if (this.extraSmallScreenQuery.matches) return 100;

        return this.smallScreenQuery.matches ? 120 : 160;
    }

    get productColumnWidth() {
        return this.extraSmallScreenQuery.matches ? 130 : 230;
    }

    setGridColumns(grid) {
        grid.style.gridTemplateColumns = `${this.labelColumnWidth}px repeat(${grid.dataset.columns}, ${this.productColumnWidth}px)`;
    }

    createGrid(type, columns) {
        const grid = document.createElement('div');
        grid.className = 'compare-modal__product-grid';
        grid.dataset.type = type;
        grid.dataset.columns = columns;
        this.setGridColumns(grid);

        const spacer = document.createElement('div');
        spacer.className = 'compare-product-spacer';
        grid.appendChild(spacer);

        return grid;
    }

    getSpecifications(type) {
        switch (type) {
            case 'Laminate':
                return this.specificationsLaminate;
            case 'Artificial Grass':
                return this.specificationsArtificialGrass;
            case 'Vinyl':
                return this.specificationsVinyl;
            case 'LVT':
                return this.specificationsLVT;
            case 'Real Wood':
                return this.specificationsRealWood;
            case 'Accessories & Underlay':
                return this.specificationsAccessories;
            case 'Rugs':
                return this.specificationsRugs;
            default:
                return this.specifications;
        }
    }

    createSkeletonGrid(type, count) {
        const grid = this.createGrid(type, count);

        for (let i = 0; i < count; i++) {
            const image = document.createElement('div');
            image.className = 'compare-skeleton compare-skeleton__image';

            const productCard = document.createElement('div');
            productCard.className = 'compare-product';
            productCard.append(image, this.createSkeletonLine());

            grid.appendChild(productCard);
        }

        // Price and Stock rows, then the specifications
        const rowCount = this.getSpecifications(type).length + 2;
        
        for (let row = 0; row < rowCount; row++) {
            const label = document.createElement('div');
            label.className = 'specification';
            label.appendChild(this.createSkeletonLine());
            grid.appendChild(label);

            for (let i = 0; i < count; i++) {
                const value = document.createElement('div');
                value.className = 'specification-value';
                value.appendChild(this.createSkeletonLine());
                grid.appendChild(value);
            }
        }

        return grid;
    }

    createProductGrid(type, products) {
        const grid = this.createGrid(type, products.length);

        products.forEach(product => {
            grid.appendChild(this.createProductImage(product));
        });

        // The cells sit directly in the grid, so mark every even row for its background colour
        let rowCount = 0;
        const appendRow = row => {
            rowCount += 1;
            if (rowCount % 2 === 0) row.childNodes.forEach(cell => cell.classList.add('compare-row--even'));
            grid.appendChild(row);
        };

        appendRow(
            this.createRow('Price', products, product => this.createPriceValue(product))
        );

        appendRow(
            this.createRow('Stock', products, product => this.createStockValue(product))
        );

        this.getSpecifications(type)
            // Skip specifications none of the products have
            .filter(specification => products.some(product => this.getSpecificationValue(product, specification) !== '-'))
            .forEach(specification => {
                appendRow(
                    this.createRow(specification, products, product => this.getSpecificationValue(product, specification))
                );
            });

        return grid;
    }

    getCollectionId(collection_id) {
        switch (collection_id) {
            case 'laminate':
                return 'laminate-flooring';
            case 'accessories-underlay':
                return 'accessories';
            case 'vinyl':
                return 'vinyl-flooring';
            case 'lvt':
                return 'lvt-flooring';
            case 'artificial grass':
                return 'artificial-grass';
            default:
                return collection_id;
        }
    }

    async renderGrid() {
        if (!this.gridsContainer) return;

        const renderId = this.renderId = (this.renderId || 0) + 1;

        const storedProducts = this.getProducts();

        if (!storedProducts.length && this.emptyMessage) {
            const message = document.createElement('p');
            message.className = 'comparison-page__empty';
            message.textContent = this.emptyMessage;

            const browseLink = document.createElement('a');
            browseLink.className = 'button comparison-page__browse';
            browseLink.href = window.Shopify?.routes?.root || '/';
            browseLink.textContent = 'Browse our products';

            const browseWrapper = document.createElement('div');
            browseWrapper.className = 'comparison-page__browse-wrapper';
            browseWrapper.appendChild(browseLink);

            this.gridsContainer.replaceChildren(message, browseWrapper);
            return;
        }

        const groups = this.groupByType(storedProducts);

        this.gridsContainer.replaceChildren(
            ...[...groups].map(([type, entries]) => this.createSkeletonGrid(type, entries.length)),
            ...this.createEmptyTypeGrids([...groups.keys()])
        );
        this.updateGridWidths();
        this.updateActiveType();

        // Variants of the same product share one request
        const handles = [...new Set(storedProducts.map(({ handle }) => handle))];
        const results = await Promise.all(handles.map(handle => this.fetchProduct(handle)));
        const productsByHandle = new Map();

        results.forEach(product => {
            if (product && product.featured_image) productsByHandle.set(product.handle, product);
        });

        // A newer render started while this one was fetching
        if (renderId !== this.renderId) return;

        const grids = [];

        groups.forEach((entries, type) => {
            const products = entries
                .filter(entry => productsByHandle.has(entry.handle))
                .map(entry => {
                    const product = productsByHandle.get(entry.handle);

                    return {
                        ...product,
                        compareKey: Compare.getEntryKey(entry),
                        selectedVariant: this.getSelectedVariant(product, entry.variant),
                    };
                });

            if (products.length) grids.push(this.createProductGrid(type, products));
        });

        const typesWithGrids = grids.map(grid => grid.dataset.type);

        this.gridsContainer.replaceChildren(...grids, ...this.createEmptyTypeGrids(typesWithGrids));
        this.updateGridWidths();
        this.updateActiveType();
        this.renderAddProducts();
        this.scrollToAddedProduct();
    }

    // A placeholder grid for each nav type that has no products, so selecting it shows a message
    createEmptyTypeGrids(typesWithGrids) {
        return this.getTypes()
            .filter(type => !typesWithGrids.includes(type))
            .map(type => {
                const grid = document.createElement('div');
                grid.className = 'compare-modal__product-grid compare-modal__product-grid--empty';
                grid.dataset.type = type;
                grid.dataset.columns = 0;

                const message = document.createElement('p');
                message.className = 'compare-modal__type-empty';
                message.textContent = `No ${type || 'other'} products added to compare yet.`;

                grid.appendChild(message);

                return grid;
            });
    }

    scrollToAddedProduct() {
        const key = this.scrollToKey;
        this.scrollToKey = null;

        if (!key) return;

        const card = [...this.gridsContainer.querySelectorAll('.compare-product')]
            .find(productCard => productCard.dataset.key === key);

        if (!card) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // "nearest" only scrolls when the product isn't already fully in view
        card.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'nearest',
        });
    }

    updateGridWidths() {
        const grids = [...this.gridsContainer.querySelectorAll('.compare-modal__product-grid')];

        // Hidden grids measure as 0 wide, so work the widths out from their column counts
        const widths = grids.map(grid => {
            const columns = Number(grid.dataset.columns) || 0;
            const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
            
            return this.labelColumnWidth + columns * (this.productColumnWidth + gap);
        });

        const widest = Math.max(0, ...widths);

        // Keep every grid as wide as the widest so the modal doesn't resize when switching type
        grids.forEach(grid => {
            grid.style.minWidth = `${widest}px`;
        });
    }

    // The list shows the first 10. Searching loads up to 250, the most products.json returns at once
    async fetchProductsByType(type, limit = 10) {
        const cacheKey = `${type}:${limit}`;

        if (this.productsByType.has(cacheKey)) return this.productsByType.get(cacheKey);

        const root = window.Shopify?.routes?.root || '/';
        // Collection handles are lowercase with hyphens, like Shopify's handleize,
        // e.g. "Artificial Grass" -> "artificial-grass", "Accessories & Underlay" -> "accessories-underlay"
        const handle = type.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        let collection_id = this.getCollectionId(handle);
        
        try {
            const response = await fetch(`${root}collections/${collection_id}/products.json?limit=${limit}`);
            
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            
            const data = await response.text();
            const dataObj = JSON.parse(data);

            const products = (dataObj.products || []).filter(product => product.product_type.toLowerCase() === type.toLowerCase());
        
            this.productsByType.set(cacheKey, products);

            return products;
        } catch (error) {
            console.warn(`Unable to load ${type} products`, error);
            return [];
        }
    }

    getProductImage(product) {
        // products.json returns an images array rather than a single image
        return product.images?.[0]?.src || '';
    }

    // Matches the theme's product grid: "was" price if on sale, otherwise RRP from an RRP_ tag
    // products.json gives compare_at_price as a decimal string, products/{handle}.js in cents
    // packSize divides the "was" price to per m², as price should already be. The RRP_ tag is already per m².
    // Sold per item, so have no per m² unit
    getPriceUnit(type) {
        return ['Accessories & Underlay', 'Rugs'].includes(type) ? '' : 'm²';
    }

    getRrpPrice(product, price, compareAtInCents = false, packSize = 1) {
        const unit = this.getPriceUnit(product.type ?? product.product_type);
        const compareAtPrices = (product.variants || [])
            .map(variant => parseFloat(variant.compare_at_price))
            .filter(compareAt => !Number.isNaN(compareAt))
            .map(compareAt => (compareAtInCents ? compareAt / 100 : compareAt) / packSize);

        const compareAt = compareAtPrices.length ? Math.min(...compareAtPrices) : 0;

        if (compareAt > price) return { label: 'was', amount: `${this.formatPrice(Math.round(compareAt * 100))}${unit}` };

        const tags = Array.isArray(product.tags) ? product.tags : String(product.tags || '').split(', ');
        const rrpTag = tags.find(tag => tag.startsWith('RRP_'));
        const rrp = rrpTag ? parseFloat(rrpTag.replace('RRP_', '')) : 0;

        if (rrp > price) return { label: 'RRP', amount: `${this.formatPrice(Math.round(rrp * 100))}${unit}` };

        return null;
    }

    createAddProductItem(product) {
        const image = document.createElement('img');
        image.src = this.getProductImage(product);
        // The button's label already names the product
        image.alt = '';
        image.loading = 'lazy';

        const title = document.createElement('span');
        title.className = 'compare-add-product__title';
        title.textContent = product.title;

        const details = document.createElement('span');
        details.className = 'compare-add-product__details';
        details.appendChild(title);

        // products.json gives variant prices as decimal strings, e.g. "19.99"
        const prices = (product.variants || [])
            .map(variant => parseFloat(variant.price))
            .filter(price => !Number.isNaN(price));

        if (prices.length) {
            const lowestPrice = Math.min(...prices);

            const price = document.createElement('span');
            price.className = 'compare-add-product__price';
            price.textContent = `only ${this.formatPrice(Math.round(lowestPrice * 100))}${this.getPriceUnit(product.product_type)}`;
            details.appendChild(price);

            const rrpPrice = this.getRrpPrice(product, lowestPrice);

            if (rrpPrice) {
                const rrp = document.createElement('s');
                rrp.className = 'compare-add-product__rrp';
                rrp.textContent = `${rrpPrice.label} ${rrpPrice.amount}`;
                details.appendChild(rrp);
            }
        }

        // The whole item is the button, so this only shows the plus. A button can't contain another button
        const plus = document.createElement('span');
        plus.className = 'compare-add-product__plus';
        plus.setAttribute('aria-hidden', 'true');
        plus.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 5V19M5 12H19"/>
            </svg>
        `;

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'compare-add-product';
        item.setAttribute('aria-label', `Add ${product.title} to comparison`);
        item.append(image, details, plus);
        item.addEventListener('click', () => {
            this.addProduct(product.handle, product.product_type, null, 'add_panel');

            // Close the popup on smaller screens so the added product, or the limit warning, can be seen
            if (this.mobileQuery?.matches) this.setAddProductVisible(false);
        });

        return item;
    }

    showLimitReached(type) {
        Compare.track('compare_limit_reached', { product_type: type });

        // The modal slides in when opened from a compare button, so wait for it before shuddering
        const wasOpen = this.modalContainer?.classList.contains(this.modalOpenClass);

        // Show the warning on the type that's full, even if it was dismissed before
        this.limitReachedTypes.add(type || '');
        this.selectType(type || '');

        // On the comparison page the product was added from further down, so bring the warning into view
        if (!this.modalContainer) {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.limitWarning?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }

        // The warning sits on the modal, so it shows whether or not the add product panel is open
        clearTimeout(this.shudderTimer);
        this.shudderTimer = setTimeout(() => this.shudderLimitWarning(), wasOpen || !this.modalContainer ? 0 : 300);
    }

    shudderLimitWarning() {
        const warning = this.limitWarning;

        if (!warning || warning.hidden) return;

        // Restart the animation if it's already running
        warning.classList.remove('is-shuddering');
        void warning.offsetWidth;
        warning.classList.add('is-shuddering');

        warning.addEventListener('animationend', () => warning.classList.remove('is-shuddering'), { once: true });
    }

    isAddProductOpen() {
        const modal = this.addProductContainer?.closest('.compare-modal');

        return Boolean(modal) && !modal.classList.contains('compare-modal--aside-closed');
    }

    setAddProductVisible(isVisible, { focus = true, animate = true } = {}) {
        if (!this.addProductContainer) return;

        const panel = this.addProductContainer;
        const modal = panel.closest('.compare-modal');

        clearTimeout(this.addProductTimer);

        if (isVisible) {
            panel.hidden = false;
            modal?.classList.remove('compare-modal--no-aside');

            // Apply the closed position first so the slide in animates
            void panel.offsetWidth;
            modal?.classList.remove('compare-modal--aside-closed');
        } else {
            modal?.classList.add('compare-modal--aside-closed');

            const removePanel = () => {
                panel.hidden = true;
                modal?.classList.add('compare-modal--no-aside');
            };

            // Once the slide out has finished, remove the panel and its column
            if (animate) {
                this.addProductTimer = setTimeout(removePanel, 300);
            } else {
                removePanel();
            }
        }

        if (this.moreProductsButton) {
            // "More products" is only needed while the panel is hidden, and when there's something to add
            this.moreProductsButton.hidden = isVisible || !this.hasProductsToAdd;
            this.moreProductsButton.setAttribute('aria-expanded', String(isVisible));
        }

        // Move focus to the control that's now visible
        if (!focus) return;

        if (isVisible) {
            this.addProductClose?.focus();
        } else {
            this.moreProductsButton?.focus();
        }
    }

    updateLimitWarning() {
        // The comparison page has no add product panel, but shows the warning under its nav
        if (!this.addProductContainer && !this.nav) return;

        let warning = this.limitWarning;

        if (!warning) {
            warning = this.limitWarning = document.createElement('div');
            warning.className = 'compare-modal__limit-warning';
            warning.setAttribute('role', 'status');

            const message = document.createElement('span');
            message.className = 'compare-modal__limit-warning--text';
            message.textContent = `You can compare up to ${this.maxProducts} products of the same type. Remove a product to add another.`;

            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'compare-modal__limit-warning--close';
            closeButton.setAttribute('aria-label', 'Dismiss message');
            closeButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
            `;
            closeButton.addEventListener('click', () => {
                this.limitReachedTypes.delete(this.activeType);
                warning.hidden = true;
            });

            warning.append(message, closeButton);

            // Under the nav rather than in the add product panel, so it's visible while the panel is closed
            if (this.nav) {
                this.nav.after(warning);
            } else {
                (this.addProductContainer.closest('.compare-modal') || this.addProductContainer).appendChild(warning);
            }
        }

        const count = this.getProducts().filter(({ type = '' }) => type === this.activeType).length;
        const isFull = count >= this.maxProducts;

        // Once a product is removed there's room again, so wait for the next attempt to add a 5th
        if (!isFull) this.limitReachedTypes.delete(this.activeType);

        // Only after trying to add one more than the limit, not as soon as the type is full
        warning.hidden = !isFull || !this.limitReachedTypes.has(this.activeType);
    }

    async renderAddProducts() {
        if (!this.addProductContainer) return;

        let list = this.addProductContainer.querySelector('.compare-modal__add-product--list');

        if (!list) {
            list = document.createElement('div');
            list.className = 'compare-modal__add-product--list';
            this.addProductContainer.appendChild(list);
        }

        const listId = this.addProductsId = (this.addProductsId || 0) + 1;
        const activeType = this.activeType;

        // Products without a type ("Other") can't be listed by type
        if (!activeType) {
            list.replaceChildren();
            this.setHasProductsToAdd(false);
            return;
        }

        const query = (this.addProductSearch?.value || '').trim().toLowerCase();
        const products = await this.fetchProductsByType(activeType, query ? 250 : 10);

        // The selection, search or products changed while this one was fetching
        if (listId !== this.addProductsId) return;

        const addedHandles = new Set(this.getProducts().map(({ handle }) => handle));

        const items = products
            .filter(product => this.getProductImage(product) && !addedHandles.has(product.handle))
            .filter(product => !query || product.title.toLowerCase().includes(query))
            .map(product => this.createAddProductItem(product));

        if (query) {
            // No matches only means nothing fits the search, so keep the panel open with a message
            if (!items.length) {
                const message = document.createElement('p');
                message.className = 'compare-modal__add-product--empty';
                message.textContent = 'No products match your search.';
                items.push(message);
            }

            list.replaceChildren(...items);
            return;
        }

        list.replaceChildren(...items);
        this.setHasProductsToAdd(items.length > 0);
    }

    setHasProductsToAdd(hasProducts) {
        this.hasProductsToAdd = hasProducts;

        // Nothing left to add from this collection, e.g. its last product was just added or
        // the selected type's collection has none, so close the panel instead of showing it empty.
        // Not focusing "Add products", as it's hidden too
        if (!hasProducts && this.isAddProductOpen()) {
            this.setAddProductVisible(false, { focus: false });
            return;
        }

        if (this.moreProductsButton && !this.isAddProductOpen()) {
            this.moreProductsButton.hidden = !hasProducts;
        }
    }
}

// Products viewed on this device, newest first, shown under the comparison on the comparison page
class RecentlyViewed {
    constructor() {
        this.storageKey = 'recently_viewed_handles';
        this.maxStored = 10;
        this.maxShown = 4;
        // Re-rendered as products are added to and removed from the comparison, so keep the cards
        this.cards = new Map();
    }

    getHandles() {
        try {
            const handles = JSON.parse(localStorage.getItem(this.storageKey));

            return Array.isArray(handles) ? handles.filter(handle => typeof handle === 'string') : [];
        } catch (error) {
            return [];
        }
    }

    // Product URLs can also be under a collection, e.g. /collections/carpets/products/{handle}
    recordProductPage() {
        const match = window.location.pathname.match(/\/products\/([^/]+)/);

        if (!match) return;

        const handle = decodeURIComponent(match[1]);
        const handles = [handle, ...this.getHandles().filter(stored => stored !== handle)].slice(0, this.maxStored);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(handles));
        } catch (error) {
            console.warn('Unable to save recently viewed products', error);
        }
    }

    fetchCard(handle) {
        if (!this.cards.has(handle)) this.cards.set(handle, this.requestCard(handle));

        return this.cards.get(handle);
    }

    // templates/product.card.liquid: the product's collection grid card
    async requestCard(handle) {
        const root = window.Shopify?.routes?.root || '/';

        try {
            const response = await fetch(`${root}products/${handle}?view=card`);

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            return (await response.text()).trim();
        } catch (error) {
            console.warn(`Unable to load recently viewed product ${handle}`, error);
            return '';
        }
    }

    // excludeHandles are the products being compared, which are already on the page.
    // onCompare is called with a card's compare button when it's clicked
    async render(container, excludeHandles = [], onCompare = null) {
        const grid = container.querySelector('.product-grid');

        if (!grid) return;

        const renderId = this.renderId = (this.renderId || 0) + 1;
        const handles = this.getHandles().filter(handle => !excludeHandles.includes(handle));

        // Fetches them all, as the card is empty for products the grid hides, e.g. samples
        const cards = (await Promise.all(handles.map(handle => this.fetchCard(handle))))
            .filter(Boolean)
            .slice(0, this.maxShown);

        // A newer render started while this one was fetching
        if (renderId !== this.renderId) return;

        grid.innerHTML = cards.join('');
        container.hidden = !grid.children.length;

        if (onCompare) {
            grid.querySelectorAll('.compare-button').forEach(button => {
                button.addEventListener('click', event => {
                    event.preventDefault();
                    onCompare(button);
                });
            });
        }
    }
}

const recentlyViewed = new RecentlyViewed();
recentlyViewed.recordProductPage();

const compare = new Compare();
compare.showCompareHint();
let comparisonPage = null;

const comparisonPageApp = document.getElementById('comparison-page-app');

if (comparisonPageApp) {
    const nav = document.createElement('nav');
    nav.className = 'comparison-page__nav';

    const gridsContainer = document.createElement('div');
    gridsContainer.className = 'comparison-page__grids';

    comparisonPageApp.append(nav, gridsContainer);

    const isSharedLink = new URLSearchParams(window.location.search).has('compare');

    // Shared links don't include the type, so look it up from each product before showing the tables.
    // Products that can't be loaded are left out. Without a shared link, show what's been added on this device
    const loadProducts = isSharedLink
        ? Promise.all(Compare.getUrlProducts().map(async entry => {
            const product = await compare.fetchProduct(entry.handle);

            return product ? { type: product.type || '', ...entry } : null;
        })).then(products => products.filter(Boolean))
        : Promise.resolve(compare.getStoredProducts());

    const recentContainer = document.querySelector('.comparison-page__recent');

    // A recently viewed product's compare button adds it to the comparison on the page
    const addRecentProduct = button => {
        const { handle, type } = button.dataset;

        Compare.trackFirstClick(button, 'recently_viewed');
        comparisonPage.addProduct(handle, type, null, 'recently_viewed');
    };

    // Recently viewed leaves out the products being compared, so it changes with them
    const renderRecentlyViewed = () => {
        if (!recentContainer) return;

        const comparedHandles = comparisonPage.getProducts().map(({ handle }) => handle);
        recentlyViewed.render(recentContainer, comparedHandles, addRecentProduct);
    };

    loadProducts.then(products => {
        comparisonPage = new Compare({
            nav,
            gridsContainer,
            products,
            emptyMessage: 'No products added',
            onChange: renderRecentlyViewed,
        });

        Compare.track('compare_page_view', {
            shared_link: isSharedLink,
            compare_count: products.length,
        });

        renderRecentlyViewed();
    });
}

class CompareShare {
    constructor(shareButton, popup, getProducts) {
        this.shareButton = shareButton;
        this.popup = popup;
        this.getProducts = getProducts;
        this.copyButton = popup.querySelector('[data-share="copy"]');
        this.copyLabel = this.copyButton?.querySelector('.comparison-share__label');
        this.message = 'Take a look at this product comparison';

        this.handleKeydown = this.handleKeydown.bind(this);

        shareButton.addEventListener('click', event => {
            event.preventDefault();
            this.open();
        });

        popup.querySelector('.comparison-share__close')?.addEventListener('click', this.close.bind(this));
        popup.querySelector('.comparison-share__background')?.addEventListener('click', this.close.bind(this));
        this.copyButton?.addEventListener('click', this.copyLink.bind(this));

        popup.querySelectorAll('a[data-share]').forEach(link => {
            link.addEventListener('click', () => this.trackShare(link.dataset.share));
        });
    }

    trackShare(method) {
        Compare.track('compare_share', { method, compare_count: this.getProducts().length });
    }

    // method is added as the UTM medium, so visits from shared links show in Google Analytics by how they were shared
    getShareUrl(method) {
        const root = window.Shopify?.routes?.root || '/';
        const url = new URL(`${root}pages/compare`, window.location.origin);
        const products = this.getProducts();
        const params = [];

        // Written out rather than with searchParams, which would encode the commas and colons and make the link harder to read.
        // Handles only contain lowercase letters, numbers and hyphens, so are safe as they are
        if (products.length) params.push(`compare=${Compare.toUrlParam(products)}`);
        params.push('utm_source=compare_share', `utm_medium=${method}`);

        return `${url}?${params.join('&')}`;
    }

    updateLinks() {
        // The products change as they're added and removed, so build the links on open.
        // The link goes on its own line, as these messages are plain text and can't link words
        const text = method => `${this.message}:\n${this.getShareUrl(method)}`;

        const links = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text('whatsapp'))}`,
            email: `mailto:?subject=${encodeURIComponent('Product comparison')}&body=${encodeURIComponent(text('email'))}`,
            sms: `sms:?&body=${encodeURIComponent(text('sms'))}`,
        };

        Object.entries(links).forEach(([type, href]) => {
            const link = this.popup.querySelector(`[data-share="${type}"]`);
            if (link) link.href = href;
        });
    }

    open() {
        this.updateLinks();
        this.popup.hidden = false;
        document.addEventListener('keydown', this.handleKeydown);
        this.popup.querySelector('.comparison-share__close')?.focus();
    }

    close() {
        this.popup.hidden = true;
        document.removeEventListener('keydown', this.handleKeydown);
        this.shareButton.focus();
    }

    handleKeydown(event) {
        if (event.key === 'Escape') this.close();
    }

    async copyLink() {
        if (!this.copyLabel) return;

        try {
            await navigator.clipboard.writeText(this.getShareUrl('copy'));
            this.copyLabel.textContent = 'Link copied';
            this.trackShare('copy');
        } catch (error) {
            this.copyLabel.textContent = 'Unable to copy';
        }

        clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => {
            this.copyLabel.textContent = 'Copy link';
        }, 2000);
    }
}

const comparisonShareButton = document.querySelector('.comparison-page__share');
const comparisonSharePopup = document.querySelector('.comparison-share');

if (comparisonShareButton && comparisonSharePopup) {
    new CompareShare(
        comparisonShareButton,
        comparisonSharePopup,
        () => (comparisonPage || compare).getProducts()
    );
}
