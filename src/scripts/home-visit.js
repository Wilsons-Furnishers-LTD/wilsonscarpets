/*
 * Book a home visit (sections/home-visit-form.liquid)
 * One question per step, Tally style: Next/Back, progress bar, Enter to continue,
 * and single choices move on automatically.
 */
(() => {
    const root = document.querySelector('[data-home-visit]');
    if (!root) return;

    const pushEvent = (event, params = {}) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event, ...params });
    };

    const success = root.querySelector('[data-hv-success]');
    if (success) {
        root.classList.remove('hv--loading');
        root.scrollIntoView({ block: 'start' });
        success.focus({ preventScroll: true });
        pushEvent('home_visit_form_submitted');
        return;
    }

    const form = root.querySelector('form');
    const steps = [...root.querySelectorAll('[data-hv-step]')];
    const progressEl = root.querySelector('[role="progressbar"]');
    const progressBar = root.querySelector('[data-hv-progress]');
    const backBtn = root.querySelector('[data-hv-back]');
    const counter = root.querySelector('[data-hv-counter]');
    const questionCount = steps.length - 1; // steps after the intro

    let current = Math.max(0, steps.findIndex((s) => s.classList.contains('is-active')));
    let autoAdvanceTimer;

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const phoneOk = (v) => v.replace(/\D/g, '').length >= 10;

    // A step holds one or more questions ([data-hv-question]); the intro and
    // contact steps hold none.
    const questionsIn = (step) => [...step.querySelectorAll('[data-hv-question]')];

    const isAnswered = (q) => {
        const type = q.dataset.type;
        if (type === 'single') return !!q.querySelector('input[type="radio"]:checked');
        if (type === 'multiple') return !!q.querySelector('[data-hv-multi]:checked');
        const field = q.querySelector('.hv__input');
        return !!(field && field.value.trim());
    };

    // "Skip" while nothing is answered and nothing on the step is required.
    const updateNextLabel = (step) => {
        const label = step.querySelector('[data-hv-next-label]');
        if (!label) return;
        const qs = questionsIn(step);
        const skippable = qs.every((q) => !q.hasAttribute('data-required')) && !qs.some(isAnswered);
        label.textContent = skippable ? 'Skip' : 'Next';
    };

    const showError = (step, message, field) => {
        step.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
        if (field && message) field.setAttribute('aria-invalid', 'true');
        const el = step.querySelector('[data-hv-error]');
        if (el) el.textContent = message || '';
        step.classList.toggle('has-error', !!message);
    };

    // ---- Address lookup ------------------------------------------------
    // Google Places Autocomplete (UK addresses) fills the address fields,
    // which stay editable. No key, a failed load, or "Enter address manually"
    // shows the fields to type in.
    const address = root.querySelector('[data-hv-address]');
    const addr = (part) => address?.querySelector(`[data-hv-addr="${part}"]`);
    const addressSearch = address?.querySelector('[data-hv-address-search]');
    const searchWrap = address?.querySelector('[data-hv-address-search-wrap]');
    const addressFields = address?.querySelector('[data-hv-address-fields]');
    const manualBtn = address?.querySelector('[data-hv-address-manual]');
    const postcodeOk = (v) => /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(v.trim());

    const showAddressFields = (focusPart) => {
        addressFields.hidden = false;
        if (manualBtn) manualBtn.hidden = true;
        if (focusPart) addr(focusPart).focus();
    };

    const useManualAddress = () => {
        if (searchWrap) searchWrap.hidden = true;
        showAddressFields();
    };

    const fillFromPlace = (place) => {
        const parts = {};
        (place.address_components || []).forEach((c) => c.types.forEach((t) => { parts[t] = c.long_name; }));
        const street = [parts.street_number, parts.route].filter(Boolean).join(' ');
        const building = [parts.subpremise, parts.premise].filter(Boolean).join(', ');
        addr('line1').value = building || street || (place.name ?? '');
        addr('line2').value = building && street ? street : '';
        addr('city').value = parts.postal_town || parts.locality || parts.administrative_area_level_2 || '';
        addr('postcode').value = parts.postal_code || '';
        showAddressFields();
        // No house number or postcode from Google: put them where they need to type.
        if (!parts.street_number && !building) addr('line1').focus();
        else if (!parts.postal_code) addr('postcode').focus();
        updateNextLabel(steps[current]);
    };

    const startAddressLookup = (key) => {
        window.gm_authFailure = useManualAddress; // Google calls this if the key is rejected
        window.hvInitAddressLookup = () => {
            if (!window.google?.maps?.places?.Autocomplete) return useManualAddress();
            const ac = new window.google.maps.places.Autocomplete(addressSearch, {
                componentRestrictions: { country: 'gb' },
                fields: ['address_components', 'name'],
                types: ['address'],
            });
            ac.addListener('place_changed', () => fillFromPlace(ac.getPlace()));
        };
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&loading=async&callback=hvInitAddressLookup`;
        script.async = true;
        script.onerror = useManualAddress;
        document.head.appendChild(script);
    };

    if (address) {
        const key = address.dataset.mapsKey;
        const alreadyFilled = [...addressFields.querySelectorAll('input')].some((i) => i.value.trim());
        if (key && !alreadyFilled) {
            searchWrap.hidden = false;
            addressFields.hidden = true;
            manualBtn.addEventListener('click', () => {
                useManualAddress();
                addr('line1').focus();
            });
            startAddressLookup(key);
        }
    }

    const validateAddress = () => {
        if (!address) return null;
        const required = address.hasAttribute('data-required');
        if (addressFields.hidden) {
            if (required || addressSearch.value.trim()) {
                return [addressSearch, 'Please choose your address from the list, or enter it manually.'];
            }
            return null;
        }
        if (required) {
            if (!addr('line1').value.trim()) return [addr('line1'), 'Please enter the first line of your address.'];
            if (!addr('city').value.trim()) return [addr('city'), 'Please enter your town or city.'];
            if (!addr('postcode').value.trim()) return [addr('postcode'), 'Please enter your postcode.'];
        }
        if (addr('postcode').value.trim() && !postcodeOk(addr('postcode').value)) {
            return [addr('postcode'), 'Please enter a valid UK postcode.'];
        }
        return null;
    };

    const validate = (step) => {
        if (step.dataset.type === 'contact') {
            const field = (n) => step.querySelector(`[name="contact[${n}]"]`);
            const [name, email, phone] = [field('name'), field('email'), field('phone')];
            if (!name.value.trim()) return [name, 'Please tell us your name.'];
            if (!emailOk(email.value.trim())) return [email, 'Please enter a valid email address.'];
            if (!phoneOk(phone.value)) return [phone, 'Please enter a valid phone number.'];
            return validateAddress();
        }
        const qs = questionsIn(step);
        for (const q of qs) {
            if (q.hasAttribute('data-required') && !isAnswered(q)) {
                const msg = qs.length > 1 ? `Please answer "${q.dataset.hvLabel}".` : 'Please answer this question to continue.';
                return [q.querySelector('input, textarea'), msg];
            }
            // Required question with "Other" picked: the "Please specify" box must be filled in too.
            const otherText = q.querySelector('[data-hv-other-text]');
            if (q.hasAttribute('data-required') && otherText && q.querySelector('[data-hv-other]:checked') && !otherText.value.trim()) {
                return [otherText, 'Please tell us a bit more about your "Other" answer.'];
            }
            if (q.dataset.type === 'number') {
                const field = q.querySelector('.hv__input');
                const v = field.value.trim().replace(/[£,\s]/g, '');
                if (v && Number.isNaN(Number(v))) return [field, 'Please enter a number.'];
            }
        }
        return null;
    };

    const render = (direction = 1) => {
        steps.forEach((step, i) => {
            const active = i === current;
            step.classList.toggle('is-active', active);
            step.classList.toggle('from-back', active && direction < 0);
            step.setAttribute('aria-hidden', active ? 'false' : 'true');
            step.inert = !active;
        });

        const pct = Math.round((current / (steps.length - 1)) * 100);
        progressBar.style.width = `${pct}%`;
        progressEl.setAttribute('aria-valuenow', pct);

        backBtn.hidden = current === 0;
        counter.textContent = current === 0 ? '' : `${current} of ${questionCount}`;
        updateNextLabel(steps[current]);
    };

    const focusStep = () => {
        const step = steps[current];
        const field = step.querySelector('.hv__input:not([data-hv-other-text])');
        const target = field || step;
        target.focus({ preventScroll: true });
        const top = root.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.4) {
            root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const goTo = (index) => {
        if (index < 0 || index >= steps.length || index === current) return;
        clearTimeout(autoAdvanceTimer);
        const direction = index > current ? 1 : -1;
        current = index;
        render(direction);
        focusStep();
        if (current === 1 && direction > 0) pushEvent('home_visit_form_started');
    };

    const next = () => {
        const step = steps[current];
        const problem = validate(step);
        if (problem) {
            showError(step, problem[1], problem[0]);
            problem[0]?.focus();
            return;
        }
        showError(step, '');
        if (current === steps.length - 1) {
            submit();
        } else {
            goTo(current + 1);
        }
    };

    // ---- Klaviyo -------------------------------------------------------
    // Uses Klaviyo's client API, which is made to be called from the browser
    // with the public site ID only. The Shopify email is the record of truth,
    // so a Klaviyo failure never stops the booking from being sent.
    const KLAVIYO_REVISION = '2024-10-15';
    const klaviyo = {
        key: root.dataset.klaviyoKey,
        list: root.dataset.klaviyoList,
        event: root.dataset.klaviyoEvent || 'Booked Home Visit',
    };

    // Klaviyo rejects the whole request if a phone isn't in +44... form, so
    // convert UK numbers and drop anything we can't make sense of.
    const toE164 = (raw) => {
        let d = raw.replace(/[^\d+]/g, '');
        if (d.startsWith('+')) return /^\+\d{8,15}$/.test(d) ? d : null;
        if (d.startsWith('00')) d = d.slice(2);
        else if (d.startsWith('0')) d = `44${d.slice(1)}`;
        else if (!d.startsWith('44')) return null;
        return /^44\d{9,10}$/.test(d) ? `+${d}` : null;
    };

    // The value sent for a ticked choice. An "Other" choice with text typed in
    // its box is sent as "Other: <text>".
    const choiceValue = (input) => {
        if (!input.hasAttribute('data-hv-other')) return input.value;
        const text = input.closest('[data-hv-question]')?.querySelector('[data-hv-other-text]')?.value.trim();
        return text ? `${input.value}: ${text}` : input.value;
    };

    const collectAnswers = () => {
        const answers = {};
        root.querySelectorAll('[data-hv-label]').forEach((step) => {
            const label = step.dataset.hvLabel;
            const type = step.dataset.type;
            let value;
            if (type === 'single') {
                const checked = step.querySelector('input[type="radio"]:checked');
                value = checked ? choiceValue(checked) : undefined;
            } else if (type === 'multiple') {
                const picked = [...step.querySelectorAll('[data-hv-multi]:checked')].map(choiceValue);
                value = picked.length ? picked : undefined;
            } else {
                value = step.querySelector('.hv__input')?.value.trim() || undefined;
                if (value && type === 'number') {
                    const n = Number(value.replace(/[£,\s]/g, ''));
                    if (!Number.isNaN(n)) value = n;
                }
            }
            if (value !== undefined) answers[label] = value;
        });
        return answers;
    };

    const klaviyoPost = (endpoint, data) =>
        fetch(`https://a.klaviyo.com/client/${endpoint}/?company_id=${encodeURIComponent(klaviyo.key)}`, {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json', revision: KLAVIYO_REVISION },
            body: JSON.stringify({ data }),
        }).then((res) => {
            if (!res.ok) throw new Error(`Klaviyo ${endpoint} ${res.status}`);
        });

    const sendToKlaviyo = (optedIn) => {
        if (!klaviyo.key) return Promise.resolve();
        const name = form.querySelector('[name="contact[name]"]').value.trim();
        const email = form.querySelector('[name="contact[email]"]').value.trim();
        const phone = toE164(form.querySelector('[name="contact[phone]"]').value);
        const [firstName, ...rest] = name.split(/\s+/);

        const profile = { email, first_name: firstName, last_name: rest.join(' ') || undefined };
        if (phone) profile.phone_number = phone;
        if (address && !addressFields.hidden && addr('line1').value.trim()) {
            profile.location = {
                address1: addr('line1').value.trim(),
                address2: addr('line2').value.trim() || undefined,
                city: addr('city').value.trim() || undefined,
                zip: addr('postcode').value.trim().toUpperCase() || undefined,
                country: 'United Kingdom',
            };
        }

        const requests = [
            klaviyoPost('events', {
                type: 'event',
                attributes: {
                    properties: { ...collectAnswers(), 'Marketing opt-in': optedIn, 'Page': window.location.pathname },
                    metric: { data: { type: 'metric', attributes: { name: klaviyo.event } } },
                    profile: { data: { type: 'profile', attributes: profile } },
                },
            }),
        ];

        if (optedIn && klaviyo.list) {
            requests.push(
                klaviyoPost('subscriptions', {
                    type: 'subscription',
                    attributes: {
                        custom_source: 'Book a home visit form',
                        profile: {
                            data: {
                                type: 'profile',
                                attributes: { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } },
                            },
                        },
                    },
                    relationships: { list: { data: { type: 'list', id: klaviyo.list } } },
                })
            );
        }

        return Promise.allSettled(requests).then((results) =>
            results.forEach((r) => r.status === 'rejected' && console.warn('[home-visit]', r.reason))
        );
    };

    // Honeypot filled in = a bot. Send nothing (no Shopify email, no Klaviyo)
    // but show the normal thank-you screen so it looks like it worked.
    const isBot = () => !!root.querySelector('[data-hv-honeypot]')?.value.trim();

    const fakeSuccess = () => {
        const thanks = root.querySelector('template[data-hv-thanks]');
        form.replaceChildren(thanks.content.cloneNode(true));
        root.scrollIntoView({ block: 'start' });
        form.querySelector('[data-hv-fake-success]')?.focus({ preventScroll: true });
    };

    const submit = async () => {
        const btn = root.querySelector('[data-hv-submit]');
        btn.disabled = true;
        btn.textContent = 'Sending…';

        if (isBot()) {
            fakeSuccess();
            return;
        }

        const consent = root.querySelector('[data-hv-consent]');
        const optedIn = !!consent?.checked;
        const consentValue = root.querySelector('[data-hv-consent-value]');
        if (consentValue) consentValue.value = optedIn ? 'Yes' : 'No';

        // Shopify's contact form ignores array fields, so multi choices go as one line.
        root.querySelectorAll('[data-type="multiple"]').forEach((step) => {
            const picked = [...step.querySelectorAll('[data-hv-multi]:checked')].map(choiceValue);
            step.querySelector('[data-hv-multi-target]').value = picked.join(', ');
        });
        // A picked "Other" radio sends "Other: <text>" as its value.
        root.querySelectorAll('input[type="radio"][data-hv-other]:checked').forEach((radio) => {
            radio.value = choiceValue(radio);
        });

        // Give Klaviyo up to 4 seconds, then send the form regardless.
        await Promise.race([sendToKlaviyo(optedIn), new Promise((r) => setTimeout(r, 4000))]);
        form.submit();
    };

    // Buttons
    root.addEventListener('click', (e) => {
        if (e.target.closest('[data-hv-next]')) next();
        if (e.target.closest('[data-hv-back]')) goTo(current - 1);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        next();
    });

    // Answer changes
    root.addEventListener('change', (e) => {
        const step = e.target.closest('[data-hv-step]');
        if (!step) return;
        showError(step, '');
        updateNextLabel(step);

        // Show the "Please specify" box while an "Other" choice is picked.
        const question = e.target.closest('[data-hv-question]');
        const otherWrap = question?.querySelector('[data-hv-other-wrap]');
        if (otherWrap && e.target.matches('.hv__option input')) {
            const otherPicked = !!question.querySelector('[data-hv-other]:checked');
            otherWrap.hidden = !otherPicked;
            if (otherPicked && e.target.hasAttribute('data-hv-other')) {
                clearTimeout(autoAdvanceTimer);
                otherWrap.querySelector('[data-hv-other-text]').focus();
                return; // stay on the step so they can type
            }
        }

        // Only jump ahead when the step is a single question; with several on
        // one step the customer may still want to answer the others.
        if (e.target.type === 'radio' && step === steps[current] && questionsIn(step).length === 1) {
            clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = setTimeout(next, 350);
        }
    });

    root.addEventListener('input', (e) => {
        const step = e.target.closest('[data-hv-step]');
        if (!step) return;
        if (step.classList.contains('has-error')) showError(step, '');
        updateNextLabel(step);
        const count = step.querySelector('[data-hv-count]');
        if (count && e.target.tagName === 'TEXTAREA') count.textContent = e.target.value.length;
    });

    // Keyboard: Enter continues
    // Listen on the document so keys work before anything in the form has focus,
    // but leave the header search, newsletter popup etc. alone.
    document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (!root.contains(e.target) && e.target !== document.body) return;
        if (e.key === 'Enter') {
            if (e.target.tagName === 'TEXTAREA' && e.shiftKey) return; // new line
            if (e.target.matches('[data-hv-address-search]')) {
                e.preventDefault(); // Google uses Enter to pick the highlighted address
                return;
            }
            if (e.target.tagName === 'BUTTON') return; // let the button handle it
            e.preventDefault();
            next();
        }
    });

    root.classList.add('is-ready');
    root.classList.remove('hv--loading'); // hide the loading spinner
    render();
    if (current !== 0) focusStep();
})();
