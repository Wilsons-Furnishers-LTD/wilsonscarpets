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
        // When set, these products are shown instead of the ones in local storage
        this.products = options.products || null;
        this.emptyMessage = options.emptyMessage || null;
        this.activeType = null;
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

    getTypes() {
        return [...new Set(this.getProducts().map(({ type = '' }) => type))];
    }

    renderNav() {
        const types = this.getTypes();

        // Fall back to the first type when the selected one has no products left
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
    }

    updateActiveType() {
        this.updateCount();

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
        if (products.some(product => product.handle === handle)) return;

        const sameTypeCount = products.filter(product => (product.type || '') === (type || '')).length;
        if (sameTypeCount >= this.maxProducts) return;

        products.push({ type, handle });

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(products));
        } catch (error) {
            console.warn('Unable to save compare products', error);
            return;
        }

        this.activeType = type;

        this.updateUrl(products);
        this.renderNav();
        this.renderGrid();
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
        const image = document.createElement('img');

        image.src = product.featured_image;
        image.alt = product.title;
        image.loading = 'lazy';

        const wrapper = document.createElement('div');
        wrapper.className = 'compare-product-image';
        wrapper.appendChild(image);

        const title = document.createElement('div');
        title.className = 'compare-product-title';
        title.textContent = product.title;

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
        grid.style.gridTemplateColumns = `200px repeat(${columns}, 290px)`;

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
            ...[...groups].map(([type, handles]) => this.createSkeletonGrid(type, handles.length))
        );
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

        this.gridsContainer.replaceChildren(...grids);
        this.updateActiveType();
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
