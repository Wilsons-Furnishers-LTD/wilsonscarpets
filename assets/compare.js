(function () {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NjcmlwdHMvY29tcGFyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb21wYXJlIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlS2V5ID0gJ2NvbXBhcmVfcHJvZHVjdF9oYW5kbGVzJztcbiAgICAgICAgdGhpcy5tYXhQcm9kdWN0cyA9IDQ7XG4gICAgICAgIHRoaXMubW9kYWxDb250YWluZXJDbGFzcyA9ICdjb21wYXJlLW1vZGFsLWNvbnRhaW5lcic7XG4gICAgICAgIHRoaXMubW9kYWxPcGVuQ2xhc3MgPSAnY29tcGFyZS1tb2RhbC1vcGVuJztcbiAgICAgICAgdGhpcy5tb2RhbENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMubW9kYWxDb250YWluZXJDbGFzc31gKTtcbiAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lciA9IG9wdGlvbnMuZ3JpZHNDb250YWluZXIgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2dyaWRzJyk7XG4gICAgICAgIHRoaXMubmF2ID0gb3B0aW9ucy5uYXYgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX25hdicpO1xuICAgICAgICB0aGlzLnZpZXdGdWxsTGluayA9IG9wdGlvbnMucHJvZHVjdHMgPyBudWxsIDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX3ZpZXctZnVsbCcpO1xuICAgICAgICB0aGlzLmFkZFByb2R1Y3RDb250YWluZXIgPSBvcHRpb25zLnByb2R1Y3RzID8gbnVsbCA6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJlLW1vZGFsX19hZGQtcHJvZHVjdCcpO1xuICAgICAgICB0aGlzLnByb2R1Y3RzQnlUeXBlID0gbmV3IE1hcCgpO1xuICAgICAgICAvLyBUaGUgbGFiZWwgY29sdW1uIGlzIG5hcnJvd2VyIGJlbG93IDc2OXB4LCBzZWUgdGhlIGxhYmVsQ29sdW1uV2lkdGggZ2V0dGVyXG4gICAgICAgIHRoaXMuc21hbGxTY3JlZW5RdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA3NjhweCknKTtcbiAgICAgICAgLy8gVGhlIHByb2R1Y3QgY29sdW1ucyBhcmUgbmFycm93ZXIgYmVsb3cgNTAwcHgsIHNlZSB0aGUgcHJvZHVjdENvbHVtbldpZHRoIGdldHRlclxuICAgICAgICB0aGlzLmV4dHJhU21hbGxTY3JlZW5RdWVyeSA9IHdpbmRvdy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA0OTlweCknKTtcbiAgICAgICAgLy8gVHlwZXMgd2hlcmUgc29tZW9uZSB0cmllZCB0byBhZGQgYSBwcm9kdWN0IHBhc3QgdGhlIGxpbWl0LCB3aGljaCBzaG93cyB0aGUgbGltaXQgd2FybmluZ1xuICAgICAgICB0aGlzLmxpbWl0UmVhY2hlZFR5cGVzID0gbmV3IFNldCgpO1xuICAgICAgICAvLyBXaGVuIHNldCwgdGhlc2UgcHJvZHVjdHMgYXJlIHNob3duIGluc3RlYWQgb2YgdGhlIG9uZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICB0aGlzLnByb2R1Y3RzID0gb3B0aW9ucy5wcm9kdWN0cyB8fCBudWxsO1xuICAgICAgICB0aGlzLmVtcHR5TWVzc2FnZSA9IG9wdGlvbnMuZW1wdHlNZXNzYWdlIHx8IG51bGw7XG4gICAgICAgIHRoaXMuYWN0aXZlVHlwZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3BlY2lmaWNhdGlvbnMgPSBbJ1BpbGUgSGVpZ2h0JywgJ01hdGVyaWFsJywgJ1RPRyBSYXRpbmcnLCAnQmFja2luZycsICdTdHlsZSddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zTGFtaW5hdGUgPSBbJ1BhY2sgU2l6ZSAoTcKyKScsICdQbGFua3MgUGVyIFBhY2snLCAnUGxhbmsgU2l6ZScsICdPYWsgTGF5ZXInLCAnRmluaXNoJywgJ1N0eWxlJ107XG4gICAgICAgIHRoaXMuc3BlY2lmaWNhdGlvbnNWaW55bCA9IFsnVGhpY2tuZXNzJywgJ1dlYXIgTGF5ZXInLCAnQmFja2luZycsICdTdWl0YWJpbGl0eScsICdTdHlsZSddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zTFZUID0gWydUaGlja25lc3MnLCAnV2VhciBMYXllcicsICdQYWNrIFNpemUgKE3CsiknLCAnUGxhbmtzIFBlciBQYWNrJywgJ1BsYW5rIFNpemUnLCAnSW5zdGFsbGF0aW9uIFN5c3RlbScsICdTdHlsZScsICdVc2FnZSBDbGFzcyddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zUmVhbFdvb2QgPSBbJ1RoaWNrbmVzcycsICdQYWNrIFNpemUgKE3CsiknLCAnUGxhbmtzIFBlciBQYWNrJywgJ1BsYW5rIFNpemUnLCAnT2FrIExheWVyJywgJ0ZpbmlzaCcsICdTdHlsZSddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zQWNjZXNzb3JpZXMgPSBbJ1RPRyBSYXRpbmcnLCAnUGFjayBTaXplIChNwrIpJywgJ0RlbnNpdHknLCAnSW1wYWN0IHNvdW5kIHJlZHVjdGlvbicsICdNYXRlcmlhbCcsICdTdHlsZScsICdEb29yIEJhciBMZW5ndGgnXTtcbiAgICAgICAgdGhpcy5zcGVjaWZpY2F0aW9uc1J1Z3MgPSBbJ01hdGVyaWFsJywgJ1BpbGUgSGVpZ2h0JywgJ1N0eWxlJywgJ0Rvb3IgQmFyIExlbmd0aCddO1xuICAgICAgICB0aGlzLnNwZWNpZmljYXRpb25zQXJ0aWZpY2lhbEdyYXNzID0gWydQaWxlIEhlaWdodCcsICdNYXRlcmlhbCcsICdQaWxlIFdlaWdodCcsICdUb3RhbCBXZWlnaHQnLCAnU3R5bGUnLCAnRHJhaW5hZ2UgSG9sZXMnXTtcblxuICAgICAgICBpZiAoIXRoaXMucHJvZHVjdHMpIHRoaXMuYmluZE1vZGFsRXZlbnRzKCk7XG5cbiAgICAgICAgLy8gUmVzaXplIHRoZSBjb2x1bW5zIG9mIHRoZSB0YWJsZXMgYWxyZWFkeSBzaG93biB3aGVuIGNyb3NzaW5nIDc2OXB4IG9yIDUwMHB4XG4gICAgICAgIGNvbnN0IHJlc2l6ZUNvbHVtbnMgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZ3JpZHNDb250YWluZXIpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lclxuICAgICAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKCcuY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkOm5vdCguY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkLS1lbXB0eSknKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGdyaWQgPT4gdGhpcy5zZXRHcmlkQ29sdW1ucyhncmlkKSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUdyaWRXaWR0aHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNtYWxsU2NyZWVuUXVlcnkuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgcmVzaXplQ29sdW1ucyk7XG4gICAgICAgIHRoaXMuZXh0cmFTbWFsbFNjcmVlblF1ZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHJlc2l6ZUNvbHVtbnMpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyTmF2KCk7XG4gICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgIH1cblxuICAgIGJpbmRNb2RhbEV2ZW50cygpIHtcbiAgICAgICAgLy8gRml4ZWQgYnV0dG9uIHRvIHJlb3BlbiB0aGUgbW9kYWwsIHNob3duIG9uY2UgYSBwcm9kdWN0IGhhcyBiZWVuIGFkZGVkXG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJlLW9wZW4tYnV0dG9uJyk7XG4gICAgICAgIHRoaXMub3BlbkJ1dHRvbj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wZW5Nb2RhbCgpKTtcblxuICAgICAgICBsZXQgY29tcGFyZUJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29tcGFyZS1idXR0b24nKVxuICAgICAgICBsZXQgdGhhdCA9IHRoaXNcbiAgICAgICAgY29tcGFyZUJ1dHRvbnMuZm9yRWFjaChjb21wYXJlQnV0dG9uID0+IHtcbiAgICAgICAgICAgIGNvbXBhcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoYXQuaGFuZGxlQ29tcGFyZUNsaWNrKGNvbXBhcmVCdXR0b24pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2xlYXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXItcHJvZHVjdC1pZHMnKTtcbiAgICAgICAgaWYgKGNsZWFyQnV0dG9uKSB7XG4gICAgICAgICAgICBjbGVhckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xlYXJQcm9kdWN0cy5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3NlLWNvbXBhcmUtbW9kYWwnKTtcbiAgICAgICAgaWYgKGNsb3NlQnV0dG9uKSB7XG4gICAgICAgICAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xvc2VNb2RhbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1vZGFsQmFja2dyb3VuZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJlLW1vZGFsLWJhY2tncm91bmQnKTtcbiAgICAgICAgaWYgKG1vZGFsQmFja2dyb3VuZCkge1xuICAgICAgICAgICAgbW9kYWxCYWNrZ3JvdW5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbG9zZU1vZGFsLmJpbmQodGhpcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iaW5kSGVhZGVyQWN0aW9ucygpO1xuXG4gICAgICAgIHRoaXMuYWRkUHJvZHVjdENsb3NlID0gdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyPy5xdWVyeVNlbGVjdG9yKCcuY29tcGFyZS1tb2RhbF9fYWRkLXByb2R1Y3QtLWNsb3NlJyk7XG4gICAgICAgIHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX21vcmUtcHJvZHVjdHMnKTtcblxuICAgICAgICBpZiAodGhpcy5hZGRQcm9kdWN0Q2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUHJvZHVjdENsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uKSB7XG4gICAgICAgICAgICB0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHRoaXMuc2V0QWRkUHJvZHVjdFZpc2libGUodHJ1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlsdGVycyB0aGUgYWRkIHByb2R1Y3QgbGlzdCBieSB0aXRsZSwgd2FpdGluZyBmb3IgYSBwYXVzZSBpbiB0eXBpbmdcbiAgICAgICAgdGhpcy5hZGRQcm9kdWN0U2VhcmNoID0gdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyPy5xdWVyeVNlbGVjdG9yKCcjY29tcGFyZS1hZGQtcHJvZHVjdC1zZWFyY2gnKTtcbiAgICAgICAgdGhpcy5hZGRQcm9kdWN0U2VhcmNoPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmFkZFByb2R1Y3RTZWFyY2hUaW1lcik7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3RTZWFyY2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZW5kZXJBZGRQcm9kdWN0cygpLCAyNTApO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBVbmRlciA5MDBweCB0aGUgYWRkIHByb2R1Y3QgcGFuZWwgaXMgYSBwb3B1cC4gQ2xvc2VkIGJ5IGRlZmF1bHQgYXQgYWxsIHNpemVzLCBvcGVuZWQgd2l0aCBcIkFkZCBwcm9kdWN0c1wiXG4gICAgICAgIHRoaXMubW9iaWxlUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1heC13aWR0aDogODk5cHgpJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWRkUHJvZHVjdENvbnRhaW5lcikge1xuICAgICAgICAgICAgY29uc3QgYXBwbHlMYXlvdXQgPSAoKSA9PiB0aGlzLnNldEFkZFByb2R1Y3RWaXNpYmxlKGZhbHNlLCB7IGZvY3VzOiBmYWxzZSwgYW5pbWF0ZTogZmFsc2UgfSk7XG5cbiAgICAgICAgICAgIC8vIFJ1bnMgb24gbG9hZCBhbmQgd2hlbmV2ZXIgdGhlIHZpZXdwb3J0IGNyb3NzZXMgOTAwcHhcbiAgICAgICAgICAgIGFwcGx5TGF5b3V0KCk7XG4gICAgICAgICAgICB0aGlzLm1vYmlsZVF1ZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFwcGx5TGF5b3V0KTtcblxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2FkZC1wcm9kdWN0LWJhY2tkcm9wJylcbiAgICAgICAgICAgICAgICA/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSkpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnICYmIHRoaXMubW9iaWxlUXVlcnkubWF0Y2hlcyAmJiB0aGlzLmlzQWRkUHJvZHVjdE9wZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFkZFByb2R1Y3RWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJlbG93IDc2OXB4IFwiQWRkIHByb2R1Y3RzXCIgYW5kIFwiU2hhcmVcIiBtb3ZlIG91dCBvZiB0aGUgaGVhZGVyIGludG8gdGhlaXIgb3duIHJvdy5cbiAgICAvLyBNb3ZpbmcgdGhlIGVsZW1lbnRzIGtlZXBzIHRoZWlyIGV2ZW50IGxpc3RlbmVyc1xuICAgIGJpbmRIZWFkZXJBY3Rpb25zKCkge1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2FjdGlvbnMnKTtcbiAgICAgICAgY29uc3QgaGVhZGVyQ29sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2hlYWRlci0tY29sJyk7XG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyZS1tb2RhbF9fbW9yZS1wcm9kdWN0cy13cmFwcGVyJyksXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyZS1tb2RhbF9faGVhZGVyIC5jb21wYXJpc29uLXBhZ2VfX3NoYXJlJyksXG4gICAgICAgIF0uZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgICAgIGlmICghYWN0aW9ucyB8fCAhaGVhZGVyQ29sIHx8ICFidXR0b25zLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNtYWxsUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1heC13aWR0aDogNzY4cHgpJyk7XG4gICAgICAgIGNvbnN0IHBsYWNlQnV0dG9ucyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChzbWFsbFF1ZXJ5Lm1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLmFwcGVuZCguLi5idXR0b25zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyQ29sLmJlZm9yZSguLi5idXR0b25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBwbGFjZUJ1dHRvbnMoKTtcbiAgICAgICAgc21hbGxRdWVyeS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBwbGFjZUJ1dHRvbnMpO1xuICAgIH1cblxuICAgIGNsZWFyUHJvZHVjdHMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLnN0b3JhZ2VLZXkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gY2xlYXIgY29tcGFyZSBwcm9kdWN0cycsIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyTmF2KCk7XG4gICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgICAgICB0aGlzLmNsb3NlTW9kYWwoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDb3VudCgpIHtcbiAgICAgICAgY29uc3QgY291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbXBhcmUtY291bnQnKTtcblxuICAgICAgICBpZiAoIWNvdW50RWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRQcm9kdWN0cygpXG4gICAgICAgICAgICAuZmlsdGVyKCh7IHR5cGUgPSAnJyB9KSA9PiB0eXBlID09PSB0aGlzLmFjdGl2ZVR5cGUpXG4gICAgICAgICAgICAubGVuZ3RoO1xuXG4gICAgICAgIGNvbnN0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBpbm5lci5jbGFzc05hbWUgPSAnY29tcGFyZS1jb3VudF9faW5uZXInO1xuICAgICAgICBpbm5lci50ZXh0Q29udGVudCA9IGAke2NvdW50fS8ke3RoaXMubWF4UHJvZHVjdHN9YDtcbiAgICAgICAgY291bnRFbGVtZW50LnJlcGxhY2VDaGlsZHJlbihpbm5lcik7XG4gICAgfVxuXG4gICAgZ2V0UHJvZHVjdFR5cGVzKCkge1xuICAgICAgICByZXR1cm4gWy4uLm5ldyBTZXQodGhpcy5nZXRQcm9kdWN0cygpLm1hcCgoeyB0eXBlID0gJycgfSkgPT4gdHlwZSkpXTtcbiAgICB9XG5cbiAgICBnZXRUeXBlcygpIHtcbiAgICAgICAgLy8gT25seSB0eXBlcyB0aGF0IGhhdmUgcHJvZHVjdHMgYXJlIHNob3duIGluIHRoZSBuYXZcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvZHVjdFR5cGVzKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyTmF2KCkge1xuICAgICAgICBjb25zdCB0eXBlcyA9IHRoaXMuZ2V0VHlwZXMoKTtcblxuICAgICAgICBpZiAoIXR5cGVzLmluY2x1ZGVzKHRoaXMuYWN0aXZlVHlwZSkpIHRoaXMuYWN0aXZlVHlwZSA9IHR5cGVzWzBdID8/IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMubmF2KSB7XG4gICAgICAgICAgICBjb25zdCBsaW5rcyA9IHR5cGVzLm1hcCh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgICAgICAgICAgICBsaW5rLmRhdGFzZXQudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICAgICAgbGluay50ZXh0Q29udGVudCA9IHR5cGUgfHwgJ090aGVyJztcbiAgICAgICAgICAgICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFR5cGUodHlwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbGluaztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm5hdi5yZXBsYWNlQ2hpbGRyZW4oLi4ubGlua3MpO1xuICAgICAgICAgICAgLy8gTm90aGluZyB0byBzd2l0Y2ggYmV0d2VlbiB3aXRoIGEgc2luZ2xlIHR5cGVcbiAgICAgICAgICAgIHRoaXMubmF2LmhpZGRlbiA9IHR5cGVzLmxlbmd0aCA8IDI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXdGdWxsTGluaygpO1xuICAgICAgICB0aGlzLnVwZGF0ZU9wZW5CdXR0b24oKTtcbiAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVUeXBlKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlT3BlbkJ1dHRvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wZW5CdXR0b24pIHJldHVybjtcblxuICAgICAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0UHJvZHVjdHMoKS5sZW5ndGg7XG5cbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLmhpZGRlbiA9ICFjb3VudDtcbiAgICAgICAgdGhpcy5vcGVuQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBDb21wYXJlIHByb2R1Y3RzICgke2NvdW50fSlgKTtcblxuICAgICAgICBjb25zdCBjb3VudEVsZW1lbnQgPSB0aGlzLm9wZW5CdXR0b24ucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtb3Blbi1idXR0b25fX2NvdW50Jyk7XG4gICAgICAgIGlmIChjb3VudEVsZW1lbnQpIGNvdW50RWxlbWVudC50ZXh0Q29udGVudCA9IGNvdW50O1xuXG4gICAgfVxuXG4gICAgdXBkYXRlVmlld0Z1bGxMaW5rKCkge1xuICAgICAgICBpZiAoIXRoaXMudmlld0Z1bGxMaW5rKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLnZpZXdGdWxsTGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gdGhpcy5nZXRQcm9kdWN0cygpO1xuXG4gICAgICAgIGlmIChwcm9kdWN0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdjb21wYXJlJywgSlNPTi5zdHJpbmdpZnkocHJvZHVjdHMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKCdjb21wYXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZXdGdWxsTGluay5ocmVmID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgICB9XG5cbiAgICBzZWxlY3RUeXBlKHR5cGUpIHtcbiAgICAgICAgLy8gQSBzZWFyY2ggaXMgZm9yIG9uZSBjb2xsZWN0aW9uLCBzbyBzdGFydCB0aGUgbmV4dCB0eXBlIHdpdGggaXRzIGZ1bGwgbGlzdFxuICAgICAgICBpZiAodGhpcy5hZGRQcm9kdWN0U2VhcmNoICYmIHR5cGUgIT09IHRoaXMuYWN0aXZlVHlwZSkgdGhpcy5hZGRQcm9kdWN0U2VhcmNoLnZhbHVlID0gJyc7XG5cbiAgICAgICAgdGhpcy5hY3RpdmVUeXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVUeXBlKCk7XG4gICAgICAgIHRoaXMucmVuZGVyQWRkUHJvZHVjdHMoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVBY3RpdmVUeXBlKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUNvdW50KCk7XG4gICAgICAgIHRoaXMudXBkYXRlTGltaXRXYXJuaW5nKCk7XG5cbiAgICAgICAgaWYgKHRoaXMubmF2KSB7XG4gICAgICAgICAgICB0aGlzLm5hdi5xdWVyeVNlbGVjdG9yQWxsKCdhJykuZm9yRWFjaChsaW5rID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0FjdGl2ZSA9IGxpbmsuZGF0YXNldC50eXBlID09PSB0aGlzLmFjdGl2ZVR5cGU7XG5cbiAgICAgICAgICAgICAgICBsaW5rLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGlzQWN0aXZlKTtcblxuICAgICAgICAgICAgICAgIGlmIChpc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50JywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsaW5rLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1jdXJyZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkc0NvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkJykuZm9yRWFjaChncmlkID0+IHtcbiAgICAgICAgICAgICAgICBncmlkLmhpZGRlbiA9IGdyaWQuZGF0YXNldC50eXBlICE9PSB0aGlzLmFjdGl2ZVR5cGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNvbXBhcmVDbGljayhidXR0b24pIHtcbiAgICAgICAgY29uc3QgeyBoYW5kbGUsIHR5cGUsIHZhcmlhbnRJZCB9ID0gYnV0dG9uLmRhdGFzZXQ7XG5cbiAgICAgICAgdGhpcy5hZGRQcm9kdWN0KGhhbmRsZSwgdHlwZSwgdmFyaWFudElkID8gTnVtYmVyKHZhcmlhbnRJZCkgOiBudWxsKTtcbiAgICAgICAgdGhpcy5vcGVuTW9kYWwoKTtcbiAgICB9XG5cbiAgICBvcGVuTW9kYWwoKSB7XG4gICAgICAgIGlmICghdGhpcy5tb2RhbENvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubW9kYWxDb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLm1vZGFsT3BlbkNsYXNzKTtcbiAgICAgICAgLy8gU3RvcHMgdGhlIHBhZ2UgYmVoaW5kIHRoZSBtb2RhbCBmcm9tIHNjcm9sbGluZy4gU2V0IG9uIDxodG1sPiwgYXMgdGhhdCdzIHdoYXQgc2Nyb2xscyB0aGUgcGFnZVxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY29tcGFyZS1tb2RhbC1pcy1vcGVuJyk7XG4gICAgfVxuXG4gICAgY2xvc2VNb2RhbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vZGFsQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5tb2RhbENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMubW9kYWxPcGVuQ2xhc3MpO1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY29tcGFyZS1tb2RhbC1pcy1vcGVuJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIHBhcnNlUHJvZHVjdHMoanNvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2R1Y3RzKSkgcmV0dXJuIFtdO1xuXG4gICAgICAgICAgICAvLyBTa2lwIGVudHJpZXMgc2F2ZWQgaW4gdGhlIG9sZCBwbGFpbi1oYW5kbGUgZm9ybWF0XG4gICAgICAgICAgICByZXR1cm4gcHJvZHVjdHMuZmlsdGVyKHByb2R1Y3QgPT4gcHJvZHVjdCAmJiB0eXBlb2YgcHJvZHVjdC5oYW5kbGUgPT09ICdzdHJpbmcnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnZXRVcmxQcm9kdWN0cygpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgICAgICByZXR1cm4gQ29tcGFyZS5wYXJzZVByb2R1Y3RzKHBhcmFtcy5nZXQoJ2NvbXBhcmUnKSk7XG4gICAgfVxuXG4gICAgZ2V0U3RvcmVkUHJvZHVjdHMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gQ29tcGFyZS5wYXJzZVByb2R1Y3RzKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuc3RvcmFnZUtleSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0UHJvZHVjdHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2R1Y3RzIHx8IHRoaXMuZ2V0U3RvcmVkUHJvZHVjdHMoKTtcbiAgICB9XG5cbiAgICAvLyBJZGVudGlmaWVzIGFuIGVudHJ5LCBzbyBkaWZmZXJlbnQgdmFyaWFudHMgb2YgdGhlIHNhbWUgcHJvZHVjdCBjYW4gYmUgY29tcGFyZWRcbiAgICBzdGF0aWMgZ2V0RW50cnlLZXkoeyBoYW5kbGUsIHZhcmlhbnQgPSBudWxsIH0pIHtcbiAgICAgICAgcmV0dXJuIHZhcmlhbnQgPyBgJHtoYW5kbGV9OiR7dmFyaWFudH1gIDogaGFuZGxlO1xuICAgIH1cblxuICAgIGFkZFByb2R1Y3QoaGFuZGxlLCB0eXBlLCB2YXJpYW50SWQgPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gdGhpcy5nZXRTdG9yZWRQcm9kdWN0cygpO1xuICAgICAgICBjb25zdCBrZXkgPSBDb21wYXJlLmdldEVudHJ5S2V5KHsgaGFuZGxlLCB2YXJpYW50OiB2YXJpYW50SWQgfSk7XG5cbiAgICAgICAgaWYgKHByb2R1Y3RzLnNvbWUocHJvZHVjdCA9PiBDb21wYXJlLmdldEVudHJ5S2V5KHByb2R1Y3QpID09PSBrZXkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY29uc3Qgc2FtZVR5cGVDb3VudCA9IHByb2R1Y3RzLmZpbHRlcihwcm9kdWN0ID0+IChwcm9kdWN0LnR5cGUgfHwgJycpID09PSAodHlwZSB8fCAnJykpLmxlbmd0aDtcbiAgICAgICAgaWYgKHNhbWVUeXBlQ291bnQgPj0gdGhpcy5tYXhQcm9kdWN0cykge1xuICAgICAgICAgICAgdGhpcy5zaG93TGltaXRSZWFjaGVkKHR5cGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnV0dG9ucyBvbiB0aGUgcHJvZHVjdCBwYWdlIGFyZSBwZXIgY29sb3VyLCBzbyBzYXZlIHdoaWNoIHZhcmlhbnQgd2FzIHBpY2tlZFxuICAgICAgICBwcm9kdWN0cy5wdXNoKHZhcmlhbnRJZCA/IHsgdHlwZSwgaGFuZGxlLCB2YXJpYW50OiB2YXJpYW50SWQgfSA6IHsgdHlwZSwgaGFuZGxlIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHByb2R1Y3RzKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1VuYWJsZSB0byBzYXZlIGNvbXBhcmUgcHJvZHVjdHMnLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGl2ZVR5cGUgPSB0eXBlO1xuICAgICAgICAvLyBTY3JvbGxlZCBpbnRvIHZpZXcgb25jZSB0aGUgZ3JpZCBoYXMgYmVlbiByZWJ1aWx0XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9LZXkgPSBrZXk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVVcmwocHJvZHVjdHMpO1xuICAgICAgICB0aGlzLnJlbmRlck5hdigpO1xuICAgICAgICB0aGlzLnJlbmRlckdyaWQoKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB1cGRhdGVVcmwocHJvZHVjdHMpIHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgICAgaWYgKHByb2R1Y3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoJ2NvbXBhcmUnLCBKU09OLnN0cmluZ2lmeShwcm9kdWN0cykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUoJ2NvbXBhcmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh3aW5kb3cuaGlzdG9yeS5zdGF0ZSwgJycsIHVybCk7XG4gICAgfVxuXG4gICAgcmVtb3ZlUHJvZHVjdChrZXkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvZHVjdHMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvZHVjdHMgPSB0aGlzLnByb2R1Y3RzLmZpbHRlcihwcm9kdWN0ID0+IENvbXBhcmUuZ2V0RW50cnlLZXkocHJvZHVjdCkgIT09IGtleSk7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlVXJsKHRoaXMucHJvZHVjdHMpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJOYXYoKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvZHVjdHMgPSB0aGlzLmdldFN0b3JlZFByb2R1Y3RzKCkuZmlsdGVyKHByb2R1Y3QgPT4gQ29tcGFyZS5nZXRFbnRyeUtleShwcm9kdWN0KSAhPT0ga2V5KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5zdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwcm9kdWN0cykpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gcmVtb3ZlIGNvbXBhcmUgcHJvZHVjdCcsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyTmF2KCk7XG4gICAgICAgIHRoaXMucmVuZGVyR3JpZCgpO1xuICAgIH1cblxuICAgIGFzeW5jIGZldGNoUHJvZHVjdChoYW5kbGUpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IHdpbmRvdy5TaG9waWZ5Py5yb3V0ZXM/LnJvb3QgfHwgJy8nO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyB0ZW1wbGF0ZXMvcHJvZHVjdC5jb21wYXJlLmxpcXVpZDogdGhlIHByb2R1Y3RzL3toYW5kbGV9LmpzIGRhdGEgcGx1cyB0aGUgSnVubyBtZXRhZmllbGRzXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3Jvb3R9cHJvZHVjdHMvJHtoYW5kbGV9P3ZpZXc9Y29tcGFyZWApO1xuXG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgICAgICAgICBjb25zdCB7IHByb2R1Y3QsIG1ldGFmaWVsZHM6IHsgdmFyaWFudHM6IHZhcmlhbnRNZXRhZmllbGRzID0gW10sIC4uLm1ldGFmaWVsZHMgfSB9ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgbWV0YWZpZWxkc0J5VmFyaWFudElkID0gbmV3IE1hcCh2YXJpYW50TWV0YWZpZWxkcy5tYXAoKHsgaWQsIC4uLmZpZWxkcyB9KSA9PiBbaWQsIGZpZWxkc10pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5wcm9kdWN0LFxuICAgICAgICAgICAgICAgIG1ldGFmaWVsZHMsXG4gICAgICAgICAgICAgICAgdmFyaWFudHM6IChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKS5tYXAodmFyaWFudCA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi52YXJpYW50LFxuICAgICAgICAgICAgICAgICAgICBtZXRhZmllbGRzOiBtZXRhZmllbGRzQnlWYXJpYW50SWQuZ2V0KHZhcmlhbnQuaWQpIHx8IHt9LFxuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBsb2FkIHByb2R1Y3QgJHtoYW5kbGV9YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgdmFyaWFudCBzYXZlZCB3aGVuIGl0IHdhcyBhZGRlZCBmcm9tIHRoZSBwcm9kdWN0IHBhZ2UuIENvbGxlY3Rpb24gYW5kIHJlbGF0ZWQgcHJvZHVjdFxuICAgIC8vIGNvbXBhcmUgYnV0dG9ucyBhZGQgdGhlIHdob2xlIHByb2R1Y3QsIHNvIGhhdmUgbm8gdmFyaWFudCBhbmQgc2hvdyB0aGUgcHJvZHVjdCdzIG93biBkZXRhaWxzXG4gICAgZ2V0U2VsZWN0ZWRWYXJpYW50KHByb2R1Y3QsIHZhcmlhbnRJZCkge1xuICAgICAgICBpZiAoIXZhcmlhbnRJZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKS5maW5kKHZhcmlhbnQgPT4gdmFyaWFudC5pZCA9PT0gdmFyaWFudElkKSB8fCBudWxsO1xuICAgIH1cblxuICAgIC8vIFRoZSB2YXJpYW50J3Mgb3B0aW9uIHZhbHVlcyB3aXRob3V0IHRoZSBzaXplLCBlLmcuIFwiR3JleSAvIDRtXCIgLT4gXCJHcmV5XCJcbiAgICBnZXRWYXJpYW50TmFtZShwcm9kdWN0LCB2YXJpYW50KSB7XG4gICAgICAgIGlmICghdmFyaWFudCkgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIFByb2R1Y3RzIHdpdGhvdXQgb3B0aW9ucyBoYXZlIGEgc2luZ2xlIFwiRGVmYXVsdCBUaXRsZVwiIHZhcmlhbnRcbiAgICAgICAgaWYgKHZhcmlhbnQudGl0bGUgPT09ICdEZWZhdWx0IFRpdGxlJykgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIHByb2R1Y3RzL3toYW5kbGV9LmpzIGdpdmVzIG9wdGlvbnMgYXMgb2JqZWN0cywgdGhlIExpcXVpZCBqc29uIGZpbHRlciBtYXkgZ2l2ZSBwbGFpbiBuYW1lc1xuICAgICAgICBjb25zdCBvcHRpb25OYW1lcyA9IChwcm9kdWN0Lm9wdGlvbnMgfHwgW10pLm1hcChvcHRpb24gPT4gKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnID8gb3B0aW9uIDogb3B0aW9uLm5hbWUpIHx8ICcnKTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gdmFyaWFudC5vcHRpb25zIHx8IFt2YXJpYW50Lm9wdGlvbjEsIHZhcmlhbnQub3B0aW9uMiwgdmFyaWFudC5vcHRpb24zXS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlc1xuICAgICAgICAgICAgLmZpbHRlcigodmFsdWUsIGluZGV4KSA9PiAhdGhpcy5pc1NpemVPcHRpb24ob3B0aW9uTmFtZXNbaW5kZXhdKSlcbiAgICAgICAgICAgIC5qb2luKCcgLyAnKTtcbiAgICB9XG5cbiAgICAvLyBNYXRjaGVzIHRoZSBvcHRpb24gbmFtZXMgc25pcHBldHMvcHJvZHVjdC1kZXRhaWxzLmxpcXVpZCB0cmVhdHMgYXMgc2l6ZXNcbiAgICBpc1NpemVPcHRpb24obmFtZSA9ICcnKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbk5hbWUgPSBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIHJldHVybiBvcHRpb25OYW1lID09PSAnd2lkdGgnIHx8IG9wdGlvbk5hbWUuaW5jbHVkZXMoJ3NpemUnKTtcbiAgICB9XG5cbiAgICAvLyBGcm9tIHRoZSB2YXJpYW50J3MgSnVubyBpc19pbl9zdG9jayBtZXRhZmllbGQgKHRlbXBsYXRlcy9wcm9kdWN0LmNvbXBhcmUubGlxdWlkKVxuICAgIGdldFN0b2NrU3RhdHVzKHZhcmlhbnQpIHtcbiAgICAgICAgY29uc3QgaW5TdG9jayA9IHZhcmlhbnQ/Lm1ldGFmaWVsZHM/LmlzX2luX3N0b2NrO1xuXG4gICAgICAgIGlmIChpblN0b2NrID09PSAnMScpIHtcbiAgICAgICAgICAgIHJldHVybiAnSW4gc3RvY2snO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnT3V0IG9mIHN0b2NrJztcbiAgICB9XG5cbiAgICAvLyBUaGUgc2VsZWN0ZWQgdmFyaWFudCdzIHN0b2NrLCBvciBmb3IgYSB3aG9sZSBwcm9kdWN0LCBpbiBzdG9jayBpZiBhbnkgb2YgaXRzIHZhcmlhbnRzIGFyZVxuICAgIGdldFByb2R1Y3RTdG9ja1N0YXR1cyhwcm9kdWN0KSB7XG4gICAgICAgIGlmIChwcm9kdWN0LnNlbGVjdGVkVmFyaWFudCkgcmV0dXJuIHRoaXMuZ2V0U3RvY2tTdGF0dXMocHJvZHVjdC5zZWxlY3RlZFZhcmlhbnQpO1xuXG4gICAgICAgIGNvbnN0IGFueUluU3RvY2sgPSAocHJvZHVjdC52YXJpYW50cyB8fCBbXSkuc29tZSh2YXJpYW50ID0+IHRoaXMuZ2V0U3RvY2tTdGF0dXModmFyaWFudCkgPT09ICdJbiBzdG9jaycpO1xuXG4gICAgICAgIHJldHVybiBhbnlJblN0b2NrID8gJ0luIHN0b2NrJyA6ICdPdXQgb2Ygc3RvY2snO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0b2NrVmFsdWUocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSB0aGlzLmdldFByb2R1Y3RTdG9ja1N0YXR1cyhwcm9kdWN0KTtcblxuICAgICAgICBpZiAoc3RhdHVzID09PSAnLScpIHJldHVybiBzdGF0dXM7XG5cbiAgICAgICAgY29uc3Qgc3RvY2tMZXZlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgc3RvY2tMZXZlbC5pZCA9ICdzdG9ja0xldmVsJztcbiAgICAgICAgc3RvY2tMZXZlbC5jbGFzc05hbWUgPSBzdGF0dXMgPT09ICdJbiBzdG9jaycgPyAnaW5zdG9jaycgOiAnb3V0b2ZzdG9jayc7XG4gICAgICAgIHN0b2NrTGV2ZWwudGV4dENvbnRlbnQgPSBzdGF0dXM7XG5cbiAgICAgICAgY29uc3QgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcbiAgICAgICAgaWNvbi5jbGFzc05hbWUgPSBzdGF0dXMgPT09ICdJbiBzdG9jaycgPyAnaWNvbi1pbnN0b2NrJyA6ICdpY29uLW91dG9mc3RvY2snO1xuICAgICAgICBzdG9ja0xldmVsLnByZXBlbmQoaWNvbiwgJyAnKTtcblxuICAgICAgICByZXR1cm4gc3RvY2tMZXZlbDtcbiAgICB9XG5cbiAgICBnZXRQcm9kdWN0VXJsKHByb2R1Y3QpIHtcbiAgICAgICAgY29uc3Qgcm9vdCA9IHdpbmRvdy5TaG9waWZ5Py5yb3V0ZXM/LnJvb3QgfHwgJy8nO1xuXG4gICAgICAgIHJldHVybiBwcm9kdWN0LnVybCB8fCBgJHtyb290fXByb2R1Y3RzLyR7cHJvZHVjdC5oYW5kbGV9YDtcbiAgICB9XG5cbiAgICBjcmVhdGVQcm9kdWN0SW1hZ2UocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBwcm9kdWN0VXJsID0gdGhpcy5nZXRQcm9kdWN0VXJsKHByb2R1Y3QpO1xuXG4gICAgICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICAgICAgLy8gVmFyaWFudHMgd2l0aG91dCB0aGVpciBvd24gaW1hZ2UgaGF2ZSBmZWF0dXJlZF9pbWFnZSBzZXQgdG8gbnVsbFxuICAgICAgICBpbWFnZS5zcmMgPSBwcm9kdWN0LnNlbGVjdGVkVmFyaWFudD8uZmVhdHVyZWRfaW1hZ2U/LnNyYyB8fCBwcm9kdWN0LmZlYXR1cmVkX2ltYWdlO1xuICAgICAgICAvLyBUaGUgdGl0bGUgbGluayBuYW1lcyB0aGUgcHJvZHVjdCwgc28gdGhlIGltYWdlIGRvZXNuJ3QgbmVlZCB0b1xuICAgICAgICBpbWFnZS5hbHQgPSAnJztcbiAgICAgICAgaW1hZ2UubG9hZGluZyA9ICdsYXp5JztcblxuICAgICAgICAvLyBEdXBsaWNhdGUgb2YgdGhlIHRpdGxlIGxpbmssIHNvIGtlZXAgaXQgb3V0IG9mIHRoZSB0YWIgb3JkZXIgYW5kIHNjcmVlbiByZWFkZXJzXG4gICAgICAgIGNvbnN0IGltYWdlTGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgaW1hZ2VMaW5rLmhyZWYgPSBwcm9kdWN0VXJsO1xuICAgICAgICBpbWFnZUxpbmsudGFiSW5kZXggPSAtMTtcbiAgICAgICAgaW1hZ2VMaW5rLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICBpbWFnZUxpbmsuYXBwZW5kQ2hpbGQoaW1hZ2UpO1xuXG4gICAgICAgIC8vIFNob3cgdGhlIGxvYWRpbmcgc2tlbGV0b24gdW50aWwgdGhlIGltYWdlIGhhcyBsb2FkZWQuIEltYWdlcyBhbHJlYWR5IGluIHRoZSBicm93c2VyJ3MgY2FjaGVcbiAgICAgICAgLy8gYXJlIGNvbXBsZXRlIHN0cmFpZ2h0IGF3YXksIHNvIHByb2R1Y3RzIGFscmVhZHkgaW4gdGhlIHRhYmxlIGRvbid0IGZsYXNoIHRoZSBza2VsZXRvbiB3aGVuIGl0IHJlLXJlbmRlcnNcbiAgICAgICAgaWYgKCEoaW1hZ2UuY29tcGxldGUgJiYgaW1hZ2UubmF0dXJhbFdpZHRoKSkge1xuICAgICAgICAgICAgaW1hZ2VMaW5rLmNsYXNzTGlzdC5hZGQoJ2NvbXBhcmUtc2tlbGV0b24nLCAnY29tcGFyZS1wcm9kdWN0LWltYWdlLS1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNob3dJbWFnZSA9ICgpID0+IGltYWdlTGluay5jbGFzc0xpc3QucmVtb3ZlKCdjb21wYXJlLXNrZWxldG9uJywgJ2NvbXBhcmUtcHJvZHVjdC1pbWFnZS0tbG9hZGluZycpO1xuICAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHNob3dJbWFnZSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICAgICAgLy8gRG9uJ3QgbGVhdmUgdGhlIHNrZWxldG9uIHNoaW1tZXJpbmcgaWYgdGhlIGltYWdlIGZhaWxzXG4gICAgICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHNob3dJbWFnZSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QtaW1hZ2UnO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGltYWdlTGluayk7XG5cbiAgICAgICAgY29uc3QgdGl0bGVMaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICB0aXRsZUxpbmsuaHJlZiA9IHByb2R1Y3RVcmw7XG4gICAgICAgIHRpdGxlTGluay50ZXh0Q29udGVudCA9IHByb2R1Y3QudGl0bGU7XG5cbiAgICAgICAgY29uc3QgdmFyaWFudFRpdGxlID0gdGhpcy5nZXRWYXJpYW50TmFtZShwcm9kdWN0LCBwcm9kdWN0LnNlbGVjdGVkVmFyaWFudCk7XG5cbiAgICAgICAgaWYgKHZhcmlhbnRUaXRsZSkge1xuICAgICAgICAgICAgY29uc3QgdmFyaWFudE5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHZhcmlhbnROYW1lLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QtdGl0bGVfX3ZhcmlhbnQnO1xuICAgICAgICAgICAgdmFyaWFudE5hbWUudGV4dENvbnRlbnQgPSB2YXJpYW50VGl0bGU7XG4gICAgICAgICAgICB0aXRsZUxpbmsuYXBwZW5kKCcgJywgdmFyaWFudE5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGl0bGUuY2xhc3NOYW1lID0gJ2NvbXBhcmUtcHJvZHVjdC10aXRsZSc7XG4gICAgICAgIHRpdGxlLmFwcGVuZENoaWxkKHRpdGxlTGluayk7XG5cbiAgICAgICAgY29uc3QgcmVtb3ZlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXJlbW92ZSc7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgUmVtb3ZlICR7cHJvZHVjdC50aXRsZX0gZnJvbSBjb21wYXJpc29uYCk7XG4gICAgICAgIHJlbW92ZUJ1dHRvbi5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNiA2bDEyIDEyTTE4IDZMNiAxOFwiLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICBgO1xuICAgICAgICByZW1vdmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLnJlbW92ZVByb2R1Y3QocHJvZHVjdC5jb21wYXJlS2V5KSk7XG5cbiAgICAgICAgY29uc3QgcHJvZHVjdENhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJvZHVjdENhcmQuY2xhc3NOYW1lID0gJ2NvbXBhcmUtcHJvZHVjdCc7XG4gICAgICAgIHByb2R1Y3RDYXJkLmRhdGFzZXQua2V5ID0gcHJvZHVjdC5jb21wYXJlS2V5O1xuICAgICAgICBwcm9kdWN0Q2FyZC5hcHBlbmQocmVtb3ZlQnV0dG9uLCB3cmFwcGVyLCB0aXRsZSk7XG5cbiAgICAgICAgcmV0dXJuIHByb2R1Y3RDYXJkO1xuICAgIH1cblxuICAgIGdldFNwZWNpZmljYXRpb25WYWx1ZShwcm9kdWN0LCBzcGVjaWZpY2F0aW9uKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGAke3NwZWNpZmljYXRpb259X2A7XG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSAocHJvZHVjdC50YWdzIHx8IFtdKVxuICAgICAgICAgICAgLmZpbHRlcih0YWcgPT4gdGFnLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgICAgIC5tYXAodGFnID0+IHRhZy5yZXBsYWNlKHByZWZpeCwgJycpKVxuICAgICAgICAgICAgLmpvaW4oJywgJyk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlIHx8ICctJztcbiAgICB9XG5cbiAgICBmb3JtYXRQcmljZShjZW50cykge1xuICAgICAgICBjb25zdCBjdXJyZW5jeSA9IHdpbmRvdy5TaG9waWZ5Py5jdXJyZW5jeT8uYWN0aXZlIHx8ICdHQlAnO1xuXG4gICAgICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgfHwgJ2VuLUdCJywge1xuICAgICAgICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXG4gICAgICAgICAgICBjdXJyZW5jeSxcbiAgICAgICAgfSkuZm9ybWF0KGNlbnRzIC8gMTAwKTtcbiAgICB9XG5cbiAgICAvLyBGcm9tIHRoZSBcIlBhY2sgU2l6ZSAoTcKyKV9cIiB0YWcsIGUuZy4gXCJQYWNrIFNpemUgKE3CsilfMi4yMm3CslwiIC0+IDIuMjIsIG1hdGNoaW5nIHNuaXBwZXRzL3Byb2R1Y3QtZGV0YWlscy10b3AubGlxdWlkXG4gICAgZ2V0UGFja1NpemUocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSAnUGFjayBTaXplIChNwrIpXyc7XG4gICAgICAgIGNvbnN0IHRhZyA9IChwcm9kdWN0LnRhZ3MgfHwgW10pLmZpbmQodGFnID0+IHRhZy5pbmNsdWRlcyhwcmVmaXgpKTtcbiAgICAgICAgY29uc3QgcGFja1NpemUgPSB0YWcgPyBwYXJzZUZsb2F0KHRhZy5yZXBsYWNlKHByZWZpeCwgJycpLnNwbGl0KCdtJylbMF0pIDogTmFOO1xuXG4gICAgICAgIHJldHVybiBwYWNrU2l6ZSA+IDAgPyBwYWNrU2l6ZSA6IG51bGw7XG4gICAgfVxuXG4gICAgY3JlYXRlUHJpY2VWYWx1ZShwcm9kdWN0KSB7XG4gICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICAgIGNvbnN0IGlzUGFja1ByaWNlZCA9IFsnTGFtaW5hdGUnLCAnTFZUJywgJ1JlYWwgV29vZCddLmluY2x1ZGVzKHByb2R1Y3QudHlwZSk7XG5cbiAgICAgICAgLy8gVGhlc2UgYXJlIHByaWNlZCBwZXIgcGFjaywgc28gc2hvdyB0aGVtIHBlciBtwrIgbGlrZSB0aGUgcHJvZHVjdCBwYWdlXG4gICAgICAgIGNvbnN0IHBhY2tTaXplID0gKGlzUGFja1ByaWNlZCAmJiB0aGlzLmdldFBhY2tTaXplKHByb2R1Y3QpKSB8fCAxO1xuICAgICAgICBjb25zdCBwcmljZUNlbnRzID0gTWF0aC5yb3VuZChwcm9kdWN0LnByaWNlIC8gcGFja1NpemUpO1xuICAgICAgICBjb25zdCBycnBQcmljZSA9IHRoaXMuZ2V0UnJwUHJpY2UocHJvZHVjdCwgcHJpY2VDZW50cyAvIDEwMCwgdHJ1ZSwgcGFja1NpemUpO1xuXG4gICAgICAgIGlmIChycnBQcmljZSkge1xuICAgICAgICAgICAgY29uc3QgcnJwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncycpO1xuICAgICAgICAgICAgcnJwLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QtcnJwJztcbiAgICAgICAgICAgIHJycC50ZXh0Q29udGVudCA9IGAke3JycFByaWNlLmxhYmVsfSAke3JycFByaWNlLmFtb3VudH1gO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kKHJycCwgJyAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByaWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwcmljZS5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXByaWNlJztcbiAgICAgICAgY29uc3Qgb25seSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgb25seS5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXByaWNlX19vbmx5JztcbiAgICAgICAgb25seS50ZXh0Q29udGVudCA9ICdPbmx5JztcbiAgICAgICAgcHJpY2UuYXBwZW5kKG9ubHksIGAgJHt0aGlzLmZvcm1hdFByaWNlKHByaWNlQ2VudHMpfSR7dGhpcy5nZXRQcmljZVVuaXQocHJvZHVjdC50eXBlKX0gYCk7XG4gICAgICAgIGZyYWdtZW50LnByZXBlbmQocHJpY2UpO1xuXG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG5cbiAgICBjcmVhdGVSb3cobGFiZWxUZXh0LCBwcm9kdWN0cywgZ2V0VmFsdWUpIHtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbGFiZWwuY2xhc3NOYW1lID0gJ3NwZWNpZmljYXRpb24nO1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IGxhYmVsVGV4dDtcbiAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgICAgIHByb2R1Y3RzLmZvckVhY2gocHJvZHVjdCA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdmFsdWUuY2xhc3NOYW1lID0gJ3NwZWNpZmljYXRpb24tdmFsdWUnO1xuICAgICAgICAgICAgdmFsdWUuZGF0YXNldC5rZXkgPSBwcm9kdWN0LmNvbXBhcmVLZXk7XG4gICAgICAgICAgICB2YWx1ZS5hcHBlbmQoZ2V0VmFsdWUocHJvZHVjdCkpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQodmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgfVxuXG4gICAgY3JlYXRlU2tlbGV0b25MaW5lKCkge1xuICAgICAgICBjb25zdCBsaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGxpbmUuY2xhc3NOYW1lID0gJ2NvbXBhcmUtc2tlbGV0b24gY29tcGFyZS1za2VsZXRvbl9fbGluZSc7XG5cbiAgICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfVxuXG4gICAgZ3JvdXBCeVR5cGUoc3RvcmVkUHJvZHVjdHMpIHtcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIHN0b3JlZFByb2R1Y3RzLmZvckVhY2goZW50cnkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGVudHJ5LnR5cGUgfHwgJyc7XG5cbiAgICAgICAgICAgIGlmICghZ3JvdXBzLmhhcyh0eXBlKSkgZ3JvdXBzLnNldCh0eXBlLCBbXSk7XG4gICAgICAgICAgICBncm91cHMuZ2V0KHR5cGUpLnB1c2goZW50cnkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZ3JvdXBzO1xuICAgIH1cblxuICAgIGdldCBsYWJlbENvbHVtbldpZHRoKCkge1xuICAgICAgICBpZiAodGhpcy5leHRyYVNtYWxsU2NyZWVuUXVlcnkubWF0Y2hlcykgcmV0dXJuIDEwMDtcblxuICAgICAgICByZXR1cm4gdGhpcy5zbWFsbFNjcmVlblF1ZXJ5Lm1hdGNoZXMgPyAxMjAgOiAxNjA7XG4gICAgfVxuXG4gICAgZ2V0IHByb2R1Y3RDb2x1bW5XaWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXh0cmFTbWFsbFNjcmVlblF1ZXJ5Lm1hdGNoZXMgPyAxMzAgOiAyMzA7XG4gICAgfVxuXG4gICAgc2V0R3JpZENvbHVtbnMoZ3JpZCkge1xuICAgICAgICBncmlkLnN0eWxlLmdyaWRUZW1wbGF0ZUNvbHVtbnMgPSBgJHt0aGlzLmxhYmVsQ29sdW1uV2lkdGh9cHggcmVwZWF0KCR7Z3JpZC5kYXRhc2V0LmNvbHVtbnN9LCAke3RoaXMucHJvZHVjdENvbHVtbldpZHRofXB4KWA7XG4gICAgfVxuXG4gICAgY3JlYXRlR3JpZCh0eXBlLCBjb2x1bW5zKSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZ3JpZC5jbGFzc05hbWUgPSAnY29tcGFyZS1tb2RhbF9fcHJvZHVjdC1ncmlkJztcbiAgICAgICAgZ3JpZC5kYXRhc2V0LnR5cGUgPSB0eXBlO1xuICAgICAgICBncmlkLmRhdGFzZXQuY29sdW1ucyA9IGNvbHVtbnM7XG4gICAgICAgIHRoaXMuc2V0R3JpZENvbHVtbnMoZ3JpZCk7XG5cbiAgICAgICAgY29uc3Qgc3BhY2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHNwYWNlci5jbGFzc05hbWUgPSAnY29tcGFyZS1wcm9kdWN0LXNwYWNlcic7XG4gICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQoc3BhY2VyKTtcblxuICAgICAgICByZXR1cm4gZ3JpZDtcbiAgICB9XG5cbiAgICBnZXRTcGVjaWZpY2F0aW9ucyh0eXBlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnTGFtaW5hdGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwZWNpZmljYXRpb25zTGFtaW5hdGU7XG4gICAgICAgICAgICBjYXNlICdBcnRpZmljaWFsIEdyYXNzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc0FydGlmaWNpYWxHcmFzcztcbiAgICAgICAgICAgIGNhc2UgJ1ZpbnlsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc1ZpbnlsO1xuICAgICAgICAgICAgY2FzZSAnTFZUJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc0xWVDtcbiAgICAgICAgICAgIGNhc2UgJ1JlYWwgV29vZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3BlY2lmaWNhdGlvbnNSZWFsV29vZDtcbiAgICAgICAgICAgIGNhc2UgJ0FjY2Vzc29yaWVzICYgVW5kZXJsYXknOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwZWNpZmljYXRpb25zQWNjZXNzb3JpZXM7XG4gICAgICAgICAgICBjYXNlICdSdWdzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zcGVjaWZpY2F0aW9uc1J1Z3M7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNwZWNpZmljYXRpb25zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlU2tlbGV0b25HcmlkKHR5cGUsIGNvdW50KSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmNyZWF0ZUdyaWQodHlwZSwgY291bnQpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGltYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLXNrZWxldG9uIGNvbXBhcmUtc2tlbGV0b25fX2ltYWdlJztcblxuICAgICAgICAgICAgY29uc3QgcHJvZHVjdENhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHByb2R1Y3RDYXJkLmNsYXNzTmFtZSA9ICdjb21wYXJlLXByb2R1Y3QnO1xuICAgICAgICAgICAgcHJvZHVjdENhcmQuYXBwZW5kKGltYWdlLCB0aGlzLmNyZWF0ZVNrZWxldG9uTGluZSgpKTtcblxuICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChwcm9kdWN0Q2FyZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQcmljZSBhbmQgU3RvY2sgcm93cywgdGhlbiB0aGUgc3BlY2lmaWNhdGlvbnNcbiAgICAgICAgY29uc3Qgcm93Q291bnQgPSB0aGlzLmdldFNwZWNpZmljYXRpb25zKHR5cGUpLmxlbmd0aCArIDI7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCByb3dDb3VudDsgcm93KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBsYWJlbC5jbGFzc05hbWUgPSAnc3BlY2lmaWNhdGlvbic7XG4gICAgICAgICAgICBsYWJlbC5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZVNrZWxldG9uTGluZSgpKTtcbiAgICAgICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIHZhbHVlLmNsYXNzTmFtZSA9ICdzcGVjaWZpY2F0aW9uLXZhbHVlJztcbiAgICAgICAgICAgICAgICB2YWx1ZS5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZVNrZWxldG9uTGluZSgpKTtcbiAgICAgICAgICAgICAgICBncmlkLmFwcGVuZENoaWxkKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBncmlkO1xuICAgIH1cblxuICAgIGNyZWF0ZVByb2R1Y3RHcmlkKHR5cGUsIHByb2R1Y3RzKSB7XG4gICAgICAgIGNvbnN0IGdyaWQgPSB0aGlzLmNyZWF0ZUdyaWQodHlwZSwgcHJvZHVjdHMubGVuZ3RoKTtcblxuICAgICAgICBwcm9kdWN0cy5mb3JFYWNoKHByb2R1Y3QgPT4ge1xuICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZVByb2R1Y3RJbWFnZShwcm9kdWN0KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoZSBjZWxscyBzaXQgZGlyZWN0bHkgaW4gdGhlIGdyaWQsIHNvIG1hcmsgZXZlcnkgZXZlbiByb3cgZm9yIGl0cyBiYWNrZ3JvdW5kIGNvbG91clxuICAgICAgICBsZXQgcm93Q291bnQgPSAwO1xuICAgICAgICBjb25zdCBhcHBlbmRSb3cgPSByb3cgPT4ge1xuICAgICAgICAgICAgcm93Q291bnQgKz0gMTtcbiAgICAgICAgICAgIGlmIChyb3dDb3VudCAlIDIgPT09IDApIHJvdy5jaGlsZE5vZGVzLmZvckVhY2goY2VsbCA9PiBjZWxsLmNsYXNzTGlzdC5hZGQoJ2NvbXBhcmUtcm93LS1ldmVuJykpO1xuICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGFwcGVuZFJvdyhcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUm93KCdQcmljZScsIHByb2R1Y3RzLCBwcm9kdWN0ID0+IHRoaXMuY3JlYXRlUHJpY2VWYWx1ZShwcm9kdWN0KSlcbiAgICAgICAgKTtcblxuICAgICAgICBhcHBlbmRSb3coXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVJvdygnU3RvY2snLCBwcm9kdWN0cywgcHJvZHVjdCA9PiB0aGlzLmNyZWF0ZVN0b2NrVmFsdWUocHJvZHVjdCkpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5nZXRTcGVjaWZpY2F0aW9ucyh0eXBlKVxuICAgICAgICAgICAgLy8gU2tpcCBzcGVjaWZpY2F0aW9ucyBub25lIG9mIHRoZSBwcm9kdWN0cyBoYXZlXG4gICAgICAgICAgICAuZmlsdGVyKHNwZWNpZmljYXRpb24gPT4gcHJvZHVjdHMuc29tZShwcm9kdWN0ID0+IHRoaXMuZ2V0U3BlY2lmaWNhdGlvblZhbHVlKHByb2R1Y3QsIHNwZWNpZmljYXRpb24pICE9PSAnLScpKVxuICAgICAgICAgICAgLmZvckVhY2goc3BlY2lmaWNhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgYXBwZW5kUm93KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVJvdyhzcGVjaWZpY2F0aW9uLCBwcm9kdWN0cywgcHJvZHVjdCA9PiB0aGlzLmdldFNwZWNpZmljYXRpb25WYWx1ZShwcm9kdWN0LCBzcGVjaWZpY2F0aW9uKSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdyaWQ7XG4gICAgfVxuXG4gICAgZ2V0Q29sbGVjdGlvbklkKGNvbGxlY3Rpb25faWQpIHtcbiAgICAgICAgc3dpdGNoIChjb2xsZWN0aW9uX2lkKSB7XG4gICAgICAgICAgICBjYXNlICdsYW1pbmF0ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdsYW1pbmF0ZS1mbG9vcmluZyc7XG4gICAgICAgICAgICBjYXNlICdhY2Nlc3Nvcmllcy11bmRlcmxheSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhY2Nlc3Nvcmllcyc7XG4gICAgICAgICAgICBjYXNlICd2aW55bCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2aW55bC1mbG9vcmluZyc7XG4gICAgICAgICAgICBjYXNlICdsdnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnbHZ0LWZsb29yaW5nJztcbiAgICAgICAgICAgIGNhc2UgJ2FydGlmaWNpYWwgZ3Jhc3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYXJ0aWZpY2lhbC1ncmFzcyc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uX2lkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyR3JpZCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdyaWRzQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVuZGVySWQgPSB0aGlzLnJlbmRlcklkID0gKHRoaXMucmVuZGVySWQgfHwgMCkgKyAxO1xuXG4gICAgICAgIGNvbnN0IHN0b3JlZFByb2R1Y3RzID0gdGhpcy5nZXRQcm9kdWN0cygpO1xuXG4gICAgICAgIGlmICghc3RvcmVkUHJvZHVjdHMubGVuZ3RoICYmIHRoaXMuZW1wdHlNZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICAgICAgbWVzc2FnZS5jbGFzc05hbWUgPSAnY29tcGFyaXNvbi1wYWdlX19lbXB0eSc7XG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gdGhpcy5lbXB0eU1lc3NhZ2U7XG5cbiAgICAgICAgICAgIGNvbnN0IGJyb3dzZUxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBicm93c2VMaW5rLmNsYXNzTmFtZSA9ICdidXR0b24gY29tcGFyaXNvbi1wYWdlX19icm93c2UnO1xuICAgICAgICAgICAgYnJvd3NlTGluay5ocmVmID0gd2luZG93LlNob3BpZnk/LnJvdXRlcz8ucm9vdCB8fCAnLyc7XG4gICAgICAgICAgICBicm93c2VMaW5rLnRleHRDb250ZW50ID0gJ0Jyb3dzZSBvdXIgcHJvZHVjdHMnO1xuXG4gICAgICAgICAgICBjb25zdCBicm93c2VXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBicm93c2VXcmFwcGVyLmNsYXNzTmFtZSA9ICdjb21wYXJpc29uLXBhZ2VfX2Jyb3dzZS13cmFwcGVyJztcbiAgICAgICAgICAgIGJyb3dzZVdyYXBwZXIuYXBwZW5kQ2hpbGQoYnJvd3NlTGluayk7XG5cbiAgICAgICAgICAgIHRoaXMuZ3JpZHNDb250YWluZXIucmVwbGFjZUNoaWxkcmVuKG1lc3NhZ2UsIGJyb3dzZVdyYXBwZXIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ3JvdXBzID0gdGhpcy5ncm91cEJ5VHlwZShzdG9yZWRQcm9kdWN0cyk7XG5cbiAgICAgICAgdGhpcy5ncmlkc0NvbnRhaW5lci5yZXBsYWNlQ2hpbGRyZW4oXG4gICAgICAgICAgICAuLi5bLi4uZ3JvdXBzXS5tYXAoKFt0eXBlLCBlbnRyaWVzXSkgPT4gdGhpcy5jcmVhdGVTa2VsZXRvbkdyaWQodHlwZSwgZW50cmllcy5sZW5ndGgpKSxcbiAgICAgICAgICAgIC4uLnRoaXMuY3JlYXRlRW1wdHlUeXBlR3JpZHMoWy4uLmdyb3Vwcy5rZXlzKCldKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnVwZGF0ZUdyaWRXaWR0aHMoKTtcbiAgICAgICAgdGhpcy51cGRhdGVBY3RpdmVUeXBlKCk7XG5cbiAgICAgICAgLy8gVmFyaWFudHMgb2YgdGhlIHNhbWUgcHJvZHVjdCBzaGFyZSBvbmUgcmVxdWVzdFxuICAgICAgICBjb25zdCBoYW5kbGVzID0gWy4uLm5ldyBTZXQoc3RvcmVkUHJvZHVjdHMubWFwKCh7IGhhbmRsZSB9KSA9PiBoYW5kbGUpKV07XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChoYW5kbGVzLm1hcChoYW5kbGUgPT4gdGhpcy5mZXRjaFByb2R1Y3QoaGFuZGxlKSkpO1xuICAgICAgICBjb25zdCBwcm9kdWN0c0J5SGFuZGxlID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaChwcm9kdWN0ID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9kdWN0ICYmIHByb2R1Y3QuZmVhdHVyZWRfaW1hZ2UpIHByb2R1Y3RzQnlIYW5kbGUuc2V0KHByb2R1Y3QuaGFuZGxlLCBwcm9kdWN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQSBuZXdlciByZW5kZXIgc3RhcnRlZCB3aGlsZSB0aGlzIG9uZSB3YXMgZmV0Y2hpbmdcbiAgICAgICAgaWYgKHJlbmRlcklkICE9PSB0aGlzLnJlbmRlcklkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZ3JpZHMgPSBbXTtcblxuICAgICAgICBncm91cHMuZm9yRWFjaCgoZW50cmllcywgdHlwZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSBlbnRyaWVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihlbnRyeSA9PiBwcm9kdWN0c0J5SGFuZGxlLmhhcyhlbnRyeS5oYW5kbGUpKVxuICAgICAgICAgICAgICAgIC5tYXAoZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9kdWN0ID0gcHJvZHVjdHNCeUhhbmRsZS5nZXQoZW50cnkuaGFuZGxlKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucHJvZHVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhcmVLZXk6IENvbXBhcmUuZ2V0RW50cnlLZXkoZW50cnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRWYXJpYW50OiB0aGlzLmdldFNlbGVjdGVkVmFyaWFudChwcm9kdWN0LCBlbnRyeS52YXJpYW50KSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHByb2R1Y3RzLmxlbmd0aCkgZ3JpZHMucHVzaCh0aGlzLmNyZWF0ZVByb2R1Y3RHcmlkKHR5cGUsIHByb2R1Y3RzKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHR5cGVzV2l0aEdyaWRzID0gZ3JpZHMubWFwKGdyaWQgPT4gZ3JpZC5kYXRhc2V0LnR5cGUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZHNDb250YWluZXIucmVwbGFjZUNoaWxkcmVuKC4uLmdyaWRzLCAuLi50aGlzLmNyZWF0ZUVtcHR5VHlwZUdyaWRzKHR5cGVzV2l0aEdyaWRzKSk7XG4gICAgICAgIHRoaXMudXBkYXRlR3JpZFdpZHRocygpO1xuICAgICAgICB0aGlzLnVwZGF0ZUFjdGl2ZVR5cGUoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJBZGRQcm9kdWN0cygpO1xuICAgICAgICB0aGlzLnNjcm9sbFRvQWRkZWRQcm9kdWN0KCk7XG4gICAgfVxuXG4gICAgLy8gQSBwbGFjZWhvbGRlciBncmlkIGZvciBlYWNoIG5hdiB0eXBlIHRoYXQgaGFzIG5vIHByb2R1Y3RzLCBzbyBzZWxlY3RpbmcgaXQgc2hvd3MgYSBtZXNzYWdlXG4gICAgY3JlYXRlRW1wdHlUeXBlR3JpZHModHlwZXNXaXRoR3JpZHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZXMoKVxuICAgICAgICAgICAgLmZpbHRlcih0eXBlID0+ICF0eXBlc1dpdGhHcmlkcy5pbmNsdWRlcyh0eXBlKSlcbiAgICAgICAgICAgIC5tYXAodHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NOYW1lID0gJ2NvbXBhcmUtbW9kYWxfX3Byb2R1Y3QtZ3JpZCBjb21wYXJlLW1vZGFsX19wcm9kdWN0LWdyaWQtLWVtcHR5JztcbiAgICAgICAgICAgICAgICBncmlkLmRhdGFzZXQudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICAgICAgZ3JpZC5kYXRhc2V0LmNvbHVtbnMgPSAwO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX190eXBlLWVtcHR5JztcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gYE5vICR7dHlwZSB8fCAnb3RoZXInfSBwcm9kdWN0cyBhZGRlZCB0byBjb21wYXJlIHlldC5gO1xuXG4gICAgICAgICAgICAgICAgZ3JpZC5hcHBlbmRDaGlsZChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBncmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2Nyb2xsVG9BZGRlZFByb2R1Y3QoKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuc2Nyb2xsVG9LZXk7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9LZXkgPSBudWxsO1xuXG4gICAgICAgIGlmICgha2V5KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2FyZCA9IFsuLi50aGlzLmdyaWRzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb21wYXJlLXByb2R1Y3QnKV1cbiAgICAgICAgICAgIC5maW5kKHByb2R1Y3RDYXJkID0+IHByb2R1Y3RDYXJkLmRhdGFzZXQua2V5ID09PSBrZXkpO1xuXG4gICAgICAgIGlmICghY2FyZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlZHVjZU1vdGlvbiA9IHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG5cbiAgICAgICAgLy8gXCJuZWFyZXN0XCIgb25seSBzY3JvbGxzIHdoZW4gdGhlIHByb2R1Y3QgaXNuJ3QgYWxyZWFkeSBmdWxseSBpbiB2aWV3XG4gICAgICAgIGNhcmQuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgYmVoYXZpb3I6IHJlZHVjZU1vdGlvbiA/ICdhdXRvJyA6ICdzbW9vdGgnLFxuICAgICAgICAgICAgYmxvY2s6ICduZWFyZXN0JyxcbiAgICAgICAgICAgIGlubGluZTogJ25lYXJlc3QnLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1cGRhdGVHcmlkV2lkdGhzKCkge1xuICAgICAgICBjb25zdCBncmlkcyA9IFsuLi50aGlzLmdyaWRzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb21wYXJlLW1vZGFsX19wcm9kdWN0LWdyaWQnKV07XG5cbiAgICAgICAgLy8gSGlkZGVuIGdyaWRzIG1lYXN1cmUgYXMgMCB3aWRlLCBzbyB3b3JrIHRoZSB3aWR0aHMgb3V0IGZyb20gdGhlaXIgY29sdW1uIGNvdW50c1xuICAgICAgICBjb25zdCB3aWR0aHMgPSBncmlkcy5tYXAoZ3JpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gTnVtYmVyKGdyaWQuZGF0YXNldC5jb2x1bW5zKSB8fCAwO1xuICAgICAgICAgICAgY29uc3QgZ2FwID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKGdyaWQpLmNvbHVtbkdhcCkgfHwgMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFiZWxDb2x1bW5XaWR0aCArIGNvbHVtbnMgKiAodGhpcy5wcm9kdWN0Q29sdW1uV2lkdGggKyBnYXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB3aWRlc3QgPSBNYXRoLm1heCgwLCAuLi53aWR0aHMpO1xuXG4gICAgICAgIC8vIEtlZXAgZXZlcnkgZ3JpZCBhcyB3aWRlIGFzIHRoZSB3aWRlc3Qgc28gdGhlIG1vZGFsIGRvZXNuJ3QgcmVzaXplIHdoZW4gc3dpdGNoaW5nIHR5cGVcbiAgICAgICAgZ3JpZHMuZm9yRWFjaChncmlkID0+IHtcbiAgICAgICAgICAgIGdyaWQuc3R5bGUubWluV2lkdGggPSBgJHt3aWRlc3R9cHhgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUaGUgbGlzdCBzaG93cyB0aGUgZmlyc3QgMTAuIFNlYXJjaGluZyBsb2FkcyB1cCB0byAyNTAsIHRoZSBtb3N0IHByb2R1Y3RzLmpzb24gcmV0dXJucyBhdCBvbmNlXG4gICAgYXN5bmMgZmV0Y2hQcm9kdWN0c0J5VHlwZSh0eXBlLCBsaW1pdCA9IDEwKSB7XG4gICAgICAgIGNvbnN0IGNhY2hlS2V5ID0gYCR7dHlwZX06JHtsaW1pdH1gO1xuXG4gICAgICAgIGlmICh0aGlzLnByb2R1Y3RzQnlUeXBlLmhhcyhjYWNoZUtleSkpIHJldHVybiB0aGlzLnByb2R1Y3RzQnlUeXBlLmdldChjYWNoZUtleSk7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IHdpbmRvdy5TaG9waWZ5Py5yb3V0ZXM/LnJvb3QgfHwgJy8nO1xuICAgICAgICAvLyBDb2xsZWN0aW9uIGhhbmRsZXMgYXJlIGxvd2VyY2FzZSB3aXRoIGh5cGhlbnMsIGxpa2UgU2hvcGlmeSdzIGhhbmRsZWl6ZSxcbiAgICAgICAgLy8gZS5nLiBcIkFydGlmaWNpYWwgR3Jhc3NcIiAtPiBcImFydGlmaWNpYWwtZ3Jhc3NcIiwgXCJBY2Nlc3NvcmllcyAmIFVuZGVybGF5XCIgLT4gXCJhY2Nlc3Nvcmllcy11bmRlcmxheVwiXG4gICAgICAgIGNvbnN0IGhhbmRsZSA9IHR5cGUudHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpLnJlcGxhY2UoL14tfC0kL2csICcnKTtcblxuICAgICAgICBsZXQgY29sbGVjdGlvbl9pZCA9IHRoaXMuZ2V0Q29sbGVjdGlvbklkKGhhbmRsZSk7XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtyb290fWNvbGxlY3Rpb25zLyR7Y29sbGVjdGlvbl9pZH0vcHJvZHVjdHMuanNvbj9saW1pdD0ke2xpbWl0fWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgY29uc3QgZGF0YU9iaiA9IEpTT04ucGFyc2UoZGF0YSlcblxuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSAoZGF0YU9iai5wcm9kdWN0cyB8fCBbXSkuZmlsdGVyKHByb2R1Y3QgPT4gcHJvZHVjdC5wcm9kdWN0X3R5cGUudG9Mb3dlckNhc2UoKSA9PT0gdHlwZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnByb2R1Y3RzQnlUeXBlLnNldChjYWNoZUtleSwgcHJvZHVjdHMpO1xuXG4gICAgICAgICAgICByZXR1cm4gcHJvZHVjdHM7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFVuYWJsZSB0byBsb2FkICR7dHlwZX0gcHJvZHVjdHNgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQcm9kdWN0SW1hZ2UocHJvZHVjdCkge1xuICAgICAgICAvLyBwcm9kdWN0cy5qc29uIHJldHVybnMgYW4gaW1hZ2VzIGFycmF5IHJhdGhlciB0aGFuIGEgc2luZ2xlIGltYWdlXG4gICAgICAgIHJldHVybiBwcm9kdWN0LmltYWdlcz8uWzBdPy5zcmMgfHwgJyc7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyB0aGUgdGhlbWUncyBwcm9kdWN0IGdyaWQ6IFwid2FzXCIgcHJpY2UgaWYgb24gc2FsZSwgb3RoZXJ3aXNlIFJSUCBmcm9tIGFuIFJSUF8gdGFnXG4gICAgLy8gcHJvZHVjdHMuanNvbiBnaXZlcyBjb21wYXJlX2F0X3ByaWNlIGFzIGEgZGVjaW1hbCBzdHJpbmcsIHByb2R1Y3RzL3toYW5kbGV9LmpzIGluIGNlbnRzXG4gICAgLy8gcGFja1NpemUgZGl2aWRlcyB0aGUgXCJ3YXNcIiBwcmljZSB0byBwZXIgbcKyLCBhcyBwcmljZSBzaG91bGQgYWxyZWFkeSBiZS4gVGhlIFJSUF8gdGFnIGlzIGFscmVhZHkgcGVyIG3Csi5cbiAgICAvLyBTb2xkIHBlciBpdGVtLCBzbyBoYXZlIG5vIHBlciBtwrIgdW5pdFxuICAgIGdldFByaWNlVW5pdCh0eXBlKSB7XG4gICAgICAgIHJldHVybiBbJ0FjY2Vzc29yaWVzICYgVW5kZXJsYXknLCAnUnVncyddLmluY2x1ZGVzKHR5cGUpID8gJycgOiAnbcKyJztcbiAgICB9XG5cbiAgICBnZXRScnBQcmljZShwcm9kdWN0LCBwcmljZSwgY29tcGFyZUF0SW5DZW50cyA9IGZhbHNlLCBwYWNrU2l6ZSA9IDEpIHtcbiAgICAgICAgY29uc3QgdW5pdCA9IHRoaXMuZ2V0UHJpY2VVbml0KHByb2R1Y3QudHlwZSA/PyBwcm9kdWN0LnByb2R1Y3RfdHlwZSk7XG4gICAgICAgIGNvbnN0IGNvbXBhcmVBdFByaWNlcyA9IChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKVxuICAgICAgICAgICAgLm1hcCh2YXJpYW50ID0+IHBhcnNlRmxvYXQodmFyaWFudC5jb21wYXJlX2F0X3ByaWNlKSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29tcGFyZUF0ID0+ICFOdW1iZXIuaXNOYU4oY29tcGFyZUF0KSlcbiAgICAgICAgICAgIC5tYXAoY29tcGFyZUF0ID0+IChjb21wYXJlQXRJbkNlbnRzID8gY29tcGFyZUF0IC8gMTAwIDogY29tcGFyZUF0KSAvIHBhY2tTaXplKTtcblxuICAgICAgICBjb25zdCBjb21wYXJlQXQgPSBjb21wYXJlQXRQcmljZXMubGVuZ3RoID8gTWF0aC5taW4oLi4uY29tcGFyZUF0UHJpY2VzKSA6IDA7XG5cbiAgICAgICAgaWYgKGNvbXBhcmVBdCA+IHByaWNlKSByZXR1cm4geyBsYWJlbDogJ3dhcycsIGFtb3VudDogYCR7dGhpcy5mb3JtYXRQcmljZShNYXRoLnJvdW5kKGNvbXBhcmVBdCAqIDEwMCkpfSR7dW5pdH1gIH07XG5cbiAgICAgICAgY29uc3QgdGFncyA9IEFycmF5LmlzQXJyYXkocHJvZHVjdC50YWdzKSA/IHByb2R1Y3QudGFncyA6IFN0cmluZyhwcm9kdWN0LnRhZ3MgfHwgJycpLnNwbGl0KCcsICcpO1xuICAgICAgICBjb25zdCBycnBUYWcgPSB0YWdzLmZpbmQodGFnID0+IHRhZy5zdGFydHNXaXRoKCdSUlBfJykpO1xuICAgICAgICBjb25zdCBycnAgPSBycnBUYWcgPyBwYXJzZUZsb2F0KHJycFRhZy5yZXBsYWNlKCdSUlBfJywgJycpKSA6IDA7XG5cbiAgICAgICAgaWYgKHJycCA+IHByaWNlKSByZXR1cm4geyBsYWJlbDogJ1JSUCcsIGFtb3VudDogYCR7dGhpcy5mb3JtYXRQcmljZShNYXRoLnJvdW5kKHJycCAqIDEwMCkpfSR7dW5pdH1gIH07XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY3JlYXRlQWRkUHJvZHVjdEl0ZW0ocHJvZHVjdCkge1xuICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLmdldFByb2R1Y3RJbWFnZShwcm9kdWN0KTtcbiAgICAgICAgLy8gVGhlIGJ1dHRvbidzIGxhYmVsIGFscmVhZHkgbmFtZXMgdGhlIHByb2R1Y3RcbiAgICAgICAgaW1hZ2UuYWx0ID0gJyc7XG4gICAgICAgIGltYWdlLmxvYWRpbmcgPSAnbGF6eSc7XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHRpdGxlLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X190aXRsZSc7XG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gcHJvZHVjdC50aXRsZTtcblxuICAgICAgICBjb25zdCBkZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBkZXRhaWxzLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19kZXRhaWxzJztcbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgLy8gcHJvZHVjdHMuanNvbiBnaXZlcyB2YXJpYW50IHByaWNlcyBhcyBkZWNpbWFsIHN0cmluZ3MsIGUuZy4gXCIxOS45OVwiXG4gICAgICAgIGNvbnN0IHByaWNlcyA9IChwcm9kdWN0LnZhcmlhbnRzIHx8IFtdKVxuICAgICAgICAgICAgLm1hcCh2YXJpYW50ID0+IHBhcnNlRmxvYXQodmFyaWFudC5wcmljZSkpXG4gICAgICAgICAgICAuZmlsdGVyKHByaWNlID0+ICFOdW1iZXIuaXNOYU4ocHJpY2UpKTtcblxuICAgICAgICBpZiAocHJpY2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgbG93ZXN0UHJpY2UgPSBNYXRoLm1pbiguLi5wcmljZXMpO1xuXG4gICAgICAgICAgICBjb25zdCBwcmljZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHByaWNlLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19wcmljZSc7XG4gICAgICAgICAgICBwcmljZS50ZXh0Q29udGVudCA9IGBvbmx5ICR7dGhpcy5mb3JtYXRQcmljZShNYXRoLnJvdW5kKGxvd2VzdFByaWNlICogMTAwKSl9JHt0aGlzLmdldFByaWNlVW5pdChwcm9kdWN0LnByb2R1Y3RfdHlwZSl9YDtcbiAgICAgICAgICAgIGRldGFpbHMuYXBwZW5kQ2hpbGQocHJpY2UpO1xuXG4gICAgICAgICAgICBjb25zdCBycnBQcmljZSA9IHRoaXMuZ2V0UnJwUHJpY2UocHJvZHVjdCwgbG93ZXN0UHJpY2UpO1xuXG4gICAgICAgICAgICBpZiAocnJwUHJpY2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBycnAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzJyk7XG4gICAgICAgICAgICAgICAgcnJwLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19ycnAnO1xuICAgICAgICAgICAgICAgIHJycC50ZXh0Q29udGVudCA9IGAke3JycFByaWNlLmxhYmVsfSAke3JycFByaWNlLmFtb3VudH1gO1xuICAgICAgICAgICAgICAgIGRldGFpbHMuYXBwZW5kQ2hpbGQocnJwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSB3aG9sZSBpdGVtIGlzIHRoZSBidXR0b24sIHNvIHRoaXMgb25seSBzaG93cyB0aGUgcGx1cy4gQSBidXR0b24gY2FuJ3QgY29udGFpbiBhbm90aGVyIGJ1dHRvblxuICAgICAgICBjb25zdCBwbHVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwbHVzLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0X19wbHVzJztcbiAgICAgICAgcGx1cy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgcGx1cy5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyLjVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMiA1VjE5TTUgMTJIMTlcIi8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgYDtcblxuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGl0ZW0udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpdGVtLmNsYXNzTmFtZSA9ICdjb21wYXJlLWFkZC1wcm9kdWN0JztcbiAgICAgICAgaXRlbS5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgQWRkICR7cHJvZHVjdC50aXRsZX0gdG8gY29tcGFyaXNvbmApO1xuICAgICAgICBpdGVtLmFwcGVuZChpbWFnZSwgZGV0YWlscywgcGx1cyk7XG4gICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3QocHJvZHVjdC5oYW5kbGUsIHByb2R1Y3QucHJvZHVjdF90eXBlKTtcblxuICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHBvcHVwIG9uIHNtYWxsZXIgc2NyZWVucyBzbyB0aGUgYWRkZWQgcHJvZHVjdCwgb3IgdGhlIGxpbWl0IHdhcm5pbmcsIGNhbiBiZSBzZWVuXG4gICAgICAgICAgICBpZiAodGhpcy5tb2JpbGVRdWVyeT8ubWF0Y2hlcykgdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIHNob3dMaW1pdFJlYWNoZWQodHlwZSkge1xuICAgICAgICAvLyBUaGUgbW9kYWwgc2xpZGVzIGluIHdoZW4gb3BlbmVkIGZyb20gYSBjb21wYXJlIGJ1dHRvbiwgc28gd2FpdCBmb3IgaXQgYmVmb3JlIHNodWRkZXJpbmdcbiAgICAgICAgY29uc3Qgd2FzT3BlbiA9IHRoaXMubW9kYWxDb250YWluZXI/LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLm1vZGFsT3BlbkNsYXNzKTtcblxuICAgICAgICAvLyBTaG93IHRoZSB3YXJuaW5nIG9uIHRoZSB0eXBlIHRoYXQncyBmdWxsLCBldmVuIGlmIGl0IHdhcyBkaXNtaXNzZWQgYmVmb3JlXG4gICAgICAgIHRoaXMubGltaXRSZWFjaGVkVHlwZXMuYWRkKHR5cGUgfHwgJycpO1xuICAgICAgICB0aGlzLnNlbGVjdFR5cGUodHlwZSB8fCAnJyk7XG5cbiAgICAgICAgLy8gVGhlIHdhcm5pbmcgc2l0cyBvbiB0aGUgbW9kYWwsIHNvIGl0IHNob3dzIHdoZXRoZXIgb3Igbm90IHRoZSBhZGQgcHJvZHVjdCBwYW5lbCBpcyBvcGVuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNodWRkZXJUaW1lcik7XG4gICAgICAgIHRoaXMuc2h1ZGRlclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnNodWRkZXJMaW1pdFdhcm5pbmcoKSwgd2FzT3BlbiA/IDAgOiAzMDApO1xuICAgIH1cblxuICAgIHNodWRkZXJMaW1pdFdhcm5pbmcoKSB7XG4gICAgICAgIGNvbnN0IHdhcm5pbmcgPSB0aGlzLmxpbWl0V2FybmluZztcblxuICAgICAgICBpZiAoIXdhcm5pbmcgfHwgd2FybmluZy5oaWRkZW4pIHJldHVybjtcblxuICAgICAgICAvLyBSZXN0YXJ0IHRoZSBhbmltYXRpb24gaWYgaXQncyBhbHJlYWR5IHJ1bm5pbmdcbiAgICAgICAgd2FybmluZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zaHVkZGVyaW5nJyk7XG4gICAgICAgIHZvaWQgd2FybmluZy5vZmZzZXRXaWR0aDtcbiAgICAgICAgd2FybmluZy5jbGFzc0xpc3QuYWRkKCdpcy1zaHVkZGVyaW5nJyk7XG5cbiAgICAgICAgd2FybmluZy5hZGRFdmVudExpc3RlbmVyKCdhbmltYXRpb25lbmQnLCAoKSA9PiB3YXJuaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNodWRkZXJpbmcnKSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIGlzQWRkUHJvZHVjdE9wZW4oKSB7XG4gICAgICAgIGNvbnN0IG1vZGFsID0gdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyPy5jbG9zZXN0KCcuY29tcGFyZS1tb2RhbCcpO1xuXG4gICAgICAgIHJldHVybiBCb29sZWFuKG1vZGFsKSAmJiAhbW9kYWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdjb21wYXJlLW1vZGFsLS1hc2lkZS1jbG9zZWQnKTtcbiAgICB9XG5cbiAgICBzZXRBZGRQcm9kdWN0VmlzaWJsZShpc1Zpc2libGUsIHsgZm9jdXMgPSB0cnVlLCBhbmltYXRlID0gdHJ1ZSB9ID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLmFkZFByb2R1Y3RDb250YWluZXIpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMuYWRkUHJvZHVjdENvbnRhaW5lcjtcbiAgICAgICAgY29uc3QgbW9kYWwgPSBwYW5lbC5jbG9zZXN0KCcuY29tcGFyZS1tb2RhbCcpO1xuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmFkZFByb2R1Y3RUaW1lcik7XG5cbiAgICAgICAgaWYgKGlzVmlzaWJsZSkge1xuICAgICAgICAgICAgcGFuZWwuaGlkZGVuID0gZmFsc2U7XG4gICAgICAgICAgICBtb2RhbD8uY2xhc3NMaXN0LnJlbW92ZSgnY29tcGFyZS1tb2RhbC0tbm8tYXNpZGUnKTtcblxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIGNsb3NlZCBwb3NpdGlvbiBmaXJzdCBzbyB0aGUgc2xpZGUgaW4gYW5pbWF0ZXNcbiAgICAgICAgICAgIHZvaWQgcGFuZWwub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBtb2RhbD8uY2xhc3NMaXN0LnJlbW92ZSgnY29tcGFyZS1tb2RhbC0tYXNpZGUtY2xvc2VkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb2RhbD8uY2xhc3NMaXN0LmFkZCgnY29tcGFyZS1tb2RhbC0tYXNpZGUtY2xvc2VkJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZVBhbmVsID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHBhbmVsLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgbW9kYWw/LmNsYXNzTGlzdC5hZGQoJ2NvbXBhcmUtbW9kYWwtLW5vLWFzaWRlJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBPbmNlIHRoZSBzbGlkZSBvdXQgaGFzIGZpbmlzaGVkLCByZW1vdmUgdGhlIHBhbmVsIGFuZCBpdHMgY29sdW1uXG4gICAgICAgICAgICBpZiAoYW5pbWF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkUHJvZHVjdFRpbWVyID0gc2V0VGltZW91dChyZW1vdmVQYW5lbCwgMzAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlUGFuZWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbikge1xuICAgICAgICAgICAgLy8gXCJNb3JlIHByb2R1Y3RzXCIgaXMgb25seSBuZWVkZWQgd2hpbGUgdGhlIHBhbmVsIGlzIGhpZGRlbiwgYW5kIHdoZW4gdGhlcmUncyBzb21ldGhpbmcgdG8gYWRkXG4gICAgICAgICAgICB0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbi5oaWRkZW4gPSBpc1Zpc2libGUgfHwgIXRoaXMuaGFzUHJvZHVjdHNUb0FkZDtcbiAgICAgICAgICAgIHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIFN0cmluZyhpc1Zpc2libGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vdmUgZm9jdXMgdG8gdGhlIGNvbnRyb2wgdGhhdCdzIG5vdyB2aXNpYmxlXG4gICAgICAgIGlmICghZm9jdXMpIHJldHVybjtcblxuICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3RDbG9zZT8uZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9yZVByb2R1Y3RzQnV0dG9uPy5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlTGltaXRXYXJuaW5nKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWRkUHJvZHVjdENvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgIGxldCB3YXJuaW5nID0gdGhpcy5saW1pdFdhcm5pbmc7XG5cbiAgICAgICAgaWYgKCF3YXJuaW5nKSB7XG4gICAgICAgICAgICB3YXJuaW5nID0gdGhpcy5saW1pdFdhcm5pbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHdhcm5pbmcuY2xhc3NOYW1lID0gJ2NvbXBhcmUtbW9kYWxfX2xpbWl0LXdhcm5pbmcnO1xuICAgICAgICAgICAgd2FybmluZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnc3RhdHVzJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX19saW1pdC13YXJuaW5nLS10ZXh0JztcbiAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBgWW91IGNhbiBjb21wYXJlIHVwIHRvICR7dGhpcy5tYXhQcm9kdWN0c30gcHJvZHVjdHMgb2YgdGhlIHNhbWUgdHlwZS4gUmVtb3ZlIGEgcHJvZHVjdCB0byBhZGQgYW5vdGhlci5gO1xuXG4gICAgICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2xvc2VCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2xvc2VCdXR0b24uY2xhc3NOYW1lID0gJ2NvbXBhcmUtbW9kYWxfX2xpbWl0LXdhcm5pbmctLWNsb3NlJztcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsICdEaXNtaXNzIG1lc3NhZ2UnKTtcbiAgICAgICAgICAgIGNsb3NlQnV0dG9uLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTYgNmwxMiAxMk0xOCA2TDYgMThcIi8+XG4gICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICBgO1xuICAgICAgICAgICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW1pdFJlYWNoZWRUeXBlcy5kZWxldGUodGhpcy5hY3RpdmVUeXBlKTtcbiAgICAgICAgICAgICAgICB3YXJuaW5nLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgd2FybmluZy5hcHBlbmQobWVzc2FnZSwgY2xvc2VCdXR0b24pO1xuXG4gICAgICAgICAgICAvLyBVbmRlciB0aGUgbmF2IHJhdGhlciB0aGFuIGluIHRoZSBhZGQgcHJvZHVjdCBwYW5lbCwgc28gaXQncyB2aXNpYmxlIHdoaWxlIHRoZSBwYW5lbCBpcyBjbG9zZWRcbiAgICAgICAgICAgIGlmICh0aGlzLm5hdikge1xuICAgICAgICAgICAgICAgIHRoaXMubmF2LmFmdGVyKHdhcm5pbmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAodGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyLmNsb3Nlc3QoJy5jb21wYXJlLW1vZGFsJykgfHwgdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyKS5hcHBlbmRDaGlsZCh3YXJuaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRQcm9kdWN0cygpLmZpbHRlcigoeyB0eXBlID0gJycgfSkgPT4gdHlwZSA9PT0gdGhpcy5hY3RpdmVUeXBlKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGlzRnVsbCA9IGNvdW50ID49IHRoaXMubWF4UHJvZHVjdHM7XG5cbiAgICAgICAgLy8gT25jZSBhIHByb2R1Y3QgaXMgcmVtb3ZlZCB0aGVyZSdzIHJvb20gYWdhaW4sIHNvIHdhaXQgZm9yIHRoZSBuZXh0IGF0dGVtcHQgdG8gYWRkIGEgNXRoXG4gICAgICAgIGlmICghaXNGdWxsKSB0aGlzLmxpbWl0UmVhY2hlZFR5cGVzLmRlbGV0ZSh0aGlzLmFjdGl2ZVR5cGUpO1xuXG4gICAgICAgIC8vIE9ubHkgYWZ0ZXIgdHJ5aW5nIHRvIGFkZCBvbmUgbW9yZSB0aGFuIHRoZSBsaW1pdCwgbm90IGFzIHNvb24gYXMgdGhlIHR5cGUgaXMgZnVsbFxuICAgICAgICB3YXJuaW5nLmhpZGRlbiA9ICFpc0Z1bGwgfHwgIXRoaXMubGltaXRSZWFjaGVkVHlwZXMuaGFzKHRoaXMuYWN0aXZlVHlwZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyQWRkUHJvZHVjdHMoKSB7XG4gICAgICAgIGlmICghdGhpcy5hZGRQcm9kdWN0Q29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGxpc3QgPSB0aGlzLmFkZFByb2R1Y3RDb250YWluZXIucXVlcnlTZWxlY3RvcignLmNvbXBhcmUtbW9kYWxfX2FkZC1wcm9kdWN0LS1saXN0Jyk7XG5cbiAgICAgICAgaWYgKCFsaXN0KSB7XG4gICAgICAgICAgICBsaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBsaXN0LmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX19hZGQtcHJvZHVjdC0tbGlzdCc7XG4gICAgICAgICAgICB0aGlzLmFkZFByb2R1Y3RDb250YWluZXIuYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaXN0SWQgPSB0aGlzLmFkZFByb2R1Y3RzSWQgPSAodGhpcy5hZGRQcm9kdWN0c0lkIHx8IDApICsgMTtcbiAgICAgICAgY29uc3QgYWN0aXZlVHlwZSA9IHRoaXMuYWN0aXZlVHlwZTtcblxuICAgICAgICAvLyBQcm9kdWN0cyB3aXRob3V0IGEgdHlwZSAoXCJPdGhlclwiKSBjYW4ndCBiZSBsaXN0ZWQgYnkgdHlwZVxuICAgICAgICBpZiAoIWFjdGl2ZVR5cGUpIHtcbiAgICAgICAgICAgIGxpc3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gICAgICAgICAgICB0aGlzLnNldEhhc1Byb2R1Y3RzVG9BZGQoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcXVlcnkgPSAodGhpcy5hZGRQcm9kdWN0U2VhcmNoPy52YWx1ZSB8fCAnJykudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gYXdhaXQgdGhpcy5mZXRjaFByb2R1Y3RzQnlUeXBlKGFjdGl2ZVR5cGUsIHF1ZXJ5ID8gMjUwIDogMTApO1xuXG4gICAgICAgIC8vIFRoZSBzZWxlY3Rpb24sIHNlYXJjaCBvciBwcm9kdWN0cyBjaGFuZ2VkIHdoaWxlIHRoaXMgb25lIHdhcyBmZXRjaGluZ1xuICAgICAgICBpZiAobGlzdElkICE9PSB0aGlzLmFkZFByb2R1Y3RzSWQpIHJldHVybjtcblxuICAgICAgICBjb25zdCBhZGRlZEhhbmRsZXMgPSBuZXcgU2V0KHRoaXMuZ2V0UHJvZHVjdHMoKS5tYXAoKHsgaGFuZGxlIH0pID0+IGhhbmRsZSkpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1zID0gcHJvZHVjdHNcbiAgICAgICAgICAgIC5maWx0ZXIocHJvZHVjdCA9PiB0aGlzLmdldFByb2R1Y3RJbWFnZShwcm9kdWN0KSAmJiAhYWRkZWRIYW5kbGVzLmhhcyhwcm9kdWN0LmhhbmRsZSkpXG4gICAgICAgICAgICAuZmlsdGVyKHByb2R1Y3QgPT4gIXF1ZXJ5IHx8IHByb2R1Y3QudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeSkpXG4gICAgICAgICAgICAubWFwKHByb2R1Y3QgPT4gdGhpcy5jcmVhdGVBZGRQcm9kdWN0SXRlbShwcm9kdWN0KSk7XG5cbiAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICAvLyBObyBtYXRjaGVzIG9ubHkgbWVhbnMgbm90aGluZyBmaXRzIHRoZSBzZWFyY2gsIHNvIGtlZXAgdGhlIHBhbmVsIG9wZW4gd2l0aCBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmICghaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmNsYXNzTmFtZSA9ICdjb21wYXJlLW1vZGFsX19hZGQtcHJvZHVjdC0tZW1wdHknO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSAnTm8gcHJvZHVjdHMgbWF0Y2ggeW91ciBzZWFyY2guJztcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaXN0LnJlcGxhY2VDaGlsZHJlbiguLi5pdGVtcyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnJlcGxhY2VDaGlsZHJlbiguLi5pdGVtcyk7XG4gICAgICAgIHRoaXMuc2V0SGFzUHJvZHVjdHNUb0FkZChpdGVtcy5sZW5ndGggPiAwKTtcbiAgICB9XG5cbiAgICBzZXRIYXNQcm9kdWN0c1RvQWRkKGhhc1Byb2R1Y3RzKSB7XG4gICAgICAgIHRoaXMuaGFzUHJvZHVjdHNUb0FkZCA9IGhhc1Byb2R1Y3RzO1xuXG4gICAgICAgIC8vIE5vdGhpbmcgbGVmdCB0byBhZGQgZnJvbSB0aGlzIGNvbGxlY3Rpb24sIGUuZy4gaXRzIGxhc3QgcHJvZHVjdCB3YXMganVzdCBhZGRlZCBvclxuICAgICAgICAvLyB0aGUgc2VsZWN0ZWQgdHlwZSdzIGNvbGxlY3Rpb24gaGFzIG5vbmUsIHNvIGNsb3NlIHRoZSBwYW5lbCBpbnN0ZWFkIG9mIHNob3dpbmcgaXQgZW1wdHkuXG4gICAgICAgIC8vIE5vdCBmb2N1c2luZyBcIkFkZCBwcm9kdWN0c1wiLCBhcyBpdCdzIGhpZGRlbiB0b29cbiAgICAgICAgaWYgKCFoYXNQcm9kdWN0cyAmJiB0aGlzLmlzQWRkUHJvZHVjdE9wZW4oKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBZGRQcm9kdWN0VmlzaWJsZShmYWxzZSwgeyBmb2N1czogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tb3JlUHJvZHVjdHNCdXR0b24gJiYgIXRoaXMuaXNBZGRQcm9kdWN0T3BlbigpKSB7XG4gICAgICAgICAgICB0aGlzLm1vcmVQcm9kdWN0c0J1dHRvbi5oaWRkZW4gPSAhaGFzUHJvZHVjdHM7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNvbnN0IGNvbXBhcmUgPSBuZXcgQ29tcGFyZSgpO1xubGV0IGNvbXBhcmlzb25QYWdlID0gbnVsbDtcblxuY29uc3QgY29tcGFyaXNvblBhZ2VBcHAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29tcGFyaXNvbi1wYWdlLWFwcCcpO1xuXG5pZiAoY29tcGFyaXNvblBhZ2VBcHApIHtcbiAgICBjb25zdCBuYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCduYXYnKTtcbiAgICBuYXYuY2xhc3NOYW1lID0gJ2NvbXBhcmlzb24tcGFnZV9fbmF2JztcblxuICAgIGNvbnN0IGdyaWRzQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZ3JpZHNDb250YWluZXIuY2xhc3NOYW1lID0gJ2NvbXBhcmlzb24tcGFnZV9fZ3JpZHMnO1xuXG4gICAgY29tcGFyaXNvblBhZ2VBcHAuYXBwZW5kKG5hdiwgZ3JpZHNDb250YWluZXIpO1xuXG4gICAgY29tcGFyaXNvblBhZ2UgPSBuZXcgQ29tcGFyZSh7XG4gICAgICAgIG5hdixcbiAgICAgICAgZ3JpZHNDb250YWluZXIsXG4gICAgICAgIC8vIFdpdGhvdXQgYSBzaGFyZWQgbGluaywgc2hvdyB3aGF0J3MgYmVlbiBhZGRlZCB0byB0aGUgY29tcGFyZSB0YWJsZSBvbiB0aGlzIGRldmljZVxuICAgICAgICBwcm9kdWN0czogbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5oYXMoJ2NvbXBhcmUnKVxuICAgICAgICAgICAgPyBDb21wYXJlLmdldFVybFByb2R1Y3RzKClcbiAgICAgICAgICAgIDogY29tcGFyZS5nZXRTdG9yZWRQcm9kdWN0cygpLFxuICAgICAgICBlbXB0eU1lc3NhZ2U6ICdObyBwcm9kdWN0cyBhZGRlZCcsXG4gICAgfSk7XG59XG5cbmNsYXNzIENvbXBhcmVTaGFyZSB7XG4gICAgY29uc3RydWN0b3Ioc2hhcmVCdXR0b24sIHBvcHVwLCBnZXRQcm9kdWN0cykge1xuICAgICAgICB0aGlzLnNoYXJlQnV0dG9uID0gc2hhcmVCdXR0b247XG4gICAgICAgIHRoaXMucG9wdXAgPSBwb3B1cDtcbiAgICAgICAgdGhpcy5nZXRQcm9kdWN0cyA9IGdldFByb2R1Y3RzO1xuICAgICAgICB0aGlzLmNvcHlCdXR0b24gPSBwb3B1cC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zaGFyZT1cImNvcHlcIl0nKTtcbiAgICAgICAgdGhpcy5jb3B5TGFiZWwgPSB0aGlzLmNvcHlCdXR0b24/LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJpc29uLXNoYXJlX19sYWJlbCcpO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSAnVGFrZSBhIGxvb2sgYXQgdGhpcyBwcm9kdWN0IGNvbXBhcmlzb24nO1xuXG4gICAgICAgIHRoaXMuaGFuZGxlS2V5ZG93biA9IHRoaXMuaGFuZGxlS2V5ZG93bi5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHNoYXJlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyaXNvbi1zaGFyZV9fY2xvc2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xuICAgICAgICBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyaXNvbi1zaGFyZV9fYmFja2dyb3VuZCcpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuY29weUJ1dHRvbj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmNvcHlMaW5rLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGdldFNoYXJlVXJsKCkge1xuICAgICAgICBjb25zdCByb290ID0gd2luZG93LlNob3BpZnk/LnJvdXRlcz8ucm9vdCB8fCAnLyc7XG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoYCR7cm9vdH1wYWdlcy9jb21wYXJlYCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gdGhpcy5nZXRQcm9kdWN0cygpO1xuXG4gICAgICAgIGlmIChwcm9kdWN0cy5sZW5ndGgpIHVybC5zZWFyY2hQYXJhbXMuc2V0KCdjb21wYXJlJywgSlNPTi5zdHJpbmdpZnkocHJvZHVjdHMpKTtcblxuICAgICAgICByZXR1cm4gdXJsLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlTGlua3MoKSB7XG4gICAgICAgIC8vIFRoZSBwcm9kdWN0cyBjaGFuZ2UgYXMgdGhleSdyZSBhZGRlZCBhbmQgcmVtb3ZlZCwgc28gYnVpbGQgdGhlIGxpbmtzIG9uIG9wZW5cbiAgICAgICAgY29uc3QgdXJsID0gdGhpcy5nZXRTaGFyZVVybCgpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYCR7dGhpcy5tZXNzYWdlfTogJHt1cmx9YDtcblxuICAgICAgICBjb25zdCBsaW5rcyA9IHtcbiAgICAgICAgICAgIHdoYXRzYXBwOiBgaHR0cHM6Ly93YS5tZS8/dGV4dD0ke2VuY29kZVVSSUNvbXBvbmVudCh0ZXh0KX1gLFxuICAgICAgICAgICAgZW1haWw6IGBtYWlsdG86P3N1YmplY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoJ1Byb2R1Y3QgY29tcGFyaXNvbicpfSZib2R5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWAsXG4gICAgICAgICAgICBzbXM6IGBzbXM6PyZib2R5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWAsXG4gICAgICAgIH07XG5cbiAgICAgICAgT2JqZWN0LmVudHJpZXMobGlua3MpLmZvckVhY2goKFt0eXBlLCBocmVmXSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGluayA9IHRoaXMucG9wdXAucXVlcnlTZWxlY3RvcihgW2RhdGEtc2hhcmU9XCIke3R5cGV9XCJdYCk7XG4gICAgICAgICAgICBpZiAobGluaykgbGluay5ocmVmID0gaHJlZjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb3BlbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMaW5rcygpO1xuICAgICAgICB0aGlzLnBvcHVwLmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duKTtcbiAgICAgICAgdGhpcy5wb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29tcGFyaXNvbi1zaGFyZV9fY2xvc2UnKT8uZm9jdXMoKTtcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5wb3B1cC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duKTtcbiAgICAgICAgdGhpcy5zaGFyZUJ1dHRvbi5mb2N1cygpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWRvd24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICBhc3luYyBjb3B5TGluaygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvcHlMYWJlbCkgcmV0dXJuO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLmdldFNoYXJlVXJsKCkpO1xuICAgICAgICAgICAgdGhpcy5jb3B5TGFiZWwudGV4dENvbnRlbnQgPSAnTGluayBjb3BpZWQnO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5jb3B5TGFiZWwudGV4dENvbnRlbnQgPSAnVW5hYmxlIHRvIGNvcHknO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29weVRpbWVvdXQpO1xuICAgICAgICB0aGlzLmNvcHlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvcHlMYWJlbC50ZXh0Q29udGVudCA9ICdDb3B5IGxpbmsnO1xuICAgICAgICB9LCAyMDAwKTtcbiAgICB9XG59XG5cbmNvbnN0IGNvbXBhcmlzb25TaGFyZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJpc29uLXBhZ2VfX3NoYXJlJyk7XG5jb25zdCBjb21wYXJpc29uU2hhcmVQb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb21wYXJpc29uLXNoYXJlJyk7XG5cbmlmIChjb21wYXJpc29uU2hhcmVCdXR0b24gJiYgY29tcGFyaXNvblNoYXJlUG9wdXApIHtcbiAgICBuZXcgQ29tcGFyZVNoYXJlKFxuICAgICAgICBjb21wYXJpc29uU2hhcmVCdXR0b24sXG4gICAgICAgIGNvbXBhcmlzb25TaGFyZVBvcHVwLFxuICAgICAgICAoKSA9PiAoY29tcGFyaXNvblBhZ2UgfHwgY29tcGFyZSkuZ2V0UHJvZHVjdHMoKVxuICAgICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQSxNQUFNLE9BQU8sQ0FBQztJQUNkLElBQUksV0FBVyxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUU7SUFDOUIsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLHlCQUF5QjtJQUNuRCxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQztJQUM1QixRQUFRLElBQUksQ0FBQyxtQkFBbUIsR0FBRyx5QkFBeUI7SUFDNUQsUUFBUSxJQUFJLENBQUMsY0FBYyxHQUFHLG9CQUFvQjtJQUNsRCxRQUFRLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLFFBQVEsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUM7SUFDdkcsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQUksUUFBUSxD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
