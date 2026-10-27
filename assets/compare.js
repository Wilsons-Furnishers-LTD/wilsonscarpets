(function () {
    'use strict';

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
            // The label column is narrower below 769px, see the labelColumnWidth getter
            this.smallScreenQuery = window.matchMedia('(max-width: 768px)');
            // The product columns are narrower below 500px, see the productColumnWidth getter
            this.extraSmallScreenQuery = window.matchMedia('(max-width: 499px)');
            // Types where someone tried to add a product past the limit, which shows the limit warning
            this.limitReachedTypes = new Set();
            // When set, these products are shown instead of the ones in local storage
            this.products = options.products || null;
            this.emptyMessage = options.emptyMessage || null;
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
            this.openButton?.addEventListener('click', () => this.openModal());

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
            if (!this.openButton) return;

            const count = this.getProducts().length;

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
                url.searchParams.set('compare', JSON.stringify(products));
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

        // Identifies an entry, so different variants of the same product can be compared
        static getEntryKey({ handle, variant = null }) {
            return variant ? `${handle}:${variant}` : handle;
        }

        addProduct(handle, type, variantId = null) {
            const products = this.getStoredProducts();
            const key = Compare.getEntryKey({ handle, variant: variantId });

            if (products.some(product => Compare.getEntryKey(product) === key)) return false;

            const sameTypeCount = products.filter(product => (product.type || '') === (type || '')).length;
            if (sameTypeCount >= this.maxProducts) {
                this.showLimitReached(type);
                return false;
            }

            // Buttons on the product page are per colour, so save which variant was picked
            products.push(variantId ? { type, handle, variant: variantId } : { type, handle });

            try {
                localStorage.setItem(this.storageKey, JSON.stringify(products));
            } catch (error) {
                console.warn('Unable to save compare products', error);
                return false;
            }

            this.activeType = type;
            // Scrolled into view once the grid has been rebuilt
            this.scrollToKey = key;

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

        removeProduct(key) {
            if (this.products) {
                this.products = this.products.filter(product => Compare.getEntryKey(product) !== key);

                this.updateUrl(this.products);
                this.renderNav();
                this.renderGrid();
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

        async fetchProduct(handle) {
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
                this.addProduct(product.handle, product.product_type);

                // Close the popup on smaller screens so the added product, or the limit warning, can be seen
                if (this.mobileQuery?.matches) this.setAddProductVisible(false);
            });

            return item;
        }

        showLimitReached(type) {
            // The modal slides in when opened from a compare button, so wait for it before shuddering
            const wasOpen = this.modalContainer?.classList.contains(this.modalOpenClass);

            // Show the warning on the type that's full, even if it was dismissed before
            this.limitReachedTypes.add(type || '');
            this.selectType(type || '');

            // The warning sits on the modal, so it shows whether or not the add product panel is open
            clearTimeout(this.shudderTimer);
            this.shudderTimer = setTimeout(() => this.shudderLimitWarning(), wasOpen ? 0 : 300);
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
            if (!this.addProductContainer) return;

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
            // Without a shared link, show what's been added to the compare table on this device
            products: new URLSearchParams(window.location.search).has('compare')
                ? Compare.getUrlProducts()
                : compare.getStoredProducts(),
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

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NjcmlwdHMvY29tcGFyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb21wYXJlIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlS2V5ID0gJ2NvbXBhcmVfcHJvZHVjdF9oYW5kbGVzJztcbiAgICAgICAgdGhpcy5tYXhQcm9kdWN0cyA9IDQ7XG4gICAgICAgIHRoaXMubW9kYWxDb250YWluZXJDbGFzcyA9ICdjb21wYXJlLW1vZGFsLWNvbnRhaW5lcic7XG4gICAgICAgIHRoaXMubW9kYWxPcGVuQ2xhc3MgPSAnY29tcGFyZS1tb2RhbC1vcGVuJztcbiAgICAgICAgdGhpcy5tb2RhbENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMubW9kYWxDb250YWluZXJDbGFzc31gKTtcbiAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lciA9IG9wdGlvbnMuZ3JpZHNDb250YWluZXIgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2dyaWRzJyk7XG4gICAgICAgIHRoaXMubmF2ID0gb3B0aW9ucy5uYXYgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX25hdicpO1xuICAgICAgICB0aGlzLnZpZXdGdWxsTGluayA9IG9wdGlvbnMucHJvZHVjdHMgPyBudWxsIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX3ZpZXctZnVsbCcpO1xuICAgICAgICB0aGlzLmFkZFByb2R1Y3RDb250YWluZXIgPSBvcHRpb25zLnByb2R1Y3RzID8gbnVsbCA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJlLW1vZGFsX19hZGQtcHJvZHVjdCcpO1xuICAgICAgICB0aGlzLnByb2R1Y3RzQnlUeXBlID0gbmV3IE1hcCgpO1xuICAgICAgICAvLyBUaGUgbGFiZWwgY29sdW1uIGlzIG5hcnJvd2VyIGJlbG93IDc2OXB4LCBzZWUgdGhlIGxhYmVsQ29sdW1uV2lkdGggZ2V0dGVyXG4gICAgICAgIHRoaXMuc21hbGxTY3JlZW5RdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA3NjhweCknKTtcbiAgICAgICAgLy8gVGhlIHByb2R1Y3QgY29sdW1ucyBhcmUgbmFycm93ZXIgYmVsb3cgNTAwcHgsIHNlZSB0aGUgcHJvZHVjdENvbHVtbldpZHRoIGdldHRlclxuICAgICAgICB0aGlzLmV4dHJhU21hbGxTY3JlZW5RdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA0OTlweCknKTtcbiAgICAgICAgLy8gVHlwZXMgd2hlcmUgc29tZW9uZSB0cmllZCB0byBhZGQgYSBwcm9kdWN0IHBhc3QgdGhlIGxpbWl0LCB3aGljaCBzaG93cyB0aGUgbGltaXQgd2FybmluZ1xuICAgICAgICB0aGlzLmxpbWl0UmVhY2hlZFR5cGVzID0gbmV3IFNldCgpO1xuICAgICAgICAvLyBXaGVuIHNldCwgdGhlc2UgcHJvZHVjdHMgYXJlIHNob3duIGluc3RlYWQgb2YgdGhlIG9uZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICB0aGlzLnByb2R1Y3RzID0gb3B0aW9ucy5wcm9kdWN0cyB8fCBudWxsO1xuICAgICAgICB0aGlzLmVtcHR5TWVzc2FnZSA9IG9wdGlvbnMuZW1wdHlNZXNzYWdlIHx8IG51bGw7XG4gICAgICAgIHRoaXMuYWN0aXZlVHlwZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3BlY2lmaWNhdGlvbnMgPSBbJ1BpbGUgSGVpZ2h0JywgJ01hdGVyaWFsJywgJ1RPRyBSYXRpbmcnLCAnQmFja2luZycsICdTdHlsZSddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zTGFtaW5hdGUgPSBbJ1BhY2sgU2l6ZSAoTcKyKScsICdQbGFua3MgUGVyIFBhY2snLCAnUGxhbmsgU2l6ZScsICdPYWsgTGF5ZXInLCAnRmluaXNoJywgJ1N0eWxlJ107XG4gICAgICAgIHRoaXMuc3BlY2lmaWNhdGlvbnNWaW55bCA9IFsnVGhpY2tuZXNzJywgJ1dlYXIgTGF5ZXInLCAnQmFja2luZycsICdTdWl0YWJpbGl0eScsICdTdHlsZSddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zTFZUID0gWydUaGlja25lc3MnLCAnV2VhciBMYXllcicsICdQYWNrIFNpemUgKE3CsiknLCAnUGxhbmtzIFBlciBQYWNrJywgJ1BsYW5rIFNpemUnLCAnSW5zdGFsbGF0aW9uIFN5c3RlbScsICdTdHlsZScsICdVc2FnZSBDbGFzcyddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zUmVhbFdvb2QgPSBbJ1RoaWNrbmVzcycsICdQYWNrIFNpemUgKE3CsiknLCAnUGxhbmtzIFBlciBQYWNrJywgJ1BsYW5rIFNpemUnLCAnT2FrIExheWVyJywgJ0ZpbmlzaCcsICdTdHlsZSddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zQWNjZXNzb3JpZXMgPSBbJ1RPRyBSYXRpbmcnLCAnUGFjayBTaXplIChNwrIpJywgJ0RlbnNpdHknLCAnSW1wYWN0IHNvdW5kIHJlZHVjdGlvbicsICdNYXRlcmlhbCcsICdTdHlsZScsICdEb29yIEJhciBMZW5ndGgnXTtcbiAgICAgICAgdGhpcy5zcGVjaWZpY2F0aW9uc1J1Z3MgPSBbJ01hdGVyaWFsJywgJ1BpbGUgSGVpZ2h0JywgJ1N0eWxlJywgJ0Rvb3IgQmFyIExlbmd0aCddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zQXJ0aWZpY2lhbEdyYXNzID0gWydQaWxlIEhlaWdodCcsICdNYXRlcmlhbCcsICdQaWxlIFdlaWdodCcsICdUb3RhbCBXZWlnaHQnLCAnU3R5bGUnLCAnRHJhaW5hZ2UgSG9sZXMnXTtcblxuICAgICAgICBpZiAoIXRoaXMucHJvZHVjdHMpIHRoaXMuYmluZE1vZGFsRXZlbnRzKCk7XG5cbiAgICAgICAgLy8gUmVzaXplIHRoZSBjb2x1bW5zIG9mIHRoZSB0YWJsZXMgYWxyZWFkeSBzaG93biB3aGVuIGNyb3NzaW5nIDc2OXB4IG9yIDUwMHB4XG4gICAgICAgIGNvbnN0IHJlc2l6ZUNvbHVtbnMgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JpZHNDb250YWluZXIpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkOm5vdCguY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkLS1lbXB0eSknKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGdyaWQgPT4gdGhpcy5zZXRHcmlkQ29sdW1ucyhncmlkKSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUdyaWRXaWR0aHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNtYWxsU2NyZWVuUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgcmVzaXplQ29sdW1ucyk7XG4gICAgICAgIHRoaXMuZXh0cmFTbWFsbFNjcmVlblF1ZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHJlc2l6ZUNvbHVtbnMpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyTmF2KCk7XG4gICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgIH1cblxuICAgIGJpbmRNb2RhbEV2ZW50cygpIHtcbiAgICAgICAgLy8gRml4ZWQgYnV0dG9uIHRvIHJlb3BlbiB0aGUgbW9kYWwsIHNob3duIG9uY2UgYSBwcm9kdWN0IGhhcyBiZWVuIGFkZGVkXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJlLW9wZW4tYnV0dG9uJyk7XG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wZW5Nb2RhbCgpKTtcblxuICAgICAgICBsZXQgY29tcGFyZUJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29tcGFyZS1idXR0b24nKVxuICAgICAgICBsZXQgdGhhdCA9IHRoaXNcbiAgICAgICAgY29tcGFyZUJ1dHRvbnMuZm9yRWFjaChjb21wYXJlQnV0dG9uID0+IHtcbiAgICAgICAgICAgIGNvbXBhcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoYXQuaGFuZGxlQ29tcGFyZUNsaWNrKGNvbXBhcmVCdXR0b24pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXItcHJvZHVjdC1pZHMnKTtcbiAgICAgICAgaWYgKGNsZWFyQnV0dG9uKSB7XG4gICAgICAgICAgICBjbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xlYXJQcm9kdWN0cy5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3NlLWNvbXBhcmUtbW9kYWwnKTtcbiAgICAgICAgaWYgKGNsb3NlQnV0dG9uKSB7XG4gICAgICAgICAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xvc2VNb2RhbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1vZGFsQmFja2dyb3VuZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJlLW1vZGFsLWJhY2tncm91bmQnKTtcbiAgICAgICAgaWYgKG1vZGFsQmFja2dyb3VuZCkge1xuICAgICAgICAgICAgbW9kYWxCYWNrZ3JvdW5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbG9zZU1vZGFsLmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iaW5kSGVhZGVyQWN0aW9ucygpO1xuXG4gICAgICAgIHRoaXMuYWRkUHJvZHVjdENsb3NlID0gdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyPy5xdWVyeVNlbGVjdG9yKCcuY29tcGFyZS1tb2RhbF9fYWRkLXByb2R1Y3QtLWNsb3NlJyk7XG4gICAgICAgIHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX21vcmUtcHJvZHVjdHMnKTtcblxuICAgICAgICBpZiAodGhpcy5hZGRQcm9kdWN0Q2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUHJvZHVjdENsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2V0QWRkUHJvZHVjdFZpc2libGUodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVycyB0aGUgYWRkIHByb2R1Y3QgbGlzdCBieSB0aXRsZSwgd2FpdGluZyBmb3IgYSBwYXVzZSBpbiB0eXBpbmdcbiAgICAgICAgdGhpcy5hZGRQcm9kdWN0U2VhcmNoID0gdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyPy5xdWVyeVNlbGVjdG9yKCcjY29tcGFyZS1hZGQtcHJvZHVjdC1zZWFyY2gnKTtcbiAgICAgICAgdGhpcy5hZGRQcm9kdWN0U2VhcmNoPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmFkZFByb2R1Y3RTZWFyY2hUaW1lcik7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3RTZWFyY2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZW5kZXJBZGRQcm9kdWN0cygpLCAyNTApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBVbmRlciA5MDBweCB0aGUgYWRkIHByb2R1Y3QgcGFuZWwgaXMgYSBwb3B1cC4gQ2xvc2VkIGJ5IGRlZmF1bHQgYXQgYWxsIHNpemVzLCBvcGVuZWQgd2l0aCBcIkFkZCBwcm9kdWN0c1wiXG4gICAgICAgIHRoaXMubW9iaWxlUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1heC13aWR0aDogODk5cHgpJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRkUHJvZHVjdENvbnRhaW5lcikge1xuICAgICAgICAgICAgY29uc3QgYXBwbHlMYXlvdXQgPSAoKSA9PiB0aGlzLnNldEFkZFByb2R1Y3RWaXNpYmxlKGZhbHNlLCB7IGZvY3VzOiBmYWxzZSwgYW5pbWF0ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgICAgIC8vIFJ1bnMgb24gbG9hZCBhbmQgd2hlbmV2ZXIgdGhlIHZpZXdwb3J0IGNyb3NzZXMgOTAwcHhcbiAgICAgICAgICAgIGFwcGx5TGF5b3V0KCk7XG4gICAgICAgICAgICB0aGlzLm1vYmlsZVF1ZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFwcGx5TGF5b3V0KTtcblxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2FkZC1wcm9kdWN0LWJhY2tkcm9wJylcbiAgICAgICAgICAgICAgICA/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSkpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnICYmIHRoaXMubW9iaWxlUXVlcnkubWF0Y2hlcyAmJiB0aGlzLmlzQWRkUHJvZHVjdE9wZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFkZFByb2R1Y3RWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJlbG93IDc2OXB4IFwiQWRkIHByb2R1Y3RzXCIgYW5kIFwiU2hhcmVcIiBtb3ZlIG91dCBvZiB0aGUgaGVhZGVyIGludG8gdGhlaXIgb3duIHJvdy5cbiAgICAvLyBNb3ZpbmcgdGhlIGVsZW1lbnRzIGtlZXBzIHRoZWlyIGV2ZW50IGxpc3RlbmVyc1xuICAgIGJpbmRIZWFkZXJBY3Rpb25zKCkge1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2FjdGlvbnMnKTtcbiAgICAgICAgY29uc3QgaGVhZGVyQ29sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2hlYWRlci0tY29sJyk7XG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyZS1tb2RhbF9fbW9yZS1wcm9kdWN0cy13cmFwcGVyJyksXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyZS1tb2RhbF9faGVhZGVyIC5jb21wYXJpc29uLXBhZ2VfX3NoYXJlJyksXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIGlmICghYWN0aW9ucyB8fCAhaGVhZGVyQ29sIHx8ICFidXR0b25zLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNtYWxsUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1heC13aWR0aDogNzY4cHgpJyk7XG4gICAgICAgIGNvbnN0IHBsYWNlQnV0dG9ucyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChzbWFsbFF1ZXJ5Lm1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLmFwcGVuZCguLi5idXR0b25zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyQ29sLmJlZm9yZSguLi5idXR0b25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBwbGFjZUJ1dHRvbnMoKTtcbiAgICAgICAgc21hbGxRdWVyeS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBwbGFjZUJ1dHRvbnMpO1xuICAgIH1cblxuICAgIGNsZWFyUHJvZHVjdHMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnN0b3JhZ2VLZXkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gY2xlYXIgY29tcGFyZSBwcm9kdWN0cycsIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyTmF2KCk7XG4gICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgICAgICB0aGlzLmNsb3NlTW9kYWwoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3VudCgpIHtcbiAgICAgICAgY29uc3QgY291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbXBhcmUtY291bnQnKTtcblxuICAgICAgICBpZiAoIWNvdW50RWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRQcm9kdWN0cygpXG4gICAgICAgICAgICAuZmlsdGVyKCh7IHR5cGUgPSAnJyB9KSA9PiB0eXBlID09PSB0aGlzLmFjdGl2ZVR5cGUpXG4gICAgICAgICAgICAubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBpbm5lci5jbGFzc05hbWUgPSAnY29tcGFyZS1jb3VudF9faW5uZXInO1xuICAgICAgICBpbm5lci50ZXh0Q29udGVudCA9IGAke2NvdW50fS8ke3RoaXMubWF4UHJvZHVjdHN9YDtcbiAgICAgICAgY291bnRFbGVtZW50LnJlcGxhY2VDaGlsZHJlbihpbm5lcik7XG4gICAgfVxuXG4gICAgZ2V0UHJvZHVjdFR5cGVzKCkge1xuICAgICAgICByZXR1cm4gWy4uLm5ldyBTZXQodGhpcy5nZXRQcm9kdWN0cygpLm1hcCgoeyB0eXBlID0gJycgfSkgPT4gdHlwZSkpXTtcbiAgICB9XG5cbiAgICBnZXRUeXBlcygpIHtcbiAgICAgICAgLy8gT25seSB0eXBlcyB0aGF0IGhhdmUgcHJvZHVjdHMgYXJlIHNob3duIGluIHRoZSBuYXZcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvZHVjdFR5cGVzKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyTmF2KCkge1xuICAgICAgICBjb25zdCB0eXBlcyA9IHRoaXMuZ2V0VHlwZXMoKTtcblxuICAgICAgICBpZiAoIXR5cGVzLmluY2x1ZGVzKHRoaXMuYWN0aXZlVHlwZSkpIHRoaXMuYWN0aXZlVHlwZSA9IHR5cGVzWzBdID8/IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMubmF2KSB7XG4gICAgICAgICAgICBjb25zdCBsaW5rcyA9IHR5cGVzLm1hcCh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgICAgICAgICAgICBsaW5rLmRhdGFzZXQudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICAgICAgbGluay50ZXh0Q29udGVudCA9IHR5cGUgfHwgJ090aGVyJztcbiAgICAgICAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFR5cGUodHlwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbGluaztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm5hdi5yZXBsYWNlQ2hpbGRyZW4oLi4ubGlua3MpO1xuICAgICAgICAgICAgLy8gTm90aGluZyB0byBzd2l0Y2ggYmV0d2VlbiB3aXRoIGEgc2luZ2xlIHR5cGVcbiAgICAgICAgICAgIHRoaXMubmF2LmhpZGRlbiA9IHR5cGVzLmxlbmd0aCA8IDI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXdGdWxsTGluaygpO1xuICAgICAgICB0aGlzLnVwZGF0ZU9wZW5CdXR0b24oKTtcbiAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVUeXBlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlT3BlbkJ1dHRvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wZW5CdXR0b24pIHJldHVybjtcblxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0UHJvZHVjdHMoKS5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmhpZGRlbiA9ICFjb3VudDtcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBDb21wYXJlIHByb2R1Y3RzICgke2NvdW50fSlgKTtcblxuICAgICAgICBjb25zdCBjb3VudEVsZW1lbnQgPSB0aGlzLm9wZW5CdXR0b24ucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtb3Blbi1idXR0b25fX2NvdW50Jyk7XG4gICAgICAgIGlmIChjb3VudEVsZW1lbnQpIGNvdW50RWxlbWVudC50ZXh0Q29udGVudCA9IGNvdW50O1xuXG4gICAgfVxuXG4gICAgdXBkYXRlVmlld0Z1bGxMaW5rKCkge1xuICAgICAgICBpZiAoIXRoaXMudmlld0Z1bGxMaW5rKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLnZpZXdGdWxsTGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gdGhpcy5nZXRQcm9kdWN0cygpO1xuXG4gICAgICAgIGlmIChwcm9kdWN0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdjb21wYXJlJywgSlNPTi5zdHJpbmdpZnkocHJvZHVjdHMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKCdjb21wYXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZXdGdWxsTGluay5ocmVmID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgICB9XG5cbiAgICBzZWxlY3RUeXBlKHR5cGUpIHtcbiAgICAgICAgLy8gQSBzZWFyY2ggaXMgZm9yIG9uZSBjb2xsZWN0aW9uLCBzbyBzdGFydCB0aGUgbmV4dCB0eXBlIHdpdGggaXRzIGZ1bGwgbGlzdFxuICAgICAgICBpZiAodGhpcy5hZGRQcm9kdWN0U2VhcmNoICYmIHR5cGUgIT09IHRoaXMuYWN0aXZlVHlwZSkgdGhpcy5hZGRQcm9kdWN0U2VhcmNoLnZhbHVlID0gJyc7XG5cbiAgICAgICAgdGhpcy5hY3RpdmVUeXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVUeXBlKCk7XG4gICAgICAgIHRoaXMucmVuZGVyQWRkUHJvZHVjdHMoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVBY3RpdmVUeXBlKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgICAgIHRoaXMudXBkYXRlTGltaXRXYXJuaW5nKCk7XG5cbiAgICAgICAgaWYgKHRoaXMubmF2KSB7XG4gICAgICAgICAgICB0aGlzLm5hdi5xdWVyeVNlbGVjdG9yQWxsKCdhJykuZm9yRWFjaChsaW5rID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0FjdGl2ZSA9IGxpbmsuZGF0YXNldC50eXBlID09PSB0aGlzLmFjdGl2ZVR5cGU7XG5cbiAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGlzQWN0aXZlKTtcblxuICAgICAgICAgICAgICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50JywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsaW5rLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkc0NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkJykuZm9yRWFjaChncmlkID0+IHtcbiAgICAgICAgICAgICAgICBncmlkLmhpZGRlbiA9IGdyaWQuZGF0YXNldC50eXBlICE9PSB0aGlzLmFjdGl2ZVR5cGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNvbXBhcmVDbGljayhidXR0b24pIHtcbiAgICAgICAgY29uc3QgeyBoYW5kbGUsIHR5cGUsIHZhcmlhbnRJZCB9ID0gYnV0dG9uLmRhdGFzZXQ7XG5cbiAgICAgICAgdGhpcy5hZGRQcm9kdWN0KGhhbmRsZSwgdHlwZSwgdmFyaWFudElkID8gTnVtYmVyKHZhcmlhbnRJZCkgOiBudWxsKTtcbiAgICAgICAgdGhpcy5vcGVuTW9kYWwoKTtcbiAgICB9XG5cbiAgICBvcGVuTW9kYWwoKSB7XG4gICAgICAgIGlmICghdGhpcy5tb2RhbENvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubW9kYWxDb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLm1vZGFsT3BlbkNsYXNzKTtcbiAgICAgICAgLy8gU3RvcHMgdGhlIHBhZ2UgYmVoaW5kIHRoZSBtb2RhbCBmcm9tIHNjcm9sbGluZy4gU2V0IG9uIDxodG1sPiwgYXMgdGhhdCdzIHdoYXQgc2Nyb2xscyB0aGUgcGFnZVxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29tcGFyZS1tb2RhbC1pcy1vcGVuJyk7XG4gICAgfVxuXG4gICAgY2xvc2VNb2RhbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vZGFsQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5tb2RhbENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMubW9kYWxPcGVuQ2xhc3MpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29tcGFyZS1tb2RhbC1pcy1vcGVuJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlUHJvZHVjdHMoanNvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2R1Y3RzKSkgcmV0dXJuIFtdO1xuXG4gICAgICAgICAgICAvLyBTa2lwIGVudHJpZXMgc2F2ZWQgaW4gdGhlIG9sZCBwbGFpbi1oYW5kbGUgZm9ybWF0XG4gICAgICAgICAgICByZXR1cm4gcHJvZHVjdHMuZmlsdGVyKHByb2R1Y3QgPT4gcHJvZHVjdCAmJiB0eXBlb2YgcHJvZHVjdC5oYW5kbGUgPT09ICdzdHJpbmcnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRVcmxQcm9kdWN0cygpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgICAgICByZXR1cm4gQ29tcGFyZS5wYXJzZVByb2R1Y3RzKHBhcmFtcy5nZXQoJ2NvbXBhcmUnKSk7XG4gICAgfVxuXG4gICAgZ2V0U3RvcmVkUHJvZHVjdHMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gQ29tcGFyZS5wYXJzZVByb2R1Y3RzKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuc3RvcmFnZUtleSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UHJvZHVjdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3RzIHx8IHRoaXMuZ2V0U3RvcmVkUHJvZHVjdHMoKTtcbiAgICB9XG5cbiAgICAvLyBJZGVudGlmaWVzIGFuIGVudHJ5LCBzbyBkaWZmZXJlbnQgdmFyaWFudHMgb2YgdGhlIHNhbWUgcHJvZHVjdCBjYW4gYmUgY29tcGFyZWRcbiAgICBzdGF0aWMgZ2V0RW50cnlLZXkoeyBoYW5kbGUsIHZhcmlhbnQgPSBudWxsIH0pIHtcbiAgICAgICAgcmV0dXJuIHZhcmlhbnQgPyBgJHtoYW5kbGV9OiR7dmFyaWFudH1gIDogaGFuZGxlO1xuICAgIH1cblxuICAgIGFkZFByb2R1Y3QoaGFuZGxlLCB0eXBlLCB2YXJpYW50SWQgPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gdGhpcy5nZXRTdG9yZWRQcm9kdWN0cygpO1xuICAgICAgICBjb25zdCBrZXkgPSBDb21wYXJlLmdldEVudHJ5S2V5KHsgaGFuZGxlLCB2YXJpYW50OiB2YXJpYW50SWQgfSk7XG5cbiAgICAgICAgaWYgKHByb2R1Y3RzLnNvbWUocHJvZHVjdCA9PiBDb21wYXJlLmdldEVudHJ5S2V5KHByb2R1Y3QpID09PSBrZXkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY29uc3Qgc2FtZVR5cGVDb3VudCA9IHByb2R1Y3RzLmZpbHRlcihwcm9kdWN0ID0+IChwcm9kdWN0LnR5cGUgfHwgJycpID09PSAodHlwZSB8fCAnJykpLmxlbmd0aDtcbiAgICAgICAgaWYgKHNhbWVUeXBlQ291bnQgPj0gdGhpcy5tYXhQcm9kdWN0cykge1xuICAgICAgICAgICAgdGhpcy5zaG93TGltaXRSZWFjaGVkKHR5cGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnV0dG9ucyBvbiB0aGUgcHJvZHVjdCBwYWdlIGFyZSBwZXIgY29sb3VyLCBzbyBzYXZlIHdoaWNoIHZhcmlhbnQgd2FzIHBpY2tlZFxuICAgICAgICBwcm9kdWN0cy5wdXNoKHZhcmlhbnRJZCA/IHsgdHlwZSwgaGFuZGxlLCB2YXJpYW50OiB2YXJpYW50SWQgfSA6IHsgdHlwZSwgaGFuZGxlIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHByb2R1Y3RzKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1VuYWJsZSB0byBzYXZlIGNvbXBhcmUgcHJvZHVjdHMnLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGl2ZVR5cGUgPSB0eXBlO1xuICAgICAgICAvLyBTY3JvbGxlZCBpbnRvIHZpZXcgb25jZSB0aGUgZ3JpZCBoYXMgYmVlbiByZWJ1aWx0XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9LZXkgPSBrZXk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVVcmwocHJvZHVjdHMpO1xuICAgICAgICB0aGlzLnJlbmRlck5hdigpO1xuICAgICAgICB0aGlzLnJlbmRlckdyaWQoKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB1cGRhdGVVcmwocHJvZHVjdHMpIHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgICAgaWYgKHByb2R1Y3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ2NvbXBhcmUnLCBKU09OLnN0cmluZ2lmeShwcm9kdWN0cykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUoJ2NvbXBhcmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh3aW5kb3cuaGlzdG9yeS5zdGF0ZSwgJycsIHVybCk7XG4gICAgfVxuXG4gICAgcmVtb3ZlUHJvZHVjdChrZXkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvZHVjdHMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvZHVjdHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihwcm9kdWN0ID0+IENvbXBhcmUuZ2V0RW50cnlLZXkocHJvZHVjdCkgIT09IGtleSk7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlVXJsKHRoaXMucHJvZHVjdHMpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJOYXYoKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvZHVjdHMgPSB0aGlzLmdldFN0b3JlZFByb2R1Y3RzKCkuZmlsdGVyKHByb2R1Y3QgPT4gQ29tcGFyZS5nZXRFbnRyeUtleShwcm9kdWN0KSAhPT0ga2V5KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwcm9kdWN0cykpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gcmVtb3ZlIGNvbXBhcmUgcHJvZHVjdCcsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyTmF2KCk7XG4gICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgIH1cblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdChoYW5kbGUpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IHdpbmRvdy5TaG9waWZ5Py5yb3V0ZXM/LnJvb3QgfHwgJy8nO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyB0ZW1wbGF0ZXMvcHJvZHVjdC5jb21wYXJlLmxpcXVpZDogdGhlIHByb2R1Y3RzL3toYW5kbGV9LmpzIGRhdGEgcGx1cyB0aGUgSnVubyBtZXRhZmllbGRzXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3Jvb3R9cHJvZHVjdHMvJHtoYW5kbGV9P3ZpZXc9Y29tcGFyZWApO1xuXG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgICAgICAgICBjb25zdCB7IHByb2R1Y3QsIG1ldGFmaWVsZHM6IHsgdmFyaWFudHM6IHZhcmlhbnRNZXRhZmllbGRzID0gW10sIC4uLm1ldGFmaWVsZHMgfSB9ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgbWV0YWZpZWxkc0J5VmFyaWFudElkID0gbmV3IE1hcCh2YXJpYW50TWV0YWZpZWxkcy5tYXAoKHsgaWQsIC4uLmZpZWxkcyB9KSA9PiBbaWQsIGZpZWxkc10pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5wcm9kdWN0LFxuICAgICAgICAgICAgICAgIG1ldGFmaWVsZHMsXG4gICAgICAgICAgICAgICAgdmFyaWFudHM6IChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKS5tYXAodmFyaWFudCA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi52YXJpYW50LFxuICAgICAgICAgICAgICAgICAgICBtZXRhZmllbGRzOiBtZXRhZmllbGRzQnlWYXJpYW50SWQuZ2V0KHZhcmlhbnQuaWQpIHx8IHt9LFxuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBsb2FkIHByb2R1Y3QgJHtoYW5kbGV9YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgdmFyaWFudCBzYXZlZCB3aGVuIGl0IHdhcyBhZGRlZCBmcm9tIHRoZSBwcm9kdWN0IHBhZ2UuIENvbGxlY3Rpb24gYW5kIHJlbGF0ZWQgcHJvZHVjdFxuICAgIC8vIGNvbXBhcmUgYnV0dG9ucyBhZGQgdGhlIHdob2xlIHByb2R1Y3QsIHNvIGhhdmUgbm8gdmFyaWFudCBhbmQgc2hvdyB0aGUgcHJvZHVjdCdzIG93biBkZXRhaWxzXG4gICAgZ2V0U2VsZWN0ZWRWYXJpYW50KHByb2R1Y3QsIHZhcmlhbnRJZCkge1xuICAgICAgICBpZiAoIXZhcmlhbnRJZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKS5maW5kKHZhcmlhbnQgPT4gdmFyaWFudC5pZCA9PT0gdmFyaWFudElkKSB8fCBudWxsO1xuICAgIH1cblxuICAgIC8vIFRoZSB2YXJpYW50J3Mgb3B0aW9uIHZhbHVlcyB3aXRob3V0IHRoZSBzaXplLCBlLmcuIFwiR3JleSAvIDRtXCIgLT4gXCJHcmV5XCJcbiAgICBnZXRWYXJpYW50TmFtZShwcm9kdWN0LCB2YXJpYW50KSB7XG4gICAgICAgIGlmICghdmFyaWFudCkgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIFByb2R1Y3RzIHdpdGhvdXQgb3B0aW9ucyBoYXZlIGEgc2luZ2xlIFwiRGVmYXVsdCBUaXRsZVwiIHZhcmlhbnRcbiAgICAgICAgaWYgKHZhcmlhbnQudGl0bGUgPT09ICdEZWZhdWx0IFRpdGxlJykgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIHByb2R1Y3RzL3toYW5kbGV9LmpzIGdpdmVzIG9wdGlvbnMgYXMgb2JqZWN0cywgdGhlIExpcXVpZCBqc29uIGZpbHRlciBtYXkgZ2l2ZSBwbGFpbiBuYW1lc1xuICAgICAgICBjb25zdCBvcHRpb25OYW1lcyA9IChwcm9kdWN0Lm9wdGlvbnMgfHwgW10pLm1hcChvcHRpb24gPT4gKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnID8gb3B0aW9uIDogb3B0aW9uLm5hbWUpIHx8ICcnKTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gdmFyaWFudC5vcHRpb25zIHx8IFt2YXJpYW50Lm9wdGlvbjEsIHZhcmlhbnQub3B0aW9uMiwgdmFyaWFudC5vcHRpb24zXS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlc1xuICAgICAgICAgICAgLmZpbHRlcigodmFsdWUsIGluZGV4KSA9PiAhdGhpcy5pc1NpemVPcHRpb24ob3B0aW9uTmFtZXNbaW5kZXhdKSlcbiAgICAgICAgICAgIC5qb2luKCcgLyAnKTtcbiAgICB9XG5cbiAgICAvLyBNYXRjaGVzIHRoZSBvcHRpb24gbmFtZXMgc25pcHBldHMvcHJvZHVjdC1kZXRhaWxzLmxpcXVpZCB0cmVhdHMgYXMgc2l6ZXNcbiAgICBpc1NpemVPcHRpb24obmFtZSA9ICcnKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbk5hbWUgPSBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIHJldHVybiBvcHRpb25OYW1lID09PSAnd2lkdGgnIHx8IG9wdGlvbk5hbWUuaW5jbHVkZXMoJ3NpemUnKTtcbiAgICB9XG5cbiAgICAvLyBGcm9tIHRoZSB2YXJpYW50J3MgSnVubyBpc19pbl9zdG9jayBtZXRhZmllbGQgKHRlbXBsYXRlcy9wcm9kdWN0LmNvbXBhcmUubGlxdWlkKVxuICAgIGdldFN0b2NrU3RhdHVzKHZhcmlhbnQpIHtcbiAgICAgICAgY29uc3QgaW5TdG9jayA9IHZhcmlhbnQ/Lm1ldGFmaWVsZHM/LmlzX2luX3N0b2NrO1xuXG4gICAgICAgIGlmIChpblN0b2NrID09PSAnMScpIHtcbiAgICAgICAgICAgIHJldHVybiAnSW4gc3RvY2snO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnT3V0IG9mIHN0b2NrJztcbiAgICB9XG5cbiAgICAvLyBUaGUgc2VsZWN0ZWQgdmFyaWFudCdzIHN0b2NrLCBvciBmb3IgYSB3aG9sZSBwcm9kdWN0LCBpbiBzdG9jayBpZiBhbnkgb2YgaXRzIHZhcmlhbnRzIGFyZVxuICAgIGdldFByb2R1Y3RTdG9ja1N0YXR1cyhwcm9kdWN0KSB7XG4gICAgICAgIGlmIChwcm9kdWN0LnNlbGVjdGVkVmFyaWFudCkgcmV0dXJuIHRoaXMuZ2V0U3RvY2tTdGF0dXMocHJvZHVjdC5zZWxlY3RlZFZhcmlhbnQpO1xuXG4gICAgICAgIGNvbnN0IGFueUluU3RvY2sgPSAocHJvZHVjdC52YXJpYW50cyB8fCBbXSkuc29tZSh2YXJpYW50ID0+IHRoaXMuZ2V0U3RvY2tTdGF0dXModmFyaWFudCkgPT09ICdJbiBzdG9jaycpO1xuXG4gICAgICAgIHJldHVybiBhbnlJblN0b2NrID8gJ0luIHN0b2NrJyA6ICdPdXQgb2Ygc3RvY2snO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0b2NrVmFsdWUocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSB0aGlzLmdldFByb2R1Y3RTdG9ja1N0YXR1cyhwcm9kdWN0KTtcblxuICAgICAgICBpZiAoc3RhdHVzID09PSAnLScpIHJldHVybiBzdGF0dXM7XG5cbiAgICAgICAgY29uc3Qgc3RvY2tMZXZlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgc3RvY2tMZXZlbC5pZCA9ICdzdG9ja0xldmVsJztcbiAgICAgICAgc3RvY2tMZXZlbC5jbGFzc05hbWUgPSBzdGF0dXMgPT09ICdJbiBzdG9jaycgPyAnaW5zdG9jaycgOiAnb3V0b2ZzdG9jayc7XG4gICAgICAgIHN0b2NrTGV2ZWwudGV4dENvbnRlbnQgPSBzdGF0dXM7XG5cbiAgICAgICAgY29uc3QgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcbiAgICAgICAgaWNvbi5jbGFzc05hbWUgPSBzdGF0dXMgPT09ICdJbiBzdG9jaycgPyAnaWNvbi1pbnN0b2NrJyA6ICdpY29uLW91dG9mc3RvY2snO1xuICAgICAgICBzdG9ja0xldmVsLnByZXBlbmQoaWNvbiwgJyAnKTtcblxuICAgICAgICByZXR1cm4gc3RvY2tMZXZlbDtcbiAgICB9XG5cbiAgICBnZXRQcm9kdWN0VXJsKHByb2R1Y3QpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IHdpbmRvdy5TaG9waWZ5Py5yb3V0ZXM/LnJvb3QgfHwgJy8nO1xuXG4gICAgICAgIHJldHVybiBwcm9kdWN0LnVybCB8fCBgJHtyb290fXByb2R1Y3RzLyR7cHJvZHVjdC5oYW5kbGV9YDtcbiAgICB9XG5cbiAgICBjcmVhdGVQcm9kdWN0SW1hZ2UocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBwcm9kdWN0VXJsID0gdGhpcy5nZXRQcm9kdWN0VXJsKHByb2R1Y3QpO1xuXG4gICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICAgICAgLy8gVmFyaWFudHMgd2l0aG91dCB0aGVpciBvd24gaW1hZ2UgaGF2ZSBmZWF0dXJlZF9pbWFnZSBzZXQgdG8gbnVsbFxuICAgICAgICBpbWFnZS5zcmMgPSBwcm9kdWN0LnNlbGVjdGVkVmFyaWFudD8uZmVhdHVyZWRfaW1hZ2U/LnNyYyB8fCBwcm9kdWN0LmZlYXR1cmVkX2ltYWdlO1xuICAgICAgICAvLyBUaGUgdGl0bGUgbGluayBuYW1lcyB0aGUgcHJvZHVjdCwgc28gdGhlIGltYWdlIGRvZXNuJ3QgbmVlZCB0b1xuICAgICAgICBpbWFnZS5hbHQgPSAnJztcbiAgICAgICAgaW1hZ2UubG9hZGluZyA9ICdsYXp5JztcblxuICAgICAgICAvLyBEdXBsaWNhdGUgb2YgdGhlIHRpdGxlIGxpbmssIHNvIGtlZXAgaXQgb3V0IG9mIHRoZSB0YWIgb3JkZXIgYW5kIHNjcmVlbiByZWFkZXJzXG4gICAgICAgIGNvbnN0IGltYWdlTGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgaW1hZ2VMaW5rLmhyZWYgPSBwcm9kdWN0VXJsO1xuICAgICAgICBpbWFnZUxpbmsudGFiSW5kZXggPSAtMTtcbiAgICAgICAgaW1hZ2VMaW5rLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICBpbWFnZUxpbmsuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuXG4gICAgICAgIC8vIFNob3cgdGhlIGxvYWRpbmcgc2tlbGV0b24gdW50aWwgdGhlIGltYWdlIGhhcyBsb2FkZWQuIEltYWdlcyBhbHJlYWR5IGluIHRoZSBicm93c2VyJ3MgY2FjaGVcbiAgICAgICAgLy8gYXJlIGNvbXBsZXRlIHN0cmFpZ2h0IGF3YXksIHNvIHByb2R1Y3RzIGFscmVhZHkgaW4gdGhlIHRhYmxlIGRvbid0IGZsYXNoIHRoZSBza2VsZXRvbiB3aGVuIGl0IHJlLXJlbmRlcnNcbiAgICAgICAgaWYgKCEoaW1hZ2UuY29tcGxldGUgJiYgaW1hZ2UubmF0dXJhbFdpZHRoKSkge1xuICAgICAgICAgICAgaW1hZ2VMaW5rLmNsYXNzTGlzdC5hZGQoJ2NvbXBhcmUtc2tlbGV0b24nLCAnY29tcGFyZS1wcm9kdWN0LWltYWdlLS1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNob3dJbWFnZSA9ICgpID0+IGltYWdlTGluay5jbGFzc0xpc3QucmVtb3ZlKCdjb21wYXJlLXNrZWxldG9uJywgJ2NvbXBhcmUtcHJvZHVjdC1pbWFnZS0tbG9hZGluZycpO1xuICAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHNob3dJbWFnZSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgLy8gRG9uJ3QgbGVhdmUgdGhlIHNrZWxldG9uIHNoaW1tZXJpbmcgaWYgdGhlIGltYWdlIGZhaWxzXG4gICAgICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNob3dJbWFnZSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QtaW1hZ2UnO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGltYWdlTGluayk7XG5cbiAgICAgICAgY29uc3QgdGl0bGVMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICB0aXRsZUxpbmsuaHJlZiA9IHByb2R1Y3RVcmw7XG4gICAgICAgIHRpdGxlTGluay50ZXh0Q29udGVudCA9IHByb2R1Y3QudGl0bGU7XG5cbiAgICAgICAgY29uc3QgdmFyaWFudFRpdGxlID0gdGhpcy5nZXRWYXJpYW50TmFtZShwcm9kdWN0LCBwcm9kdWN0LnNlbGVjdGVkVmFyaWFudCk7XG5cbiAgICAgICAgaWYgKHZhcmlhbnRUaXRsZSkge1xuICAgICAgICAgICAgY29uc3QgdmFyaWFudE5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHZhcmlhbnROYW1lLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QtdGl0bGVfX3ZhcmlhbnQnO1xuICAgICAgICAgICAgdmFyaWFudE5hbWUudGV4dENvbnRlbnQgPSB2YXJpYW50VGl0bGU7XG4gICAgICAgICAgICB0aXRsZUxpbmsuYXBwZW5kKCcgJywgdmFyaWFudE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gJ2NvbXBhcmUtcHJvZHVjdC10aXRsZSc7XG4gICAgICAgIHRpdGxlLmFwcGVuZENoaWxkKHRpdGxlTGluayk7XG5cbiAgICAgICAgY29uc3QgcmVtb3ZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXJlbW92ZSc7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgUmVtb3ZlICR7cHJvZHVjdC50aXRsZX0gZnJvbSBjb21wYXJpc29uYCk7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNiA2bDEyIDEyTTE4IDZMNiAxOFwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBgO1xuICAgICAgICByZW1vdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnJlbW92ZVByb2R1Y3QocHJvZHVjdC5jb21wYXJlS2V5KSk7XG5cbiAgICAgICAgY29uc3QgcHJvZHVjdENhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJvZHVjdENhcmQuY2xhc3NOYW1lID0gJ2NvbXBhcmUtcHJvZHVjdCc7XG4gICAgICAgIHByb2R1Y3RDYXJkLmRhdGFzZXQua2V5ID0gcHJvZHVjdC5jb21wYXJlS2V5O1xuICAgICAgICBwcm9kdWN0Q2FyZC5hcHBlbmQocmVtb3ZlQnV0dG9uLCB3cmFwcGVyLCB0aXRsZSk7XG5cbiAgICAgICAgcmV0dXJuIHByb2R1Y3RDYXJkO1xuICAgIH1cblxuICAgIGdldFNwZWNpZmljYXRpb25WYWx1ZShwcm9kdWN0LCBzcGVjaWZpY2F0aW9uKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGAke3NwZWNpZmljYXRpb259X2A7XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSAocHJvZHVjdC50YWdzIHx8IFtdKVxuICAgICAgICAgICAgLmZpbHRlcih0YWcgPT4gdGFnLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgICAgIC5tYXAodGFnID0+IHRhZy5yZXBsYWNlKHByZWZpeCwgJycpKVxuICAgICAgICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlIHx8ICctJztcbiAgICB9XG5cbiAgICBmb3JtYXRQcmljZShjZW50cykge1xuICAgICAgICBjb25zdCBjdXJyZW5jeSA9IHdpbmRvdy5TaG9waWZ5Py5jdXJyZW5jeT8uYWN0aXZlIHx8ICdHQlAnO1xuXG4gICAgICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgfHwgJ2VuLUdCJywge1xuICAgICAgICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXG4gICAgICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgfSkuZm9ybWF0KGNlbnRzIC8gMTAwKTtcbiAgICB9XG5cbiAgICAvLyBGcm9tIHRoZSBcIlBhY2sgU2l6ZSAoTcKyKV9cIiB0YWcsIGUuZy4gXCJQYWNrIFNpemUgKE3CsilfMi4yMm3CslwiIC0+IDIuMjIsIG1hdGNoaW5nIHNuaXBwZXRzL3Byb2R1Y3QtZGV0YWlscy10b3AubGlxdWlkXG4gICAgZ2V0UGFja1NpemUocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSAnUGFjayBTaXplIChNwrIpXyc7XG4gICAgICAgIGNvbnN0IHRhZyA9IChwcm9kdWN0LnRhZ3MgfHwgW10pLmZpbmQodGFnID0+IHRhZy5pbmNsdWRlcyhwcmVmaXgpKTtcbiAgICAgICAgY29uc3QgcGFja1NpemUgPSB0YWcgPyBwYXJzZUZsb2F0KHRhZy5yZXBsYWNlKHByZWZpeCwgJycpLnNwbGl0KCdtJylbMF0pIDogTmFOO1xuXG4gICAgICAgIHJldHVybiBwYWNrU2l6ZSA+IDAgPyBwYWNrU2l6ZSA6IG51bGw7XG4gICAgfVxuXG4gICAgY3JlYXRlUHJpY2VWYWx1ZShwcm9kdWN0KSB7XG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgIGNvbnN0IGlzUGFja1ByaWNlZCA9IFsnTGFtaW5hdGUnLCAnTFZUJywgJ1JlYWwgV29vZCddLmluY2x1ZGVzKHByb2R1Y3QudHlwZSk7XG5cbiAgICAgICAgLy8gVGhlc2UgYXJlIHByaWNlZCBwZXIgcGFjaywgc28gc2hvdyB0aGVtIHBlciBtwrIgbGlrZSB0aGUgcHJvZHVjdCBwYWdlXG4gICAgICAgIGNvbnN0IHBhY2tTaXplID0gKGlzUGFja1ByaWNlZCAmJiB0aGlzLmdldFBhY2tTaXplKHByb2R1Y3QpKSB8fCAxO1xuICAgICAgICBjb25zdCBwcmljZUNlbnRzID0gTWF0aC5yb3VuZChwcm9kdWN0LnByaWNlIC8gcGFja1NpemUpO1xuICAgICAgICBjb25zdCBycnBQcmljZSA9IHRoaXMuZ2V0UnJwUHJpY2UocHJvZHVjdCwgcHJpY2VDZW50cyAvIDEwMCwgdHJ1ZSwgcGFja1NpemUpO1xuXG4gICAgICAgIGlmIChycnBQcmljZSkge1xuICAgICAgICAgICAgY29uc3QgcnJwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncycpO1xuICAgICAgICAgICAgcnJwLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QtcnJwJztcbiAgICAgICAgICAgIHJycC50ZXh0Q29udGVudCA9IGAke3JycFByaWNlLmxhYmVsfSAke3JycFByaWNlLmFtb3VudH1gO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kKHJycCwgJyAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByaWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwcmljZS5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXByaWNlJztcbiAgICAgICAgY29uc3Qgb25seSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgb25seS5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXByaWNlX19vbmx5JztcbiAgICAgICAgb25seS50ZXh0Q29udGVudCA9ICdPbmx5JztcbiAgICAgICAgcHJpY2UuYXBwZW5kKG9ubHksIGAgJHt0aGlzLmZvcm1hdFByaWNlKHByaWNlQ2VudHMpfSR7dGhpcy5nZXRQcmljZVVuaXQocHJvZHVjdC50eXBlKX0gYCk7XG4gICAgICAgIGZyYWdtZW50LnByZXBlbmQocHJpY2UpO1xuXG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG5cbiAgICBjcmVhdGVSb3cobGFiZWxUZXh0LCBwcm9kdWN0cywgZ2V0VmFsdWUpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ3NwZWNpZmljYXRpb24nO1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IGxhYmVsVGV4dDtcbiAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgICAgIHByb2R1Y3RzLmZvckVhY2gocHJvZHVjdCA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdmFsdWUuY2xhc3NOYW1lID0gJ3NwZWNpZmljYXRpb24tdmFsdWUnO1xuICAgICAgICAgICAgdmFsdWUuZGF0YXNldC5rZXkgPSBwcm9kdWN0LmNvbXBhcmVLZXk7XG4gICAgICAgICAgICB2YWx1ZS5hcHBlbmQoZ2V0VmFsdWUocHJvZHVjdCkpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQodmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxuXG4gICAgY3JlYXRlU2tlbGV0b25MaW5lKCkge1xuICAgICAgICBjb25zdCBsaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGxpbmUuY2xhc3NOYW1lID0gJ2NvbXBhcmUtc2tlbGV0b24gY29tcGFyZS1za2VsZXRvbl9fbGluZSc7XG5cbiAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfVxuXG4gICAgZ3JvdXBCeVR5cGUoc3RvcmVkUHJvZHVjdHMpIHtcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIHN0b3JlZFByb2R1Y3RzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGVudHJ5LnR5cGUgfHwgJyc7XG5cbiAgICAgICAgICAgIGlmICghZ3JvdXBzLmhhcyh0eXBlKSkgZ3JvdXBzLnNldCh0eXBlLCBbXSk7XG4gICAgICAgICAgICBncm91cHMuZ2V0KHR5cGUpLnB1c2goZW50cnkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBzO1xuICAgIH1cblxuICAgIGdldCBsYWJlbENvbHVtbldpZHRoKCkge1xuICAgICAgICBpZiAodGhpcy5leHRyYVNtYWxsU2NyZWVuUXVlcnkubWF0Y2hlcykgcmV0dXJuIDEwMDtcblxuICAgICAgICByZXR1cm4gdGhpcy5zbWFsbFNjcmVlblF1ZXJ5Lm1hdGNoZXMgPyAxMjAgOiAxNjA7XG4gICAgfVxuXG4gICAgZ2V0IHByb2R1Y3RDb2x1bW5XaWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0cmFTbWFsbFNjcmVlblF1ZXJ5Lm1hdGNoZXMgPyAxMzAgOiAyMzA7XG4gICAgfVxuXG4gICAgc2V0R3JpZENvbHVtbnMoZ3JpZCkge1xuICAgICAgICBncmlkLnN0eWxlLmdyaWRUZW1wbGF0ZUNvbHVtbnMgPSBgJHt0aGlzLmxhYmVsQ29sdW1uV2lkdGh9cHggcmVwZWF0KCR7Z3JpZC5kYXRhc2V0LmNvbHVtbnN9LCAke3RoaXMucHJvZHVjdENvbHVtbldpZHRofXB4KWA7XG4gICAgfVxuXG4gICAgY3JlYXRlR3JpZCh0eXBlLCBjb2x1bW5zKSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZ3JpZC5jbGFzc05hbWUgPSAnY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkJztcbiAgICAgICAgZ3JpZC5kYXRhc2V0LnR5cGUgPSB0eXBlO1xuICAgICAgICBncmlkLmRhdGFzZXQuY29sdW1ucyA9IGNvbHVtbnM7XG4gICAgICAgIHRoaXMuc2V0R3JpZENvbHVtbnMoZ3JpZCk7XG5cbiAgICAgICAgY29uc3Qgc3BhY2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwYWNlci5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXNwYWNlcic7XG4gICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQoc3BhY2VyKTtcblxuICAgICAgICByZXR1cm4gZ3JpZDtcbiAgICB9XG5cbiAgICBnZXRTcGVjaWZpY2F0aW9ucyh0eXBlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnTGFtaW5hdGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwZWNpZmljYXRpb25zTGFtaW5hdGU7XG4gICAgICAgICAgICBjYXNlICdBcnRpZmljaWFsIEdyYXNzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc0FydGlmaWNpYWxHcmFzcztcbiAgICAgICAgICAgIGNhc2UgJ1ZpbnlsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc1ZpbnlsO1xuICAgICAgICAgICAgY2FzZSAnTFZUJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc0xWVDtcbiAgICAgICAgICAgIGNhc2UgJ1JlYWwgV29vZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3BlY2lmaWNhdGlvbnNSZWFsV29vZDtcbiAgICAgICAgICAgIGNhc2UgJ0FjY2Vzc29yaWVzICYgVW5kZXJsYXknOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwZWNpZmljYXRpb25zQWNjZXNzb3JpZXM7XG4gICAgICAgICAgICBjYXNlICdSdWdzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc1J1Z3M7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwZWNpZmljYXRpb25zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlU2tlbGV0b25HcmlkKHR5cGUsIGNvdW50KSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmNyZWF0ZUdyaWQodHlwZSwgY291bnQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGltYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLXNrZWxldG9uIGNvbXBhcmUtc2tlbGV0b25fX2ltYWdlJztcblxuICAgICAgICAgICAgY29uc3QgcHJvZHVjdENhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHByb2R1Y3RDYXJkLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QnO1xuICAgICAgICAgICAgcHJvZHVjdENhcmQuYXBwZW5kKGltYWdlLCB0aGlzLmNyZWF0ZVNrZWxldG9uTGluZSgpKTtcblxuICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChwcm9kdWN0Q2FyZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmljZSBhbmQgU3RvY2sgcm93cywgdGhlbiB0aGUgc3BlY2lmaWNhdGlvbnNcbiAgICAgICAgY29uc3Qgcm93Q291bnQgPSB0aGlzLmdldFNwZWNpZmljYXRpb25zKHR5cGUpLmxlbmd0aCArIDI7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCByb3dDb3VudDsgcm93KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBsYWJlbC5jbGFzc05hbWUgPSAnc3BlY2lmaWNhdGlvbic7XG4gICAgICAgICAgICBsYWJlbC5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZVNrZWxldG9uTGluZSgpKTtcbiAgICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIHZhbHVlLmNsYXNzTmFtZSA9ICdzcGVjaWZpY2F0aW9uLXZhbHVlJztcbiAgICAgICAgICAgICAgICB2YWx1ZS5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZVNrZWxldG9uTGluZSgpKTtcbiAgICAgICAgICAgICAgICBncmlkLmFwcGVuZENoaWxkKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBncmlkO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb2R1Y3RHcmlkKHR5cGUsIHByb2R1Y3RzKSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmNyZWF0ZUdyaWQodHlwZSwgcHJvZHVjdHMubGVuZ3RoKTtcblxuICAgICAgICBwcm9kdWN0cy5mb3JFYWNoKHByb2R1Y3QgPT4ge1xuICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZVByb2R1Y3RJbWFnZShwcm9kdWN0KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZSBjZWxscyBzaXQgZGlyZWN0bHkgaW4gdGhlIGdyaWQsIHNvIG1hcmsgZXZlcnkgZXZlbiByb3cgZm9yIGl0cyBiYWNrZ3JvdW5kIGNvbG91clxuICAgICAgICBsZXQgcm93Q291bnQgPSAwO1xuICAgICAgICBjb25zdCBhcHBlbmRSb3cgPSByb3cgPT4ge1xuICAgICAgICAgICAgcm93Q291bnQgKz0gMTtcbiAgICAgICAgICAgIGlmIChyb3dDb3VudCAlIDIgPT09IDApIHJvdy5jaGlsZE5vZGVzLmZvckVhY2goY2VsbCA9PiBjZWxsLmNsYXNzTGlzdC5hZGQoJ2NvbXBhcmUtcm93LS1ldmVuJykpO1xuICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGFwcGVuZFJvdyhcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm93KCdQcmljZScsIHByb2R1Y3RzLCBwcm9kdWN0ID0+IHRoaXMuY3JlYXRlUHJpY2VWYWx1ZShwcm9kdWN0KSlcbiAgICAgICAgKTtcblxuICAgICAgICBhcHBlbmRSb3coXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvdygnU3RvY2snLCBwcm9kdWN0cywgcHJvZHVjdCA9PiB0aGlzLmNyZWF0ZVN0b2NrVmFsdWUocHJvZHVjdCkpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5nZXRTcGVjaWZpY2F0aW9ucyh0eXBlKVxuICAgICAgICAgICAgLy8gU2tpcCBzcGVjaWZpY2F0aW9ucyBub25lIG9mIHRoZSBwcm9kdWN0cyBoYXZlXG4gICAgICAgICAgICAuZmlsdGVyKHNwZWNpZmljYXRpb24gPT4gcHJvZHVjdHMuc29tZShwcm9kdWN0ID0+IHRoaXMuZ2V0U3BlY2lmaWNhdGlvblZhbHVlKHByb2R1Y3QsIHNwZWNpZmljYXRpb24pICE9PSAnLScpKVxuICAgICAgICAgICAgLmZvckVhY2goc3BlY2lmaWNhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgYXBwZW5kUm93KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJvdyhzcGVjaWZpY2F0aW9uLCBwcm9kdWN0cywgcHJvZHVjdCA9PiB0aGlzLmdldFNwZWNpZmljYXRpb25WYWx1ZShwcm9kdWN0LCBzcGVjaWZpY2F0aW9uKSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdyaWQ7XG4gICAgfVxuXG4gICAgZ2V0Q29sbGVjdGlvbklkKGNvbGxlY3Rpb25faWQpIHtcbiAgICAgICAgc3dpdGNoIChjb2xsZWN0aW9uX2lkKSB7XG4gICAgICAgICAgICBjYXNlICdsYW1pbmF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdsYW1pbmF0ZS1mbG9vcmluZyc7XG4gICAgICAgICAgICBjYXNlICdhY2Nlc3Nvcmllcy11bmRlcmxheSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhY2Nlc3Nvcmllcyc7XG4gICAgICAgICAgICBjYXNlICd2aW55bCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2aW55bC1mbG9vcmluZyc7XG4gICAgICAgICAgICBjYXNlICdsdnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnbHZ0LWZsb29yaW5nJztcbiAgICAgICAgICAgIGNhc2UgJ2FydGlmaWNpYWwgZ3Jhc3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYXJ0aWZpY2lhbC1ncmFzcyc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uX2lkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyR3JpZCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyaWRzQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVuZGVySWQgPSB0aGlzLnJlbmRlcklkID0gKHRoaXMucmVuZGVySWQgfHwgMCkgKyAxO1xuXG4gICAgICAgIGNvbnN0IHN0b3JlZFByb2R1Y3RzID0gdGhpcy5nZXRQcm9kdWN0cygpO1xuXG4gICAgICAgIGlmICghc3RvcmVkUHJvZHVjdHMubGVuZ3RoICYmIHRoaXMuZW1wdHlNZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAnY29tcGFyaXNvbi1wYWdlX19lbXB0eSc7XG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gdGhpcy5lbXB0eU1lc3NhZ2U7XG5cbiAgICAgICAgICAgIGNvbnN0IGJyb3dzZUxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBicm93c2VMaW5rLmNsYXNzTmFtZSA9ICdidXR0b24gY29tcGFyaXNvbi1wYWdlX19icm93c2UnO1xuICAgICAgICAgICAgYnJvd3NlTGluay5ocmVmID0gd2luZG93LlNob3BpZnk/LnJvdXRlcz8ucm9vdCB8fCAnLyc7XG4gICAgICAgICAgICBicm93c2VMaW5rLnRleHRDb250ZW50ID0gJ0Jyb3dzZSBvdXIgcHJvZHVjdHMnO1xuXG4gICAgICAgICAgICBjb25zdCBicm93c2VXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBicm93c2VXcmFwcGVyLmNsYXNzTmFtZSA9ICdjb21wYXJpc29uLXBhZ2VfX2Jyb3dzZS13cmFwcGVyJztcbiAgICAgICAgICAgIGJyb3dzZVdyYXBwZXIuYXBwZW5kQ2hpbGQoYnJvd3NlTGluayk7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JpZHNDb250YWluZXIucmVwbGFjZUNoaWxkcmVuKG1lc3NhZ2UsIGJyb3dzZVdyYXBwZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ3JvdXBzID0gdGhpcy5ncm91cEJ5VHlwZShzdG9yZWRQcm9kdWN0cyk7XG5cbiAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lci5yZXBsYWNlQ2hpbGRyZW4oXG4gICAgICAgICAgICAuLi5bLi4uZ3JvdXBzXS5tYXAoKFt0eXBlLCBlbnRyaWVzXSkgPT4gdGhpcy5jcmVhdGVTa2VsZXRvbkdyaWQodHlwZSwgZW50cmllcy5sZW5ndGgpKSxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JlYXRlRW1wdHlUeXBlR3JpZHMoWy4uLmdyb3Vwcy5rZXlzKCldKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnVwZGF0ZUdyaWRXaWR0aHMoKTtcbiAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVUeXBlKCk7XG5cbiAgICAgICAgLy8gVmFyaWFudHMgb2YgdGhlIHNhbWUgcHJvZHVjdCBzaGFyZSBvbmUgcmVxdWVzdFxuICAgICAgICBjb25zdCBoYW5kbGVzID0gWy4uLm5ldyBTZXQoc3RvcmVkUHJvZHVjdHMubWFwKCh7IGhhbmRsZSB9KSA9PiBoYW5kbGUpKV07XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChoYW5kbGVzLm1hcChoYW5kbGUgPT4gdGhpcy5mZXRjaFByb2R1Y3QoaGFuZGxlKSkpO1xuICAgICAgICBjb25zdCBwcm9kdWN0c0J5SGFuZGxlID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaChwcm9kdWN0ID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9kdWN0ICYmIHByb2R1Y3QuZmVhdHVyZWRfaW1hZ2UpIHByb2R1Y3RzQnlIYW5kbGUuc2V0KHByb2R1Y3QuaGFuZGxlLCBwcm9kdWN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQSBuZXdlciByZW5kZXIgc3RhcnRlZCB3aGlsZSB0aGlzIG9uZSB3YXMgZmV0Y2hpbmdcbiAgICAgICAgaWYgKHJlbmRlcklkICE9PSB0aGlzLnJlbmRlcklkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZ3JpZHMgPSBbXTtcblxuICAgICAgICBncm91cHMuZm9yRWFjaCgoZW50cmllcywgdHlwZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSBlbnRyaWVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihlbnRyeSA9PiBwcm9kdWN0c0J5SGFuZGxlLmhhcyhlbnRyeS5oYW5kbGUpKVxuICAgICAgICAgICAgICAgIC5tYXAoZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9kdWN0ID0gcHJvZHVjdHNCeUhhbmRsZS5nZXQoZW50cnkuaGFuZGxlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucHJvZHVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhcmVLZXk6IENvbXBhcmUuZ2V0RW50cnlLZXkoZW50cnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRWYXJpYW50OiB0aGlzLmdldFNlbGVjdGVkVmFyaWFudChwcm9kdWN0LCBlbnRyeS52YXJpYW50KSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHByb2R1Y3RzLmxlbmd0aCkgZ3JpZHMucHVzaCh0aGlzLmNyZWF0ZVByb2R1Y3RHcmlkKHR5cGUsIHByb2R1Y3RzKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHR5cGVzV2l0aEdyaWRzID0gZ3JpZHMubWFwKGdyaWQgPT4gZ3JpZC5kYXRhc2V0LnR5cGUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZHNDb250YWluZXIucmVwbGFjZUNoaWxkcmVuKC4uLmdyaWRzLCAuLi50aGlzLmNyZWF0ZUVtcHR5VHlwZUdyaWRzKHR5cGVzV2l0aEdyaWRzKSk7XG4gICAgICAgIHRoaXMudXBkYXRlR3JpZFdpZHRocygpO1xuICAgICAgICB0aGlzLnVwZGF0ZUFjdGl2ZVR5cGUoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJBZGRQcm9kdWN0cygpO1xuICAgICAgICB0aGlzLnNjcm9sbFRvQWRkZWRQcm9kdWN0KCk7XG4gICAgfVxuXG4gICAgLy8gQSBwbGFjZWhvbGRlciBncmlkIGZvciBlYWNoIG5hdiB0eXBlIHRoYXQgaGFzIG5vIHByb2R1Y3RzLCBzbyBzZWxlY3RpbmcgaXQgc2hvd3MgYSBtZXNzYWdlXG4gICAgY3JlYXRlRW1wdHlUeXBlR3JpZHModHlwZXNXaXRoR3JpZHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZXMoKVxuICAgICAgICAgICAgLmZpbHRlcih0eXBlID0+ICF0eXBlc1dpdGhHcmlkcy5pbmNsdWRlcyh0eXBlKSlcbiAgICAgICAgICAgIC5tYXAodHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NOYW1lID0gJ2NvbXBhcmUtbW9kYWxfX3Byb2R1Y3QtZ3JpZCBjb21wYXJlLW1vZGFsX19wcm9kdWN0LWdyaWQtLWVtcHR5JztcbiAgICAgICAgICAgICAgICBncmlkLmRhdGFzZXQudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICAgICAgZ3JpZC5kYXRhc2V0LmNvbHVtbnMgPSAwO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX190eXBlLWVtcHR5JztcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gYE5vICR7dHlwZSB8fCAnb3RoZXInfSBwcm9kdWN0cyBhZGRlZCB0byBjb21wYXJlIHlldC5gO1xuXG4gICAgICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBncmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2Nyb2xsVG9BZGRlZFByb2R1Y3QoKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuc2Nyb2xsVG9LZXk7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9LZXkgPSBudWxsO1xuXG4gICAgICAgIGlmICgha2V5KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2FyZCA9IFsuLi50aGlzLmdyaWRzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb21wYXJlLXByb2R1Y3QnKV1cbiAgICAgICAgICAgIC5maW5kKHByb2R1Y3RDYXJkID0+IHByb2R1Y3RDYXJkLmRhdGFzZXQua2V5ID09PSBrZXkpO1xuXG4gICAgICAgIGlmICghY2FyZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlZHVjZU1vdGlvbiA9IHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG5cbiAgICAgICAgLy8gXCJuZWFyZXN0XCIgb25seSBzY3JvbGxzIHdoZW4gdGhlIHByb2R1Y3QgaXNuJ3QgYWxyZWFkeSBmdWxseSBpbiB2aWV3XG4gICAgICAgIGNhcmQuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgYmVoYXZpb3I6IHJlZHVjZU1vdGlvbiA/ICdhdXRvJyA6ICdzbW9vdGgnLFxuICAgICAgICAgICAgYmxvY2s6ICduZWFyZXN0JyxcbiAgICAgICAgICAgIGlubGluZTogJ25lYXJlc3QnLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVHcmlkV2lkdGhzKCkge1xuICAgICAgICBjb25zdCBncmlkcyA9IFsuLi50aGlzLmdyaWRzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb21wYXJlLW1vZGFsX19wcm9kdWN0LWdyaWQnKV07XG5cbiAgICAgICAgLy8gSGlkZGVuIGdyaWRzIG1lYXN1cmUgYXMgMCB3aWRlLCBzbyB3b3JrIHRoZSB3aWR0aHMgb3V0IGZyb20gdGhlaXIgY29sdW1uIGNvdW50c1xuICAgICAgICBjb25zdCB3aWR0aHMgPSBncmlkcy5tYXAoZ3JpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gTnVtYmVyKGdyaWQuZGF0YXNldC5jb2x1bW5zKSB8fCAwO1xuICAgICAgICAgICAgY29uc3QgZ2FwID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGdyaWQpLmNvbHVtbkdhcCkgfHwgMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFiZWxDb2x1bW5XaWR0aCArIGNvbHVtbnMgKiAodGhpcy5wcm9kdWN0Q29sdW1uV2lkdGggKyBnYXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB3aWRlc3QgPSBNYXRoLm1heCgwLCAuLi53aWR0aHMpO1xuXG4gICAgICAgIC8vIEtlZXAgZXZlcnkgZ3JpZCBhcyB3aWRlIGFzIHRoZSB3aWRlc3Qgc28gdGhlIG1vZGFsIGRvZXNuJ3QgcmVzaXplIHdoZW4gc3dpdGNoaW5nIHR5cGVcbiAgICAgICAgZ3JpZHMuZm9yRWFjaChncmlkID0+IHtcbiAgICAgICAgICAgIGdyaWQuc3R5bGUubWluV2lkdGggPSBgJHt3aWRlc3R9cHhgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbGlzdCBzaG93cyB0aGUgZmlyc3QgMTAuIFNlYXJjaGluZyBsb2FkcyB1cCB0byAyNTAsIHRoZSBtb3N0IHByb2R1Y3RzLmpzb24gcmV0dXJucyBhdCBvbmNlXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0c0J5VHlwZSh0eXBlLCBsaW1pdCA9IDEwKSB7XG4gICAgICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7dHlwZX06JHtsaW1pdH1gO1xuXG4gICAgICAgIGlmICh0aGlzLnByb2R1Y3RzQnlUeXBlLmhhcyhjYWNoZUtleSkpIHJldHVybiB0aGlzLnByb2R1Y3RzQnlUeXBlLmdldChjYWNoZUtleSk7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IHdpbmRvdy5TaG9waWZ5Py5yb3V0ZXM/LnJvb3QgfHwgJy8nO1xuICAgICAgICAvLyBDb2xsZWN0aW9uIGhhbmRsZXMgYXJlIGxvd2VyY2FzZSB3aXRoIGh5cGhlbnMsIGxpa2UgU2hvcGlmeSdzIGhhbmRsZWl6ZSxcbiAgICAgICAgLy8gZS5nLiBcIkFydGlmaWNpYWwgR3Jhc3NcIiAtPiBcImFydGlmaWNpYWwtZ3Jhc3NcIiwgXCJBY2Nlc3NvcmllcyAmIFVuZGVybGF5XCIgLT4gXCJhY2Nlc3Nvcmllcy11bmRlcmxheVwiXG4gICAgICAgIGNvbnN0IGhhbmRsZSA9IHR5cGUudHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpLnJlcGxhY2UoL14tfC0kL2csICcnKTtcblxuICAgICAgICBsZXQgY29sbGVjdGlvbl9pZCA9IHRoaXMuZ2V0Q29sbGVjdGlvbklkKGhhbmRsZSk7XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtyb290fWNvbGxlY3Rpb25zLyR7Y29sbGVjdGlvbl9pZH0vcHJvZHVjdHMuanNvbj9saW1pdD0ke2xpbWl0fWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgY29uc3QgZGF0YU9iaiA9IEpTT04ucGFyc2UoZGF0YSlcblxuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSAoZGF0YU9iai5wcm9kdWN0cyB8fCBbXSkuZmlsdGVyKHByb2R1Y3QgPT4gcHJvZHVjdC5wcm9kdWN0X3R5cGUudG9Mb3dlckNhc2UoKSA9PT0gdHlwZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnByb2R1Y3RzQnlUeXBlLnNldChjYWNoZUtleSwgcHJvZHVjdHMpO1xuXG4gICAgICAgICAgICByZXR1cm4gcHJvZHVjdHM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBsb2FkICR7dHlwZX0gcHJvZHVjdHNgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQcm9kdWN0SW1hZ2UocHJvZHVjdCkge1xuICAgICAgICAvLyBwcm9kdWN0cy5qc29uIHJldHVybnMgYW4gaW1hZ2VzIGFycmF5IHJhdGhlciB0aGFuIGEgc2luZ2xlIGltYWdlXG4gICAgICAgIHJldHVybiBwcm9kdWN0LmltYWdlcz8uWzBdPy5zcmMgfHwgJyc7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyB0aGUgdGhlbWUncyBwcm9kdWN0IGdyaWQ6IFwid2FzXCIgcHJpY2UgaWYgb24gc2FsZSwgb3RoZXJ3aXNlIFJSUCBmcm9tIGFuIFJSUF8gdGFnXG4gICAgLy8gcHJvZHVjdHMuanNvbiBnaXZlcyBjb21wYXJlX2F0X3ByaWNlIGFzIGEgZGVjaW1hbCBzdHJpbmcsIHByb2R1Y3RzL3toYW5kbGV9LmpzIGluIGNlbnRzXG4gICAgLy8gcGFja1NpemUgZGl2aWRlcyB0aGUgXCJ3YXNcIiBwcmljZSB0byBwZXIgbcKyLCBhcyBwcmljZSBzaG91bGQgYWxyZWFkeSBiZS4gVGhlIFJSUF8gdGFnIGlzIGFscmVhZHkgcGVyIG3Csi5cbiAgICAvLyBTb2xkIHBlciBpdGVtLCBzbyBoYXZlIG5vIHBlciBtwrIgdW5pdFxuICAgIGdldFByaWNlVW5pdCh0eXBlKSB7XG4gICAgICAgIHJldHVybiBbJ0FjY2Vzc29yaWVzICYgVW5kZXJsYXknLCAnUnVncyddLmluY2x1ZGVzKHR5cGUpID8gJycgOiAnbcKyJztcbiAgICB9XG5cbiAgICBnZXRScnBQcmljZShwcm9kdWN0LCBwcmljZSwgY29tcGFyZUF0SW5DZW50cyA9IGZhbHNlLCBwYWNrU2l6ZSA9IDEpIHtcbiAgICAgICAgY29uc3QgdW5pdCA9IHRoaXMuZ2V0UHJpY2VVbml0KHByb2R1Y3QudHlwZSA/PyBwcm9kdWN0LnByb2R1Y3RfdHlwZSk7XG4gICAgICAgIGNvbnN0IGNvbXBhcmVBdFByaWNlcyA9IChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKVxuICAgICAgICAgICAgLm1hcCh2YXJpYW50ID0+IHBhcnNlRmxvYXQodmFyaWFudC5jb21wYXJlX2F0X3ByaWNlKSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29tcGFyZUF0ID0+ICFOdW1iZXIuaXNOYU4oY29tcGFyZUF0KSlcbiAgICAgICAgICAgIC5tYXAoY29tcGFyZUF0ID0+IChjb21wYXJlQXRJbkNlbnRzID8gY29tcGFyZUF0IC8gMTAwIDogY29tcGFyZUF0KSAvIHBhY2tTaXplKTtcblxuICAgICAgICBjb25zdCBjb21wYXJlQXQgPSBjb21wYXJlQXRQcmljZXMubGVuZ3RoID8gTWF0aC5taW4oLi4uY29tcGFyZUF0UHJpY2VzKSA6IDA7XG5cbiAgICAgICAgaWYgKGNvbXBhcmVBdCA+IHByaWNlKSByZXR1cm4geyBsYWJlbDogJ3dhcycsIGFtb3VudDogYCR7dGhpcy5mb3JtYXRQcmljZShNYXRoLnJvdW5kKGNvbXBhcmVBdCAqIDEwMCkpfSR7dW5pdH1gIH07XG5cbiAgICAgICAgY29uc3QgdGFncyA9IEFycmF5LmlzQXJyYXkocHJvZHVjdC50YWdzKSA/IHByb2R1Y3QudGFncyA6IFN0cmluZyhwcm9kdWN0LnRhZ3MgfHwgJycpLnNwbGl0KCcsICcpO1xuICAgICAgICBjb25zdCBycnBUYWcgPSB0YWdzLmZpbmQodGFnID0+IHRhZy5zdGFydHNXaXRoKCdSUlBfJykpO1xuICAgICAgICBjb25zdCBycnAgPSBycnBUYWcgPyBwYXJzZUZsb2F0KHJycFRhZy5yZXBsYWNlKCdSUlBfJywgJycpKSA6IDA7XG5cbiAgICAgICAgaWYgKHJycCA+IHByaWNlKSByZXR1cm4geyBsYWJlbDogJ1JSUCcsIGFtb3VudDogYCR7dGhpcy5mb3JtYXRQcmljZShNYXRoLnJvdW5kKHJycCAqIDEwMCkpfSR7dW5pdH1gIH07XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY3JlYXRlQWRkUHJvZHVjdEl0ZW0ocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmdldFByb2R1Y3RJbWFnZShwcm9kdWN0KTtcbiAgICAgICAgLy8gVGhlIGJ1dHRvbidzIGxhYmVsIGFscmVhZHkgbmFtZXMgdGhlIHByb2R1Y3RcbiAgICAgICAgaW1hZ2UuYWx0ID0gJyc7XG4gICAgICAgIGltYWdlLmxvYWRpbmcgPSAnbGF6eSc7XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X190aXRsZSc7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gcHJvZHVjdC50aXRsZTtcblxuICAgICAgICBjb25zdCBkZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBkZXRhaWxzLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19kZXRhaWxzJztcbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgLy8gcHJvZHVjdHMuanNvbiBnaXZlcyB2YXJpYW50IHByaWNlcyBhcyBkZWNpbWFsIHN0cmluZ3MsIGUuZy4gXCIxOS45OVwiXG4gICAgICAgIGNvbnN0IHByaWNlcyA9IChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKVxuICAgICAgICAgICAgLm1hcCh2YXJpYW50ID0+IHBhcnNlRmxvYXQodmFyaWFudC5wcmljZSkpXG4gICAgICAgICAgICAuZmlsdGVyKHByaWNlID0+ICFOdW1iZXIuaXNOYU4ocHJpY2UpKTtcblxuICAgICAgICBpZiAocHJpY2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgbG93ZXN0UHJpY2UgPSBNYXRoLm1pbiguLi5wcmljZXMpO1xuXG4gICAgICAgICAgICBjb25zdCBwcmljZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHByaWNlLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19wcmljZSc7XG4gICAgICAgICAgICBwcmljZS50ZXh0Q29udGVudCA9IGBvbmx5ICR7dGhpcy5mb3JtYXRQcmljZShNYXRoLnJvdW5kKGxvd2VzdFByaWNlICogMTAwKSl9JHt0aGlzLmdldFByaWNlVW5pdChwcm9kdWN0LnByb2R1Y3RfdHlwZSl9YDtcbiAgICAgICAgICAgIGRldGFpbHMuYXBwZW5kQ2hpbGQocHJpY2UpO1xuXG4gICAgICAgICAgICBjb25zdCBycnBQcmljZSA9IHRoaXMuZ2V0UnJwUHJpY2UocHJvZHVjdCwgbG93ZXN0UHJpY2UpO1xuXG4gICAgICAgICAgICBpZiAocnJwUHJpY2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBycnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzJyk7XG4gICAgICAgICAgICAgICAgcnJwLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19ycnAnO1xuICAgICAgICAgICAgICAgIHJycC50ZXh0Q29udGVudCA9IGAke3JycFByaWNlLmxhYmVsfSAke3JycFByaWNlLmFtb3VudH1gO1xuICAgICAgICAgICAgICAgIGRldGFpbHMuYXBwZW5kQ2hpbGQocnJwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSB3aG9sZSBpdGVtIGlzIHRoZSBidXR0b24sIHNvIHRoaXMgb25seSBzaG93cyB0aGUgcGx1cy4gQSBidXR0b24gY2FuJ3QgY29udGFpbiBhbm90aGVyIGJ1dHRvblxuICAgICAgICBjb25zdCBwbHVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwbHVzLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19wbHVzJztcbiAgICAgICAgcGx1cy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgcGx1cy5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyLjVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMiA1VjE5TTUgMTJIMTlcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGl0ZW0udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpdGVtLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0JztcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgQWRkICR7cHJvZHVjdC50aXRsZX0gdG8gY29tcGFyaXNvbmApO1xuICAgICAgICBpdGVtLmFwcGVuZChpbWFnZSwgZGV0YWlscywgcGx1cyk7XG4gICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3QocHJvZHVjdC5oYW5kbGUsIHByb2R1Y3QucHJvZHVjdF90eXBlKTtcblxuICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIG9uIHNtYWxsZXIgc2NyZWVucyBzbyB0aGUgYWRkZWQgcHJvZHVjdCwgb3IgdGhlIGxpbWl0IHdhcm5pbmcsIGNhbiBiZSBzZWVuXG4gICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVRdWVyeT8ubWF0Y2hlcykgdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIHNob3dMaW1pdFJlYWNoZWQodHlwZSkge1xuICAgICAgICAvLyBUaGUgbW9kYWwgc2xpZGVzIGluIHdoZW4gb3BlbmVkIGZyb20gYSBjb21wYXJlIGJ1dHRvbiwgc28gd2FpdCBmb3IgaXQgYmVmb3JlIHNodWRkZXJpbmdcbiAgICAgICAgY29uc3Qgd2FzT3BlbiA9IHRoaXMubW9kYWxDb250YWluZXI/LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLm1vZGFsT3BlbkNsYXNzKTtcblxuICAgICAgICAvLyBTaG93IHRoZSB3YXJuaW5nIG9uIHRoZSB0eXBlIHRoYXQncyBmdWxsLCBldmVuIGlmIGl0IHdhcyBkaXNtaXNzZWQgYmVmb3JlXG4gICAgICAgIHRoaXMubGltaXRSZWFjaGVkVHlwZXMuYWRkKHR5cGUgfHwgJycpO1xuICAgICAgICB0aGlzLnNlbGVjdFR5cGUodHlwZSB8fCAnJyk7XG5cbiAgICAgICAgLy8gVGhlIHdhcm5pbmcgc2l0cyBvbiB0aGUgbW9kYWwsIHNvIGl0IHNob3dzIHdoZXRoZXIgb3Igbm90IHRoZSBhZGQgcHJvZHVjdCBwYW5lbCBpcyBvcGVuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNodWRkZXJUaW1lcik7XG4gICAgICAgIHRoaXMuc2h1ZGRlclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnNodWRkZXJMaW1pdFdhcm5pbmcoKSwgd2FzT3BlbiA/IDAgOiAzMDApO1xuICAgIH1cblxuICAgIHNodWRkZXJMaW1pdFdhcm5pbmcoKSB7XG4gICAgICAgIGNvbnN0IHdhcm5pbmcgPSB0aGlzLmxpbWl0V2FybmluZztcblxuICAgICAgICBpZiAoIXdhcm5pbmcgfHwgd2FybmluZy5oaWRkZW4pIHJldHVybjtcblxuICAgICAgICAvLyBSZXN0YXJ0IHRoZSBhbmltYXRpb24gaWYgaXQncyBhbHJlYWR5IHJ1bm5pbmdcbiAgICAgICAgd2FybmluZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zaHVkZGVyaW5nJyk7XG4gICAgICAgIHZvaWQgd2FybmluZy5vZmZzZXRXaWR0aDtcbiAgICAgICAgd2FybmluZy5jbGFzc0xpc3QuYWRkKCdpcy1zaHVkZGVyaW5nJyk7XG5cbiAgICAgICAgd2FybmluZy5hZGRFdmVudExpc3RlbmVyKCdhbmltYXRpb25lbmQnLCAoKSA9PiB3YXJuaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNodWRkZXJpbmcnKSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGlzQWRkUHJvZHVjdE9wZW4oKSB7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyPy5jbG9zZXN0KCcuY29tcGFyZS1tb2RhbCcpO1xuXG4gICAgICAgIHJldHVybiBCb29sZWFuKG1vZGFsKSAmJiAhbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdjb21wYXJlLW1vZGFsLS1hc2lkZS1jbG9zZWQnKTtcbiAgICB9XG5cbiAgICBzZXRBZGRQcm9kdWN0VmlzaWJsZShpc1Zpc2libGUsIHsgZm9jdXMgPSB0cnVlLCBhbmltYXRlID0gdHJ1ZSB9ID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLmFkZFByb2R1Y3RDb250YWluZXIpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMuYWRkUHJvZHVjdENvbnRhaW5lcjtcbiAgICAgICAgY29uc3QgbW9kYWwgPSBwYW5lbC5jbG9zZXN0KCcuY29tcGFyZS1tb2RhbCcpO1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmFkZFByb2R1Y3RUaW1lcik7XG5cbiAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgcGFuZWwuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICBtb2RhbD8uY2xhc3NMaXN0LnJlbW92ZSgnY29tcGFyZS1tb2RhbC0tbm8tYXNpZGUnKTtcblxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIGNsb3NlZCBwb3NpdGlvbiBmaXJzdCBzbyB0aGUgc2xpZGUgaW4gYW5pbWF0ZXNcbiAgICAgICAgICAgIHZvaWQgcGFuZWwub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBtb2RhbD8uY2xhc3NMaXN0LnJlbW92ZSgnY29tcGFyZS1tb2RhbC0tYXNpZGUtY2xvc2VkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2RhbD8uY2xhc3NMaXN0LmFkZCgnY29tcGFyZS1tb2RhbC0tYXNpZGUtY2xvc2VkJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZVBhbmVsID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgbW9kYWw/LmNsYXNzTGlzdC5hZGQoJ2NvbXBhcmUtbW9kYWwtLW5vLWFzaWRlJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBPbmNlIHRoZSBzbGlkZSBvdXQgaGFzIGZpbmlzaGVkLCByZW1vdmUgdGhlIHBhbmVsIGFuZCBpdHMgY29sdW1uXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkUHJvZHVjdFRpbWVyID0gc2V0VGltZW91dChyZW1vdmVQYW5lbCwgMzAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlUGFuZWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbikge1xuICAgICAgICAgICAgLy8gXCJNb3JlIHByb2R1Y3RzXCIgaXMgb25seSBuZWVkZWQgd2hpbGUgdGhlIHBhbmVsIGlzIGhpZGRlbiwgYW5kIHdoZW4gdGhlcmUncyBzb21ldGhpbmcgdG8gYWRkXG4gICAgICAgICAgICB0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbi5oaWRkZW4gPSBpc1Zpc2libGUgfHwgIXRoaXMuaGFzUHJvZHVjdHNUb0FkZDtcbiAgICAgICAgICAgIHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhpc1Zpc2libGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vdmUgZm9jdXMgdG8gdGhlIGNvbnRyb2wgdGhhdCdzIG5vdyB2aXNpYmxlXG4gICAgICAgIGlmICghZm9jdXMpIHJldHVybjtcblxuICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3RDbG9zZT8uZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uPy5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlTGltaXRXYXJuaW5nKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWRkUHJvZHVjdENvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgIGxldCB3YXJuaW5nID0gdGhpcy5saW1pdFdhcm5pbmc7XG5cbiAgICAgICAgaWYgKCF3YXJuaW5nKSB7XG4gICAgICAgICAgICB3YXJuaW5nID0gdGhpcy5saW1pdFdhcm5pbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHdhcm5pbmcuY2xhc3NOYW1lID0gJ2NvbXBhcmUtbW9kYWxfX2xpbWl0LXdhcm5pbmcnO1xuICAgICAgICAgICAgd2FybmluZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnc3RhdHVzJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX19saW1pdC13YXJuaW5nLS10ZXh0JztcbiAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBgWW91IGNhbiBjb21wYXJlIHVwIHRvICR7dGhpcy5tYXhQcm9kdWN0c30gcHJvZHVjdHMgb2YgdGhlIHNhbWUgdHlwZS4gUmVtb3ZlIGEgcHJvZHVjdCB0byBhZGQgYW5vdGhlci5gO1xuXG4gICAgICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2xvc2VCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2NvbXBhcmUtbW9kYWxfX2xpbWl0LXdhcm5pbmctLWNsb3NlJztcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdEaXNtaXNzIG1lc3NhZ2UnKTtcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTYgNmwxMiAxMk0xOCA2TDYgMThcIi8+XG4gICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICBgO1xuICAgICAgICAgICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW1pdFJlYWNoZWRUeXBlcy5kZWxldGUodGhpcy5hY3RpdmVUeXBlKTtcbiAgICAgICAgICAgICAgICB3YXJuaW5nLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2FybmluZy5hcHBlbmQobWVzc2FnZSwgY2xvc2VCdXR0b24pO1xuXG4gICAgICAgICAgICAvLyBVbmRlciB0aGUgbmF2IHJhdGhlciB0aGFuIGluIHRoZSBhZGQgcHJvZHVjdCBwYW5lbCwgc28gaXQncyB2aXNpYmxlIHdoaWxlIHRoZSBwYW5lbCBpcyBjbG9zZWRcbiAgICAgICAgICAgIGlmICh0aGlzLm5hdikge1xuICAgICAgICAgICAgICAgIHRoaXMubmF2LmFmdGVyKHdhcm5pbmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAodGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyLmNsb3Nlc3QoJy5jb21wYXJlLW1vZGFsJykgfHwgdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyKS5hcHBlbmRDaGlsZCh3YXJuaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRQcm9kdWN0cygpLmZpbHRlcigoeyB0eXBlID0gJycgfSkgPT4gdHlwZSA9PT0gdGhpcy5hY3RpdmVUeXBlKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGlzRnVsbCA9IGNvdW50ID49IHRoaXMubWF4UHJvZHVjdHM7XG5cbiAgICAgICAgLy8gT25jZSBhIHByb2R1Y3QgaXMgcmVtb3ZlZCB0aGVyZSdzIHJvb20gYWdhaW4sIHNvIHdhaXQgZm9yIHRoZSBuZXh0IGF0dGVtcHQgdG8gYWRkIGEgNXRoXG4gICAgICAgIGlmICghaXNGdWxsKSB0aGlzLmxpbWl0UmVhY2hlZFR5cGVzLmRlbGV0ZSh0aGlzLmFjdGl2ZVR5cGUpO1xuXG4gICAgICAgIC8vIE9ubHkgYWZ0ZXIgdHJ5aW5nIHRvIGFkZCBvbmUgbW9yZSB0aGFuIHRoZSBsaW1pdCwgbm90IGFzIHNvb24gYXMgdGhlIHR5cGUgaXMgZnVsbFxuICAgICAgICB3YXJuaW5nLmhpZGRlbiA9ICFpc0Z1bGwgfHwgIXRoaXMubGltaXRSZWFjaGVkVHlwZXMuaGFzKHRoaXMuYWN0aXZlVHlwZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyQWRkUHJvZHVjdHMoKSB7XG4gICAgICAgIGlmICghdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLmFkZFByb2R1Y3RDb250YWluZXIucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2FkZC1wcm9kdWN0LS1saXN0Jyk7XG5cbiAgICAgICAgaWYgKCFsaXN0KSB7XG4gICAgICAgICAgICBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBsaXN0LmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX19hZGQtcHJvZHVjdC0tbGlzdCc7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3RDb250YWluZXIuYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaXN0SWQgPSB0aGlzLmFkZFByb2R1Y3RzSWQgPSAodGhpcy5hZGRQcm9kdWN0c0lkIHx8IDApICsgMTtcbiAgICAgICAgY29uc3QgYWN0aXZlVHlwZSA9IHRoaXMuYWN0aXZlVHlwZTtcblxuICAgICAgICAvLyBQcm9kdWN0cyB3aXRob3V0IGEgdHlwZSAoXCJPdGhlclwiKSBjYW4ndCBiZSBsaXN0ZWQgYnkgdHlwZVxuICAgICAgICBpZiAoIWFjdGl2ZVR5cGUpIHtcbiAgICAgICAgICAgIGxpc3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgICAgICB0aGlzLnNldEhhc1Byb2R1Y3RzVG9BZGQoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSAodGhpcy5hZGRQcm9kdWN0U2VhcmNoPy52YWx1ZSB8fCAnJykudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5mZXRjaFByb2R1Y3RzQnlUeXBlKGFjdGl2ZVR5cGUsIHF1ZXJ5ID8gMjUwIDogMTApO1xuXG4gICAgICAgIC8vIFRoZSBzZWxlY3Rpb24sIHNlYXJjaCBvciBwcm9kdWN0cyBjaGFuZ2VkIHdoaWxlIHRoaXMgb25lIHdhcyBmZXRjaGluZ1xuICAgICAgICBpZiAobGlzdElkICE9PSB0aGlzLmFkZFByb2R1Y3RzSWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhZGRlZEhhbmRsZXMgPSBuZXcgU2V0KHRoaXMuZ2V0UHJvZHVjdHMoKS5tYXAoKHsgaGFuZGxlIH0pID0+IGhhbmRsZSkpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1zID0gcHJvZHVjdHNcbiAgICAgICAgICAgIC5maWx0ZXIocHJvZHVjdCA9PiB0aGlzLmdldFByb2R1Y3RJbWFnZShwcm9kdWN0KSAmJiAhYWRkZWRIYW5kbGVzLmhhcyhwcm9kdWN0LmhhbmRsZSkpXG4gICAgICAgICAgICAuZmlsdGVyKHByb2R1Y3QgPT4gIXF1ZXJ5IHx8IHByb2R1Y3QudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeSkpXG4gICAgICAgICAgICAubWFwKHByb2R1Y3QgPT4gdGhpcy5jcmVhdGVBZGRQcm9kdWN0SXRlbShwcm9kdWN0KSk7XG5cbiAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICAvLyBObyBtYXRjaGVzIG9ubHkgbWVhbnMgbm90aGluZyBmaXRzIHRoZSBzZWFyY2gsIHNvIGtlZXAgdGhlIHBhbmVsIG9wZW4gd2l0aCBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmICghaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX19hZGQtcHJvZHVjdC0tZW1wdHknO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSAnTm8gcHJvZHVjdHMgbWF0Y2ggeW91ciBzZWFyY2guJztcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaXN0LnJlcGxhY2VDaGlsZHJlbiguLi5pdGVtcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnJlcGxhY2VDaGlsZHJlbiguLi5pdGVtcyk7XG4gICAgICAgIHRoaXMuc2V0SGFzUHJvZHVjdHNUb0FkZChpdGVtcy5sZW5ndGggPiAwKTtcbiAgICB9XG5cbiAgICBzZXRIYXNQcm9kdWN0c1RvQWRkKGhhc1Byb2R1Y3RzKSB7XG4gICAgICAgIHRoaXMuaGFzUHJvZHVjdHNUb0FkZCA9IGhhc1Byb2R1Y3RzO1xuXG4gICAgICAgIC8vIE5vdGhpbmcgbGVmdCB0byBhZGQgZnJvbSB0aGlzIGNvbGxlY3Rpb24sIGUuZy4gaXRzIGxhc3QgcHJvZHVjdCB3YXMganVzdCBhZGRlZCBvclxuICAgICAgICAvLyB0aGUgc2VsZWN0ZWQgdHlwZSdzIGNvbGxlY3Rpb24gaGFzIG5vbmUsIHNvIGNsb3NlIHRoZSBwYW5lbCBpbnN0ZWFkIG9mIHNob3dpbmcgaXQgZW1wdHkuXG4gICAgICAgIC8vIE5vdCBmb2N1c2luZyBcIkFkZCBwcm9kdWN0c1wiLCBhcyBpdCdzIGhpZGRlbiB0b29cbiAgICAgICAgaWYgKCFoYXNQcm9kdWN0cyAmJiB0aGlzLmlzQWRkUHJvZHVjdE9wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSwgeyBmb2N1czogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tb3JlUHJvZHVjdHNCdXR0b24gJiYgIXRoaXMuaXNBZGRQcm9kdWN0T3BlbigpKSB7XG4gICAgICAgICAgICB0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbi5oaWRkZW4gPSAhaGFzUHJvZHVjdHM7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNvbnN0IGNvbXBhcmUgPSBuZXcgQ29tcGFyZSgpO1xubGV0IGNvbXBhcmlzb25QYWdlID0gbnVsbDtcblxuY29uc3QgY29tcGFyaXNvblBhZ2VBcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tcGFyaXNvbi1wYWdlLWFwcCcpO1xuXG5pZiAoY29tcGFyaXNvblBhZ2VBcHApIHtcbiAgICBjb25zdCBuYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCduYXYnKTtcbiAgICBuYXYuY2xhc3NOYW1lID0gJ2NvbXBhcmlzb24tcGFnZV9fbmF2JztcblxuICAgIGNvbnN0IGdyaWRzQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZ3JpZHNDb250YWluZXIuY2xhc3NOYW1lID0gJ2NvbXBhcmlzb24tcGFnZV9fZ3JpZHMnO1xuXG4gICAgY29tcGFyaXNvblBhZ2VBcHAuYXBwZW5kKG5hdiwgZ3JpZHNDb250YWluZXIpO1xuXG4gICAgY29tcGFyaXNvblBhZ2UgPSBuZXcgQ29tcGFyZSh7XG4gICAgICAgIG5hdixcbiAgICAgICAgZ3JpZHNDb250YWluZXIsXG4gICAgICAgIC8vIFdpdGhvdXQgYSBzaGFyZWQgbGluaywgc2hvdyB3aGF0J3MgYmVlbiBhZGRlZCB0byB0aGUgY29tcGFyZSB0YWJsZSBvbiB0aGlzIGRldmljZVxuICAgICAgICBwcm9kdWN0czogbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5oYXMoJ2NvbXBhcmUnKVxuICAgICAgICAgICAgPyBDb21wYXJlLmdldFVybFByb2R1Y3RzKClcbiAgICAgICAgICAgIDogY29tcGFyZS5nZXRTdG9yZWRQcm9kdWN0cygpLFxuICAgICAgICBlbXB0eU1lc3NhZ2U6ICdObyBwcm9kdWN0cyBhZGRlZCcsXG4gICAgfSk7XG59XG5cbmNsYXNzIENvbXBhcmVTaGFyZSB7XG4gICAgY29uc3RydWN0b3Ioc2hhcmVCdXR0b24sIHBvcHVwLCBnZXRQcm9kdWN0cykge1xuICAgICAgICB0aGlzLnNoYXJlQnV0dG9uID0gc2hhcmVCdXR0b247XG4gICAgICAgIHRoaXMucG9wdXAgPSBwb3B1cDtcbiAgICAgICAgdGhpcy5nZXRQcm9kdWN0cyA9IGdldFByb2R1Y3RzO1xuICAgICAgICB0aGlzLmNvcHlCdXR0b24gPSBwb3B1cC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zaGFyZT1cImNvcHlcIl0nKTtcbiAgICAgICAgdGhpcy5jb3B5TGFiZWwgPSB0aGlzLmNvcHlCdXR0b24/LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJpc29uLXNoYXJlX19sYWJlbCcpO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSAnVGFrZSBhIGxvb2sgYXQgdGhpcyBwcm9kdWN0IGNvbXBhcmlzb24nO1xuXG4gICAgICAgIHRoaXMuaGFuZGxlS2V5ZG93biA9IHRoaXMuaGFuZGxlS2V5ZG93bi5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHNoYXJlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyaXNvbi1zaGFyZV9fY2xvc2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xuICAgICAgICBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyaXNvbi1zaGFyZV9fYmFja2dyb3VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY29weUJ1dHRvbj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNvcHlMaW5rLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGdldFNoYXJlVXJsKCkge1xuICAgICAgICBjb25zdCByb290ID0gd2luZG93LlNob3BpZnk/LnJvdXRlcz8ucm9vdCB8fCAnLyc7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYCR7cm9vdH1wYWdlcy9jb21wYXJlYCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gdGhpcy5nZXRQcm9kdWN0cygpO1xuXG4gICAgICAgIGlmIChwcm9kdWN0cy5sZW5ndGgpIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdjb21wYXJlJywgSlNPTi5zdHJpbmdpZnkocHJvZHVjdHMpKTtcblxuICAgICAgICByZXR1cm4gdXJsLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlTGlua3MoKSB7XG4gICAgICAgIC8vIFRoZSBwcm9kdWN0cyBjaGFuZ2UgYXMgdGhleSdyZSBhZGRlZCBhbmQgcmVtb3ZlZCwgc28gYnVpbGQgdGhlIGxpbmtzIG9uIG9wZW5cbiAgICAgICAgY29uc3QgdXJsID0gdGhpcy5nZXRTaGFyZVVybCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7dGhpcy5tZXNzYWdlfTogJHt1cmx9YDtcblxuICAgICAgICBjb25zdCBsaW5rcyA9IHtcbiAgICAgICAgICAgIHdoYXRzYXBwOiBgaHR0cHM6Ly93YS5tZS8/dGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudCh0ZXh0KX1gLFxuICAgICAgICAgICAgZW1haWw6IGBtYWlsdG86P3N1YmplY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoJ1Byb2R1Y3QgY29tcGFyaXNvbicpfSZib2R5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWAsXG4gICAgICAgICAgICBzbXM6IGBzbXM6PyZib2R5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWAsXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmVudHJpZXMobGlua3MpLmZvckVhY2goKFt0eXBlLCBocmVmXSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGluayA9IHRoaXMucG9wdXAucXVlcnlTZWxlY3RvcihgW2RhdGEtc2hhcmU9XCIke3R5cGV9XCJdYCk7XG4gICAgICAgICAgICBpZiAobGluaykgbGluay5ocmVmID0gaHJlZjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaW5rcygpO1xuICAgICAgICB0aGlzLnBvcHVwLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duKTtcbiAgICAgICAgdGhpcy5wb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyaXNvbi1zaGFyZV9fY2xvc2UnKT8uZm9jdXMoKTtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5wb3B1cC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duKTtcbiAgICAgICAgdGhpcy5zaGFyZUJ1dHRvbi5mb2N1cygpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5TGluaygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvcHlMYWJlbCkgcmV0dXJuO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLmdldFNoYXJlVXJsKCkpO1xuICAgICAgICAgICAgdGhpcy5jb3B5TGFiZWwudGV4dENvbnRlbnQgPSAnTGluayBjb3BpZWQnO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5jb3B5TGFiZWwudGV4dENvbnRlbnQgPSAnVW5hYmxlIHRvIGNvcHknO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29weVRpbWVvdXQpO1xuICAgICAgICB0aGlzLmNvcHlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvcHlMYWJlbC50ZXh0Q29udGVudCA9ICdDb3B5IGxpbmsnO1xuICAgICAgICB9LCAyMDAwKTtcbiAgICB9XG59XG5cbmNvbnN0IGNvbXBhcmlzb25TaGFyZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJpc29uLXBhZ2VfX3NoYXJlJyk7XG5jb25zdCBjb21wYXJpc29uU2hhcmVQb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJpc29uLXNoYXJlJyk7XG5cbmlmIChjb21wYXJpc29uU2hhcmVCdXR0b24gJiYgY29tcGFyaXNvblNoYXJlUG9wdXApIHtcbiAgICBuZXcgQ29tcGFyZVNoYXJlKFxuICAgICAgICBjb21wYXJpc29uU2hhcmVCdXR0b24sXG4gICAgICAgIGNvbXBhcmlzb25TaGFyZVBvcHVwLFxuICAgICAgICAoKSA9PiAoY29tcGFyaXNvblBhZ2UgfHwgY29tcGFyZSkuZ2V0UHJvZHVjdHMoKVxuICAgICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUEsTUFBTSxPQUFPLENBQUM7SUFDZCxJQUFJLFdBQVcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFO0lBQzlCLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyx5QkFBeUI7SUFDbkQsUUFBUSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUM7SUFDNUIsUUFBUSxJQUFJLENBQUMsbUJBQW1CLEdBQUcseUJBQXlCO0lBQzVELFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxvQkFBb0I7SUFDbEQsUUFBUSxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUNwRixRQUFRLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDO0lBQ3ZHLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLFFBQVEs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
