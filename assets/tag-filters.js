/**
 * Asynchronous, multi-select tag filters for the carpet collection pages
 * (snippets/filter-by-tags.liquid, used by collection-carpets, collection-storecarpets,
 * collections-withbanners and collection-accessories).
 *
 * - Filters, sorting and pagination update the product grid in place, with browser history.
 * - Any number of tags can be selected. Tags in the same group (e.g. two colours) are OR'd,
 *   tags in different groups (e.g. colour + style) are AND'd.
 *
 * Shopify tag URLs (/collections/x/tag-a+tag-b) only AND tags together, so there are two modes:
 *  - Every group has at most one tag selected: the normal tag URL is requested through the
 *    Section Rendering API and its grid and pagination are swapped in. The URL stays the
 *    server-rendered tag URL, so reloading or sharing it works without JavaScript.
 *  - A group has several tags selected: one tag URL per combination (Grey+Twist, Beige+Twist...)
 *    is fetched with the collection.tag-filter-data template, and the results are merged,
 *    de-duplicated, sorted and paginated here. The URL becomes /collections/x?tags=a,b,c.
 */

const DATA_VIEW = 'tag-filter-data';
const MAX_DATA_PAGES = 20; // 50 products a page, per tag combination
const COLOUR_GROUP = 'filter-colour';
const NEXT_LABEL = 'Next <i class="icon-chevron-right"></i>';
const PREV_LABEL = '<i class="icon-chevron-left"></i> Prev';
const PAGINATION_WINDOW = 2;

const byNumber = (key, direction) => (a, b) => (a[key] - b[key]) * direction;
const byTitle = (direction) => (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }) * direction;
// Featured and best selling can't be recomputed here, so keep each combination's own order,
// interleaving the combinations: 1st of each, then 2nd of each...
const byPosition = (a, b) => a.position - b.position || a.combo - b.combo;

const SORTERS = {
    'price-ascending': byNumber('price', 1),
    'price-descending': byNumber('price', -1),
    'title-ascending': byTitle(1),
    'title-descending': byTitle(-1),
    'created-ascending': byNumber('created', 1),
    'created-descending': byNumber('created', -1),
};

class TagFilters {
    constructor(config) {
        this.grid = document.querySelector('.collection-product .product-grid[data-page-size]');
        if (!this.grid) return;

        this.collectionUrl = config.collectionUrl.replace(/\/$/, '');
        this.defaultSort = config.defaultSort || '';
        this.main = this.grid.closest('.col-main') || this.grid.parentElement;
        this.wrapper = this.grid.closest('.collection-product');
        this.panel = document.querySelector('[data-tag-filters]');
        this.clearLink = this.panel && this.panel.querySelector('.clear-filters');
        this.sorter = this.main.querySelector('.sort-by');
        this.pageSize = parseInt(this.grid.dataset.pageSize, 10) || 24;
        const section = this.grid.closest('.shopify-section');
        this.sectionId = section ? section.id.replace('shopify-section-', '') : '';

        // Panel order, so URLs and combinations are stable whatever order tags are clicked in
        this.groups = new Map();
        this.groupOrder = [];
        if (this.panel) {
            this.panel.querySelectorAll('.advanced-filter[data-handle]').forEach((li) => {
                const group = li.dataset.group.toLowerCase();
                if (!this.groupOrder.includes(group)) this.groupOrder.push(group);
                this.groups.set(li.dataset.handle, group);
            });
        }

        this.cache = new Map();
        this.requestId = 0;

        this.readLocation();
        this.syncPanel();
        this.bind();
        history.replaceState({ tagFilters: true }, '', window.location.href);

        // Pages with several tags in a group are only built client-side
        if (new URLSearchParams(window.location.search).has('tags')) {
            this.update({ history: 'replace' });
        } else {
            this.rewritePaginationLinks();
        }
    }

    /* ---------- State ---------- */

    readLocation() {
        const params = new URLSearchParams(window.location.search);
        const pathTags = decodeURIComponent(window.location.pathname)
            .replace(/\/$/, '')
            .slice(decodeURIComponent(this.collectionUrl).length + 1)
            .split('+');
        const paramTags = (params.get('tags') || '').split(',');

        this.selected = new Set([...pathTags, ...paramTags].filter((handle) => this.groups.has(handle)));
        this.sort = params.get('sort_by') || this.defaultSort;
        this.page = parseInt(params.get('page'), 10) || 1;
    }

    /** Selected handles by group, in panel order: [['filter-colour', ['filter-colour_grey', ...]], ...] */
    selectedByGroup() {
        const byGroup = new Map(this.groupOrder.map((group) => [group, []]));
        this.groups.forEach((group, handle) => {
            if (this.selected.has(handle)) byGroup.get(group).push(handle);
        });
        return [...byGroup].filter(([, handles]) => handles.length);
    }

    isMultiSelect() {
        return this.selectedByGroup().some(([, handles]) => handles.length > 1);
    }

    /** Every AND-able combination of the selected tags, one tag from each group */
    combinations() {
        return this.selectedByGroup().reduce(
            (combos, [, handles]) => combos.flatMap((combo) => handles.map((handle) => [...combo, handle])),
            [[]]
        );
    }

    tagPath(handles) {
        return handles.length ? `${this.collectionUrl}/${handles.map(encodeURIComponent).join('+')}` : this.collectionUrl;
    }

    /** The address shown in the browser for the current state */
    pageUrl(page = this.page) {
        const params = new URLSearchParams();
        let path;
        if (this.isMultiSelect()) {
            path = this.collectionUrl;
            params.set('tags', this.selectedByGroup().flatMap(([, handles]) => handles).join(','));
        } else {
            path = this.tagPath(this.selectedByGroup().map(([, handles]) => handles[0]));
        }
        if (this.sort && this.sort !== this.defaultSort) params.set('sort_by', this.sort);
        if (page > 1) params.set('page', page);
        const query = params.toString().replace(/%2C/g, ',');
        return query ? `${path}?${query}` : path;
    }

    /* ---------- Events ---------- */

    bind() {
        if (this.panel) {
            this.panel.addEventListener('click', (event) => {
                const clear = event.target.closest('.clear-filters');
                const link = event.target.closest('.advanced-filter a');
                if (!clear && !link) return;
                event.preventDefault();

                if (clear) {
                    this.selected.clear();
                } else {
                    const handle = link.closest('.advanced-filter').dataset.handle;
                    if (this.selected.has(handle)) {
                        this.selected.delete(handle);
                    } else {
                        this.selected.add(handle);
                    }
                }
                this.page = 1;
                this.syncPanel();
                this.update();
            });
        }

        if (this.sorter) {
            this.sorter.addEventListener('change', () => {
                this.sort = this.sorter.value;
                this.page = 1;
                this.update();
            });
        }

        this.main.addEventListener('click', (event) => {
            const link = event.target.closest('.collection-pagination a');
            if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
            event.preventDefault();
            this.page = parseInt(new URL(link.href, window.location.origin).searchParams.get('page'), 10) || 1;
            this.update({ scroll: true });
        });

        window.addEventListener('popstate', (event) => {
            if (!event.state || !event.state.tagFilters) return;
            this.readLocation();
            this.syncPanel();
            this.update({ history: false });
        });
    }

    syncPanel() {
        if (!this.panel) return;
        this.panel.querySelectorAll('.advanced-filter[data-handle]').forEach((li) => {
            li.classList.toggle('active-filter', this.selected.has(li.dataset.handle));
        });
        if (this.clearLink) this.clearLink.hidden = this.selected.size === 0;
        if (this.sorter && this.sort) this.sorter.value = this.sort;
    }

    /* ---------- Fetching and rendering ---------- */

    fetchDocument(url) {
        if (!this.cache.has(url)) {
            const request = fetch(url, { credentials: 'same-origin' })
                .then((response) => {
                    if (!response.ok) throw new Error(`${response.status} for ${url}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html'));
            request.catch(() => this.cache.delete(url));
            this.cache.set(url, request);
            if (this.cache.size > 60) this.cache.delete(this.cache.keys().next().value);
        }
        return this.cache.get(url);
    }

    async update({ history: historyMode = 'push', scroll = false } = {}) {
        const requestId = ++this.requestId;
        const url = this.pageUrl();
        if (historyMode === 'push') history.pushState({ tagFilters: true }, '', url);
        if (historyMode === 'replace') history.replaceState({ tagFilters: true }, '', url);

        this.wrapper.classList.add('is-loading');
        try {
            const render = this.isMultiSelect() ? await this.loadMerged() : await this.loadSection();
            if (requestId !== this.requestId) return; // A newer update started meanwhile
            render();
            this.afterRender();
            if (scroll) this.scrollToResults();
        } catch (error) {
            if (requestId !== this.requestId) return;
            console.error('Tag filters:', error);
            window.location.href = url;
        } finally {
            if (requestId === this.requestId) this.wrapper.classList.remove('is-loading');
        }
    }

    /** One tag per group: render the real tag URL through this section */
    async loadSection() {
        const [, query = ''] = this.pageUrl().split('?');
        const params = new URLSearchParams(query);
        params.set('section_id', this.sectionId);
        const path = this.tagPath(this.selectedByGroup().map(([, handles]) => handles[0]));
        const doc = await this.fetchDocument(`${path}?${params}`);

        const remoteGrid = doc.querySelector('.product-grid');
        if (!remoteGrid) throw new Error('No product grid in section response');
        const remotePagination = doc.querySelector('.collection-pagination');

        return () => {
            const grid = remoteGrid.cloneNode(true);
            // Scripts don't run when swapped in; this drops the "no products" redirect too
            grid.querySelectorAll('script').forEach((script) => script.remove());
            this.grid.replaceChildren(...grid.childNodes);
            this.setPagination(remotePagination ? remotePagination.innerHTML : '');
            this.colourCards(this.grid.querySelectorAll('.item'), this.singleColour());
        };
    }

    /** Several tags in a group: fetch every combination, then merge, sort and paginate here */
    async loadMerged() {
        const combos = this.combinations();
        const results = await Promise.all(combos.map((combo) => this.fetchAllProducts(combo)));

        const seen = new Set();
        const products = [];
        results.forEach((items, combo) => {
            items.forEach((item, position) => {
                if (seen.has(item.handle)) return;
                seen.add(item.handle);
                products.push({ ...item, combo, position, colour: this.colourOf(combos[combo]) });
            });
        });

        const sorter = SORTERS[this.sort] || byPosition;
        products.sort((a, b) => sorter(a, b) || byPosition(a, b));

        const pages = Math.max(1, Math.ceil(products.length / this.pageSize));
        this.page = Math.min(this.page, pages);
        const start = (this.page - 1) * this.pageSize;
        const pageProducts = products.slice(start, start + this.pageSize);

        return () => {
            if (!pageProducts.length) {
                this.grid.innerHTML = '<p id="noProducts">There are no products in this view.</p>';
            } else {
                this.grid.replaceChildren();
                pageProducts.forEach((product) => {
                    const cards = [...product.node.cloneNode(true).children];
                    this.grid.append(...cards);
                    this.colourCards(cards, product.colour);
                });
            }
            this.setPagination(pages > 1 ? this.buildPagination(pages) : '');
            history.replaceState({ tagFilters: true }, '', this.pageUrl());
        };
    }

    async fetchAllProducts(combo) {
        const url = (page) => {
            const params = new URLSearchParams({ view: DATA_VIEW, page });
            if (this.sort) params.set('sort_by', this.sort);
            return `${this.tagPath(combo)}?${params}`;
        };
        // product-grid-item renders nothing for clone/sample products, so skip empty wrappers
        const read = (doc) => [...doc.querySelectorAll('[data-tag-filter-product]')].filter((node) => node.children.length).map((node) => ({
            handle: node.dataset.handle,
            price: Number(node.dataset.price) || 0,
            title: node.dataset.title || '',
            created: Number(node.dataset.created) || 0,
            node,
        }));

        const first = await this.fetchDocument(url(1));
        const results = first.querySelector('[data-tag-filter-results]');
        const pages = Math.min(parseInt(results && results.dataset.pages, 10) || 1, MAX_DATA_PAGES);
        const rest = await Promise.all(
            Array.from({ length: pages - 1 }, (_, i) => this.fetchDocument(url(i + 2)))
        );
        return [first, ...rest].flatMap(read);
    }

    /** Same markup as Liquid's default_pagination, with this section's labels */
    buildPagination(pages) {
        const link = (page, label) => `<a href="${this.pageUrl(page)}" title="">${label}</a>`;
        const parts = [];
        if (this.page > 1) parts.push(`<span class="prev">${link(this.page - 1, PREV_LABEL)}</span>`);
        let gap = false;
        for (let page = 1; page <= pages; page++) {
            const inWindow = Math.abs(page - this.page) <= PAGINATION_WINDOW;
            if (page === 1 || page === pages || inWindow) {
                parts.push(page === this.page
                    ? `<span class="page current">${page}</span>`
                    : `<span class="page">${link(page, page)}</span>`);
                gap = false;
            } else if (!gap) {
                parts.push('<span class="deco">&hellip;</span>');
                gap = true;
            }
        }
        if (this.page < pages) parts.push(`<span class="next">${link(this.page + 1, NEXT_LABEL)}</span>`);
        return parts.join(' ');
    }

    /** Puts the pagination into the top and bottom toolbars, or removes it when there's one page */
    setPagination(html) {
        this.main.querySelectorAll('.toolbar-product > .row').forEach((row) => {
            let wrap = row.querySelector('.wrap-pagi');
            if (!html) {
                if (wrap) wrap.remove();
                return;
            }
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.className = 'wrap-pagi';
                wrap.innerHTML = '<div class="collection-pagination"></div>';
                row.append(wrap);
            }
            wrap.querySelector('.collection-pagination').innerHTML = html;
        });
        this.rewritePaginationLinks();
    }

    /** Section-rendered links carry section_id; point them at the real page so they open in a new tab too */
    rewritePaginationLinks() {
        this.main.querySelectorAll('.collection-pagination a').forEach((link) => {
            const page = parseInt(new URL(link.href, window.location.origin).searchParams.get('page'), 10) || 1;
            link.href = this.pageUrl(page);
        });
    }

    scrollToResults() {
        const top = this.main.getBoundingClientRect().top + window.scrollY - 120;
        if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }

    /* ---------- Product cards ---------- */

    colourOf(handles) {
        const handle = handles.find((h) => this.groups.get(h) === COLOUR_GROUP);
        if (!handle || !this.panel) return '';
        const li = this.panel.querySelector(`.advanced-filter[data-handle="${CSS.escape(handle)}"] a`);
        return li ? li.textContent.trim().toLowerCase() : '';
    }

    singleColour() {
        const colours = [...this.selected].filter((handle) => this.groups.get(handle) === COLOUR_GROUP);
        return colours.length === 1 ? this.colourOf(colours) : '';
    }

    /**
     * Shows the filtered colour's swatch image on each card, like select_colour_filtered() in
     * assets/collection.js does on page load (that relies on the global colour_filter).
     */
    colourCards(cards, colour) {
        window.colour_filter = this.singleColour();
        if (!colour || typeof window.get_real_colour !== 'function') return;

        const previous = window.colour_filter;
        window.colour_filter = colour; // get_real_colour() reads it
        cards.forEach((card) => {
            const swatch = [...card.querySelectorAll('.swatch-colours li')].find((li) => {
                const img = li.querySelector('img');
                return img && window.get_real_colour((img.alt || '').toLowerCase()).indexOf(colour) !== -1;
            });
            if (!swatch) return;
            swatch.classList.add('selected');
            const span = swatch.querySelector('span');
            const imageUrl = span && span.dataset.imageUrl;
            if (!imageUrl) return;
            const img = card.querySelector('.product-image-wrap picture img');
            const source = card.querySelector('.product-image-wrap picture source');
            if (img) img.src = imageUrl;
            if (source) source.srcset = imageUrl;
        });
        window.colour_filter = previous;
    }

    /** Re-binds the per-card behaviour that assets/jquery.js and collection.js bind on page load */
    afterRender() {
        const $ = window.jQuery;
        if (!$) return;
        const $grid = $(this.grid);
        const isTouch = () => typeof window.is_touch_device === 'function' && window.is_touch_device();
        const imageParts = (el) => {
            const parent = $(el).closest('.item');
            return [parent.find('.product-image-wrap picture img'), parent.find('.product-image-wrap picture source'), parent];
        };

        $grid.find('.swatch-colours li span').hover(function () {
            if (isTouch()) return;
            const [$img, $source] = imageParts(this);
            if (!$img.attr('data-src')) {
                $img.data('src', $img.attr('src'));
                $source.data('src', $source.attr('srcset'));
            }
            $img.attr('src', $(this).data('image-url'));
            $source.attr('srcset', $(this).data('image-url'));
        }, function () {
            if (isTouch()) return;
            const [$img, $source] = imageParts(this);
            $img.attr('src', $img.data('src'));
            $source.attr('srcset', $source.data('src'));
        });

        $grid.find('.swatch-colours .mobile-interactive').on('click', function () {
            const $li = $(this).parent().parent();
            const url = $(this).parent().find('a').prop('href');
            const imageUrl = $(this).parent().data('image-url');
            const [$img, $source, $card] = imageParts($(this).parent());
            $li.parent().find('.selected').removeClass('selected');
            $li.addClass('selected');
            if (!$img.attr('data-src')) {
                $img.data('src', $img.attr('src'));
                $source.data('src', $source.attr('srcset'));
            }
            $img.attr('src', imageUrl);
            $source.attr('srcset', imageUrl);
            $card.find('.product-image-wrap a, .product-name a, .buttons-set a').attr('href', url);
        });

        $grid.find('.swatch-colours li').on('mouseenter', function () {
            if (!isTouch()) $(this).parent().find('.selected').removeClass('selected');
        });

        if ($.fn.matchHeight) $grid.find('.item .product-name').matchHeight();
    }
}

const configEl = document.getElementById('tag-filters-config');
if (configEl) {
    try {
        new TagFilters(JSON.parse(configEl.textContent));
    } catch (error) {
        console.error('Tag filters:', error);
    }
}
