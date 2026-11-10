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
    const questionCount = steps.length - 1; // the intro isn't a question

    let current = Math.max(0, steps.findIndex((s) => s.classList.contains('is-active')));
    let autoAdvanceTimer;

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const phoneOk = (v) => v.replace(/\D/g, '').length >= 10;

    const hasAnswer = (step) => {
        const type = step.dataset.type;
        if (type === 'single') return !!step.querySelector('input[type="radio"]:checked');
        if (type === 'multiple') return !!step.querySelector('[data-hv-multi]:checked');
        const field = step.querySelector('.hv__input');
        return !!(field && field.value.trim());
    };

    const updateNextLabel = (step) => {
        const label = step.querySelector('[data-hv-next-label]');
        if (label) label.textContent = hasAnswer(step) ? 'Next' : 'Skip';
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
        if (step.hasAttribute('data-required') && !hasAnswer(step)) {
            return [step.querySelector('input, textarea'), 'Please answer this question to continue.'];
        }
        if (step.dataset.type === 'number') {
            const field = step.querySelector('.hv__input');
            const v = field.value.trim().replace(/[£,\s]/g, '');
            if (v && Number.isNaN(Number(v))) return [field, 'Please enter a number.'];
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

    const submit = () => {
        const btn = root.querySelector('[data-hv-submit]');
        btn.disabled = true;
        btn.textContent = 'Sending…';
        // Shopify's contact form ignores array fields, so multi choices go as one line.
        root.querySelectorAll('[data-type="multiple"]').forEach((step) => {
            const picked = [...step.querySelectorAll('[data-hv-multi]:checked')].map((c) => c.value);
            step.querySelector('[data-hv-multi-target]').value = picked.join(', ');
        });
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
        if (e.target.type === 'radio' && step === steps[current]) {
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
