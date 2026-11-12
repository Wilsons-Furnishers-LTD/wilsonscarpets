/*
 * Book a home visit (sections/home-visit-form.liquid)
 * One question per step, Tally style: Next/Back, progress bar, Enter to continue,
 * letter keys to pick a choice, and single choices move on automatically.
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

    const validate = (step) => {
        if (step.dataset.type === 'contact') {
            const [name, email, phone] = step.querySelectorAll('.hv__input');
            if (!name.value.trim()) return [name, 'Please tell us your name.'];
            if (!emailOk(email.value.trim())) return [email, 'Please enter a valid email address.'];
            if (!phoneOk(phone.value)) return [phone, 'Please enter a valid phone number.'];
            return null;
        }
        const qs = questionsIn(step);
        for (const q of qs) {
            if (q.hasAttribute('data-required') && !isAnswered(q)) {
                const msg = qs.length > 1 ? `Please answer "${q.dataset.hvLabel}".` : 'Please answer this question to continue.';
                return [q.querySelector('input, textarea'), msg];
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
        const field = step.querySelector('.hv__input');
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

    const collectAnswers = () => {
        const answers = {};
        root.querySelectorAll('[data-hv-label]').forEach((step) => {
            const label = step.dataset.hvLabel;
            const type = step.dataset.type;
            let value;
            if (type === 'single') {
                value = step.querySelector('input[type="radio"]:checked')?.value;
            } else if (type === 'multiple') {
                const picked = [...step.querySelectorAll('[data-hv-multi]:checked')].map((c) => c.value);
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
            const picked = [...step.querySelectorAll('[data-hv-multi]:checked')].map((c) => c.value);
            step.querySelector('[data-hv-multi-target]').value = picked.join(', ');
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

    // Keyboard: Enter continues, letters pick choices
    // Listen on the document so keys work before anything in the form has focus,
    // but leave the header search, newsletter popup etc. alone.
    document.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (!root.contains(e.target) && e.target !== document.body) return;
        const step = steps[current];
        const inText = e.target.matches('input[type="text"], input[type="email"], input[type="tel"], textarea');

        if (e.key === 'Enter') {
            if (e.target.tagName === 'TEXTAREA' && e.shiftKey) return; // new line
            if (e.target.tagName === 'BUTTON') return; // let the button handle it
            e.preventDefault();
            next();
            return;
        }

        if (!inText && /^[a-z]$/i.test(e.key)) {
            const options = step.querySelectorAll('.hv__option input');
            const input = options[e.key.toUpperCase().charCodeAt(0) - 65];
            if (!input) return;
            e.preventDefault();
            if (input.type === 'radio') {
                input.checked = true;
            } else {
                input.checked = !input.checked;
            }
            input.focus();
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    root.classList.add('is-ready');
    render();
    if (current !== 0) focusStep();
})();
