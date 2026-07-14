class VariantUrlChange {
    constructor() {

        window.onload = () => {
            this.bindInit();
        }
    }
    bindInit() {
        this.colourValueChangeInUrl();
    }

    colourValueChangeInUrl() {
        const urlChanged = document.querySelectorAll('.js-get-colour-value');
        if (urlChanged) {
            urlChanged.forEach(getURlChanged => {
                getURlChanged.addEventListener("click", function () {
                    const urlChangedValue = getURlChanged.getAttribute('data-value')
                    history.replaceState({ urlChangedValue }, '', `${window.location.pathname}${urlChangedValue && '?'.concat(urlChangedValue)}`);

                });
            });
        }
    }
}

new VariantUrlChange();
