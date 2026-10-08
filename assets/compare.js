class Compare {
    constructor(options = {}) {
        this.storageKey = 'compare_product_handles';
        this.maxProducts = 4;
        this.modalContainerClass = 'compare-modal-container';
        this.modalOpenClass = 'compare-modal-open';
        this.modalContainer = document.querySelector(`.${this.modalContainerClass}`);
        this.gridsContainer = options.gridsContainer || document.querySelector('.compare-modal__grids');
        this.nav = options.nav || document.querySelector('.compare-modal__nav');
        this.viewFullLink = options.products ? null : document.querySelector('.compare-modal__view-full');
        this.addProductContainer = options.products ? null : document.querySelector('.compare-modal__add-product');
        this.productsByType = new Map();
        this.labelColumnWidth = 200;
        this.productColumnWidth = 290;
        this.dismissedWarnings = new Set();
        // When set, these products are shown instead of the ones in local storage
        this.products = options.products || null;
        this.emptyMessage = options.emptyMessage || null;
        this.activeType = null;
        // Always shown in the nav, matching the types snippets/compare-button.liquid shows the button for
        this.productTypes = ['Carpets', 'LVT', 'Vinyl', 'Laminate', 'Artificial Grass'];
        this.specifications = ['Pile Height', 'Material', 'TOG Rating', 'Backing', 'Style'];
        this.specificationsLaminate = ['Pack Size (M²)', 'Planks Per Pack', 'Plank Size', 'Oak Layer', 'Finish', 'Style'];
        this.specificationsVinyl = ['Thickness', 'Wear Layer', 'Backing', 'Suitability', 'Style'];
        this.specificationsLVT = ['Thickness', 'Wear Layer', 'Pack Size (M²)', 'Planks Per Pack', 'Plank Size', 'Installation System', 'Style', 'Usage Class'];
        this.specificationsArtificialGrass = ['Pile Height', 'Material', 'Pile Weight', 'Total Weight', 'Style', 'Drainage Holes'];

        if (!this.products) this.bindModalEvents();

        this.renderNav();
        this.renderGrid();
    }

    bindModalEvents() {
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

        this.addProductClose = this.addProductContainer?.querySelector('.compare-modal__add-product--close');
        this.moreProductsButton = document.querySelector('.compare-modal__more-products');

        if (this.addProductClose) {
            this.addProductClose.addEventListener('click', () => this.setAddProductVisible(false));
        }

        if (this.moreProductsButton) {
            this.moreProductsButton.addEventListener('click', () => this.setAddProductVisible(true));
        }

        // Under 900px the add product panel is a popup, closed by default
        this.mobileQuery = window.matchMedia('(max-width: 899px)');

        if (this.addProductContainer) {
            const applyLayout = () => this.setAddProductVisible(!this.mobileQuery.matches, { focus: false, animate: false });

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

    clearProducts() {
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
        const label = count === 1 ? 'product' : 'products';

        countElement.textContent = `${count} ${label}`;
    }

    getProductTypes() {
        return [...new Set(this.getProducts().map(({ type = '' }) => type))];
    }

    getTypes() {
        // The fixed types first, then any others found in the stored products
        return [...new Set([...this.productTypes, ...this.getProductTypes()])];
    }

    renderNav() {
        const types = this.getTypes();

        // Default to the first type that has products, otherwise the first type
        if (!types.includes(this.activeType)) this.activeType = this.getProductTypes()[0] ?? types[0] ?? null;

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
            this.nav.hidden = !types.length;
        }

        this.updateViewFullLink();
        this.updateActiveType();
    }

    updateViewFullLink() {
        if (!this.viewFullLink) return;

        const url = new URL(this.viewFullLink.getAttribute('href'), window.location.origin);
        const products = this.getProducts();

        if (products.length) {
            url.searchParams.set('compare', JSON.stringify(products));
        } else {
            url.searchParams.delete('compare');
        }

        this.viewFullLink.href = url.pathname + url.search;
    }

    selectType(type) {
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
        const { handle, type } = button.dataset;

        this.addProduct(handle, type);
        this.openModal();
    }

    openModal() {
        if (!this.modalContainer) return;

        this.modalContainer.classList.add(this.modalOpenClass);
    }

    closeModal() {
        if (!this.modalContainer) return;

        this.modalContainer.classList.remove(this.modalOpenClass);
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

    static getUrlProducts() {
        const params = new URLSearchParams(window.location.search);

        return Compare.parseProducts(params.get('compare'));
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

    addProduct(handle, type) {
        const products = this.getStoredProducts();
        if (products.some(product => product.handle === handle)) return false;

        const sameTypeCount = products.filter(product => (product.type || '') === (type || '')).length;
        if (sameTypeCount >= this.maxProducts) {
            this.showLimitReached(type);
            return false;
        }

        products.push({ type, handle });

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(products));
        } catch (error) {
            console.warn('Unable to save compare products', error);
            return false;
        }

        this.activeType = type;
        // Scrolled into view once the grid has been rebuilt
        this.scrollToHandle = handle;

        this.updateUrl(products);
        this.renderNav();
        this.renderGrid();

        return true;
    }

    updateUrl(products) {
        const url = new URL(window.location.href);

        if (products.length) {
            url.searchParams.set('compare', JSON.stringify(products));
        } else {
            url.searchParams.delete('compare');
        }

        window.history.replaceState(window.history.state, '', url);
    }

    removeProduct(handle) {
        if (this.products) {
            this.products = this.products.filter(product => product.handle !== handle);

            this.updateUrl(this.products);
            this.renderNav();
            this.renderGrid();
            return;
        }

        const products = this.getStoredProducts().filter(product => product.handle !== handle);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(products));
        } catch (error) {
            console.warn('Unable to remove compare product', error);
            return;
        }

        this.renderNav();
        this.renderGrid();
    }

    async fetchProduct(handle) {
        const root = window.Shopify?.routes?.root || '/';

        try {
            const response = await fetch(`${root}products/${handle}.js`);

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            return await response.json();
        } catch (error) {
            console.warn(`Unable to load product ${handle}`, error);
            return null;
        }
    }

    createProductImage(product) {
        const root = window.Shopify?.routes?.root || '/';
        const productUrl = product.url || `${root}products/${product.handle}`;

        const image = document.createElement('img');

        image.src = product.featured_image;
        // The title link names the product, so the image doesn't need to
        image.alt = '';
        image.loading = 'lazy';

        // Duplicate of the title link, so keep it out of the tab order and screen readers
        const imageLink = document.createElement('a');
        imageLink.href = productUrl;
        imageLink.tabIndex = -1;
        imageLink.setAttribute('aria-hidden', 'true');
        imageLink.appendChild(image);

        const wrapper = document.createElement('div');
        wrapper.className = 'compare-product-image';
        wrapper.appendChild(imageLink);

        const titleLink = document.createElement('a');
        titleLink.href = productUrl;
        titleLink.textContent = product.title;

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
        removeButton.addEventListener('click', () => this.removeProduct(product.handle));

        const productCard = document.createElement('div');
        productCard.className = 'compare-product';
        productCard.dataset.handle = product.handle;
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

    createRow(labelText, products, getValue) {
        const fragment = document.createDocumentFragment();

        const label = document.createElement('div');
        label.className = 'specification';
        label.textContent = labelText;
        fragment.appendChild(label);

        products.forEach(product => {
            const value = document.createElement('div');
            value.className = 'specification-value';
            value.dataset.handle = product.handle;
            value.textContent = getValue(product);
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

        storedProducts.forEach(({ type = '', handle }) => {
            if (!groups.has(type)) groups.set(type, []);
            groups.get(type).push(handle);
        });

        return groups;
    }

    createGrid(type, columns) {
        const grid = document.createElement('div');
        grid.className = 'compare-modal__product-grid';
        grid.dataset.type = type;
        grid.dataset.columns = columns;
        grid.style.gridTemplateColumns = `${this.labelColumnWidth}px repeat(${columns}, ${this.productColumnWidth}px)`;

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

        const rowCount = this.getSpecifications(type).length + 1;

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

        grid.appendChild(
            this.createRow('Price', products, product => this.formatPrice(product.price))
        );

        this.getSpecifications(type).forEach(specification => {
            grid.appendChild(
                this.createRow(specification, products, product => this.getSpecificationValue(product, specification))
            );
        });

        return grid;
    }

    getCollectionId(collection_id) {
        switch (collection_id) {
            case 'laminate':
                return 'laminate-flooring';
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
            ...[...groups].map(([type, handles]) => this.createSkeletonGrid(type, handles.length)),
            ...this.createEmptyTypeGrids([...groups.keys()])
        );
        this.updateGridWidths();
        this.updateActiveType();

        const results = await Promise.all(storedProducts.map(({ handle }) => this.fetchProduct(handle)));
        const productsByHandle = new Map();

        results.forEach(product => {
            if (product && product.featured_image) productsByHandle.set(product.handle, product);
        });

        // A newer render started while this one was fetching
        if (renderId !== this.renderId) return;

        const grids = [];

        groups.forEach((handles, type) => {
            const products = handles
                .map(handle => productsByHandle.get(handle))
                .filter(Boolean);

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
        const handle = this.scrollToHandle;
        this.scrollToHandle = null;

        if (!handle) return;

        const card = [...this.gridsContainer.querySelectorAll('.compare-product')]
            .find(productCard => productCard.dataset.handle === handle);

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

    async fetchProductsByType(type) {
        if (this.productsByType.has(type)) return this.productsByType.get(type);

        const root = window.Shopify?.routes?.root || '/';
        // Collection handles are lowercase with hyphens, e.g. "Artificial Grass" -> "artificial-grass"
        const handle = type.trim().toLowerCase().replace(/\s+/g, '-');

        let collection_id = this.getCollectionId(handle);
        
        try {
            const response = await fetch(`${root}collections/${collection_id}/products.json?limit=10`);
            
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            
            const data = await response.text();
            const dataObj = JSON.parse(data);

            const products = (dataObj.products || []).filter(product => product.product_type.toLowerCase() === type.toLowerCase());
        
            this.productsByType.set(type, products);

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
    getRrpPrice(product, price) {
        const compareAtPrices = (product.variants || [])
            .map(variant => parseFloat(variant.compare_at_price))
            .filter(compareAt => !Number.isNaN(compareAt));

        const compareAt = compareAtPrices.length ? Math.min(...compareAtPrices) : 0;

        if (compareAt > price) return { label: 'was', amount: `${this.formatPrice(Math.round(compareAt * 100))}m²` };

        const tags = Array.isArray(product.tags) ? product.tags : String(product.tags || '').split(', ');
        const rrpTag = tags.find(tag => tag.startsWith('RRP_'));
        const rrp = rrpTag ? parseFloat(rrpTag.replace('RRP_', '')) : 0;

        if (rrp > price) return { label: 'RRP', amount: `${this.formatPrice(Math.round(rrp * 100))}m²` };

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
            price.textContent = `only ${this.formatPrice(Math.round(lowestPrice * 100))}m²`;
            details.appendChild(price);

            const rrpPrice = this.getRrpPrice(product, lowestPrice);

            if (rrpPrice) {
                const rrp = document.createElement('s');
                rrp.className = 'compare-add-product__rrp';
                rrp.textContent = `${rrpPrice.label} ${rrpPrice.amount}`;
                details.appendChild(rrp);
            }
        }

        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'compare-add-product';
        item.setAttribute('aria-label', `Add ${product.title} to comparison`);
        item.append(image, details);
        item.addEventListener('click', () => {
            const added = this.addProduct(product.handle, product.product_type);

            // Close the popup on smaller screens so the added product can be seen
            if (added && this.mobileQuery?.matches) this.setAddProductVisible(false);
        });

        return item;
    }

    showLimitReached(type) {
        // The modal slides in when opened from a compare button, so wait for it before shuddering
        const wasOpen = this.modalContainer?.classList.contains(this.modalOpenClass);

        // Show the warning even if it was dismissed, on the type that's full
        this.dismissedWarnings.delete(type || '');
        this.selectType(type || '');

        if (this.addProductContainer?.closest('.compare-modal')?.classList.contains('compare-modal--aside-closed')) {
            this.setAddProductVisible(true, { focus: false });
        }

        clearTimeout(this.shudderTimer);
        this.shudderTimer = setTimeout(() => this.shudderLimitWarning(), wasOpen ? 0 : 300);
    }

    shudderLimitWarning() {
        const warning = this.addProductContainer?.querySelector('.compare-modal__limit-warning');

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
            // "More products" is only needed while the panel is hidden
            this.moreProductsButton.hidden = isVisible;
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
        if (!this.addProductContainer) return;

        let warning = this.addProductContainer.querySelector('.compare-modal__limit-warning');

        if (!warning) {
            warning = document.createElement('div');
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
                this.dismissedWarnings.add(this.activeType);
                warning.hidden = true;
            });

            warning.append(message, closeButton);

            const header = this.addProductContainer.querySelector('.compare-modal__add-product--header');
            if (header) {
                header.after(warning);
            } else {
                this.addProductContainer.prepend(warning);
            }
        }

        const count = this.getProducts().filter(({ type = '' }) => type === this.activeType).length;
        const isFull = count >= this.maxProducts;

        // Show the message again the next time this type fills up
        if (!isFull) this.dismissedWarnings.delete(this.activeType);

        warning.hidden = !isFull || this.dismissedWarnings.has(this.activeType);
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

        // Products without a type ("Other") can't be searched by type
        if (!activeType) {
            list.replaceChildren();
            return;
        }

        const products = await this.fetchProductsByType(activeType);
        
        // The selection or products changed while this one was fetching
        if (listId !== this.addProductsId) return;

        const addedHandles = new Set(this.getProducts().map(({ handle }) => handle));

        const items = products
            .filter(product => this.getProductImage(product) && !addedHandles.has(product.handle))
            .map(product => this.createAddProductItem(product));

        list.replaceChildren(...items);
    }
}

const compare = new Compare();
let comparisonPage = null;

const comparisonPageApp = document.getElementById('comparison-page-app');

if (comparisonPageApp) {
    const nav = document.createElement('nav');
    nav.className = 'comparison-page__nav';

    const gridsContainer = document.createElement('div');
    gridsContainer.className = 'comparison-page__grids';

    comparisonPageApp.append(nav, gridsContainer);

    comparisonPage = new Compare({
        nav,
        gridsContainer,
        products: Compare.getUrlProducts(),
        emptyMessage: 'No products added',
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
    }

    getShareUrl() {
        const root = window.Shopify?.routes?.root || '/';
        const url = new URL(`${root}pages/compare`, window.location.origin);
        const products = this.getProducts();

        if (products.length) url.searchParams.set('compare', JSON.stringify(products));

        return url.toString();
    }

    updateLinks() {
        // The products change as they're added and removed, so build the links on open
        const url = this.getShareUrl();
        const text = `${this.message}: ${url}`;

        const links = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
            email: `mailto:?subject=${encodeURIComponent('Product comparison')}&body=${encodeURIComponent(text)}`,
            sms: `sms:?&body=${encodeURIComponent(text)}`,
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
            await navigator.clipboard.writeText(this.getShareUrl());
            this.copyLabel.textContent = 'Link copied';
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
