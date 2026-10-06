/* ==========================================================================
   Awakening Culture Technology — site runtime
   No dependencies. Reads configuration and translations from window.__AWA__.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.__AWA__ || {};
  var LANG = CFG.lang || 'en';
  var DEFAULT_LANG = CFG.defaultLang || 'en';
  var STRINGS = CFG.i18n || {};
  var PRODUCTS = CFG.products || [];
  var CONF = CFG.config || {};

  var CART_KEY = 'awa.cart.v1';
  var LANG_KEY = 'awa.lang';

  /* ------------------------------- Helpers ------------------------------- */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function t(key, fallback) {
    return STRINGS[key] || fallback || key;
  }
  function fmt(template, value) {
    return String(template).replace('%s', value);
  }
  function money(value) {
    if (value == null) return t('ui.priceOnRequest', 'Price on request');
    return 'US$' + Number(value).toLocaleString('en-US');
  }
  function product(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    return null;
  }
  function asset(rel) {
    return (LANG === DEFAULT_LANG ? '' : '../') + rel;
  }

  var toastTimer;
  function toast(message) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 3200);
  }

  /* --------------------------- Translation pass --------------------------- */
  function applyTranslations() {
    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = STRINGS[key];
      if (value != null && value !== '') el.textContent = value;
    });
    $$('[data-i18n-placeholder]').forEach(function (el) {
      var value = STRINGS[el.getAttribute('data-i18n-placeholder')];
      if (value) el.setAttribute('placeholder', value);
    });
    $$('[data-i18n-aria-label]').forEach(function (el) {
      var value = STRINGS[el.getAttribute('data-i18n-aria-label')];
      if (value) el.setAttribute('aria-label', value);
    });
    var html = document.documentElement;
    var langMeta = { en: 'en', zh: 'zh-CN', es: 'es', de: 'de', fr: 'fr', ru: 'ru' }[LANG];
    if (langMeta) html.setAttribute('lang', langMeta);
  }

  /* ------------------------------- Header -------------------------------- */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------- Mobile drawer ---------------------------- */
  function initDrawer() {
    var drawer = $('[data-drawer]');
    if (!drawer) return;
    function open() {
      drawer.hidden = false;
      requestAnimationFrame(function () {
        drawer.classList.add('is-open');
      });
      document.body.classList.add('is-locked');
    }
    function close() {
      drawer.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      setTimeout(function () {
        drawer.hidden = true;
      }, 320);
    }
    $$('[data-drawer-open]').forEach(function (b) {
      b.addEventListener('click', open);
    });
    $$('[data-drawer-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
  }

  /* --------------------------- Language switcher -------------------------- */
  function initLanguage() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {}
    if (stored && stored !== LANG) {
      // Visitor's stored preference differs from this page's language: only
      // redirect once, and only on the homepage, so deep links are not hijacked.
      var isHome = /(^|\/)(index\.html)?$/.test(location.pathname);
      if (isHome) {
        location.replace(targetUrl(stored));
        return;
      }
    }

    $$('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = btn.getAttribute('data-lang');
        try {
          localStorage.setItem(LANG_KEY, code);
        } catch (e) {}
        if (code !== LANG) location.href = targetUrl(code);
      });
    });

    var wrap = $('[data-lang-switch]');
    if (wrap) {
      var trigger = $('.lang__btn', wrap);
      var menu = $('.lang__menu', wrap);
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function () {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /** Build the equivalent URL for another language, preserving the page. */
  function targetUrl(code) {
    var parts = location.pathname.split('/').filter(Boolean);
    var known = ['zh', 'es', 'de', 'fr', 'ru'];
    if (parts.length && known.indexOf(parts[0]) !== -1) parts.shift();
    var rel = parts.join('/');
    if (!rel || rel === 'index.html') rel = 'index.html';
    var prefix = code === DEFAULT_LANG ? '' : code + '/';
    return '/' + prefix + rel + location.search + location.hash;
  }

  /* ------------------------------ Accordions ------------------------------ */
  function initAccordions() {
    $$('[data-acc]').forEach(function (acc) {
      $$('.acc__item', acc).forEach(function (item) {
        var btn = $('.acc__btn', item);
        var panel = $('.acc__panel', item);
        if (!btn || !panel) return;
        btn.addEventListener('click', function () {
          var isOpen = item.classList.contains('is-open');
          // Single-open behaviour keeps long FAQ lists scannable.
          $$('.acc__item.is-open', acc).forEach(function (other) {
            if (other === item) return;
            other.classList.remove('is-open');
            $('.acc__btn', other).setAttribute('aria-expanded', 'false');
            $('.acc__panel', other).style.maxHeight = '0px';
          });
          if (isOpen) {
            item.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            panel.style.maxHeight = '0px';
          } else {
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            panel.style.maxHeight = panel.scrollHeight + 24 + 'px';
          }
        });
      });
    });
  }

  /* --------------------------- Reveal on scroll --------------------------- */
  function initReveal() {
    var targets = $$('.card, .feature__media, .pcard, .post, .stat, .tl-item, .step');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  }

  /* -------------------------------- Cart --------------------------------- */
  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }
  function writeCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
    updateCartBadge();
    document.dispatchEvent(new CustomEvent('cart:change', { detail: cart }));
  }
  function cartCount(cart) {
    return Object.keys(cart).reduce(function (n, key) {
      return n + (cart[key] || 0);
    }, 0);
  }
  function updateCartBadge() {
    var count = cartCount(readCart());
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }
  function addToCart(slug, qty) {
    var cart = readCart();
    cart[slug] = (cart[slug] || 0) + (qty || 1);
    writeCart(cart);
    var p = product(slug);
    toast((p ? p.name + ' — ' : '') + t('ui.cartAdded', 'Added to cart'));
  }

  function initCartButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-add-cart]') : null;
      if (!btn) return;
      e.preventDefault();
      addToCart(btn.getAttribute('data-add-cart'), 1);
    });
  }

  /* ---------------------------- Cart page view ---------------------------- */
  function initCartPage() {
    var page = $('[data-cart-page]');
    if (!page) return;
    var linesEl = $('[data-cart-lines]', page);
    var summaryEl = $('[data-cart-summary]', page);

    function render() {
      var cart = readCart();
      var slugs = Object.keys(cart).filter(function (s) {
        return cart[s] > 0;
      });

      if (!slugs.length) {
        linesEl.innerHTML =
          '<div class="card text-center" style="padding:3rem 1.5rem">' +
          '<p style="font-size:1.15rem;font-weight:600">' +
          t('ui.cartEmpty', 'Your cart is empty.') +
          '</p>' +
          '<p class="muted small mt-1">' +
          t('ui.cartEmptyHint', '') +
          '</p>' +
          '<div class="row mt-3" style="justify-content:center">' +
          '<a class="btn" href="' +
          asset('products.html') +
          '">' +
          t('ui.continueShopping', 'Continue shopping') +
          '</a>' +
          '<a class="btn btn--ghost" href="' +
          asset('contact.html') +
          '">' +
          t('ui.contactUs', 'Contact us') +
          '</a></div></div>';
        summaryEl.innerHTML = '';
        return;
      }

      var subtotal = 0;
      var quoteOnly = false;
      var rows = slugs
        .map(function (slug) {
          var p = product(slug);
          if (!p) return '';
          var qty = cart[slug];
          if (p.price == null) quoteOnly = true;
          else subtotal += p.price * qty;
          return (
            '<div class="cart-line" data-line="' +
            slug +
            '">' +
            '<a class="cart-line__media" href="' +
            asset('products/' + slug + '.html') +
            '"><img src="' +
            asset('assets/img/' + p.image) +
            '" alt="" loading="lazy"></a>' +
            '<div>' +
            '<p class="cart-line__title"><a href="' +
            asset('products/' + slug + '.html') +
            '">' +
            escapeHtml(p.name) +
            '</a></p>' +
            '<p class="cart-line__meta mono">' +
            escapeHtml(p.sku) +
            ' · ' +
            t('ui.moq', 'MOQ') +
            ': ' +
            escapeHtml(p.moq) +
            '</p>' +
            '<div class="row mt-2" style="gap:0.75rem">' +
            '<span class="qty">' +
            '<button type="button" data-qty="-1" aria-label="' +
            t('ui.remove', 'Remove') +
            '">−</button>' +
            '<input type="number" min="1" value="' +
            qty +
            '" data-qty-input aria-label="' +
            t('ui.quantity', 'Quantity') +
            '">' +
            '<button type="button" data-qty="1" aria-label="' +
            t('ui.addToCart', 'Add') +
            '">+</button>' +
            '</span>' +
            '<button class="link-arrow xs" type="button" data-remove>' +
            t('ui.remove', 'Remove') +
            '</button>' +
            '</div></div>' +
            '<div class="cart-line__price">' +
            '<strong>' +
            (p.price == null ? t('ui.priceOnRequest', 'Price on request') : money(p.price * qty)) +
            '</strong>' +
            (p.price == null ? '' : '<br><span class="xs muted">' + money(p.price) + ' × ' + qty + '</span>') +
            '</div></div>'
          );
        })
        .join('');

      linesEl.innerHTML =
        '<h2 style="font-size:var(--fs-h3);margin-bottom:0.5rem">' +
        t('ui.yourCart', 'Your cart') +
        '</h2>' +
        '<p class="small muted mb-2">' +
        fmt(t('ui.itemCountTemplate', '%s item(s)'), cartCount(cart)) +
        '</p>' +
        rows +
        '<p class="xs muted mt-3">' +
        t('ui.cartNote', '') +
        '</p>' +
        '<div class="row mt-3"><a class="link-arrow" href="' +
        asset('products.html') +
        '">' +
        t('ui.continueShopping', 'Continue shopping') +
        '</a></div>';

      summaryEl.innerHTML =
        '<h2 style="font-size:var(--fs-h4)">' +
        t('ui.estimatedTotal', 'Estimated total') +
        '</h2>' +
        '<div class="summary__row"><span>' +
        fmt(t('ui.subtotalTemplate', 'Subtotal'), cartCount(cart)) +
        '</span><span>' +
        money(subtotal) +
        '</span></div>' +
        (quoteOnly
          ? '<div class="summary__row"><span>' +
            t('ui.priceOnRequest', 'Price on request') +
            '</span><span>—</span></div>'
          : '') +
        '<div class="summary__row"><span>' +
        t('ui.incoterms', 'Incoterms') +
        '</span><span>EXW / FOB</span></div>' +
        '<div class="summary__row summary__row--total"><span>' +
        t('ui.estimatedTotal', 'Estimated total') +
        '</span><span>' +
        money(subtotal) +
        '</span></div>' +
        '<a class="btn btn--gold btn--block mt-3" href="' +
        asset('contact.html') +
        '">' +
        t('ui.checkout', 'Proceed to checkout') +
        '</a>' +
        '<p class="xs muted mt-2">' +
        t('ui.checkoutNote', '') +
        '</p>' +
        (CONF.stripePaymentLink
          ? '<a class="btn btn--ghost btn--block mt-2" href="' +
            CONF.stripePaymentLink +
            '" rel="noopener">Stripe</a>'
          : '') +
        (CONF.paypalClientId ? '<div id="paypal-button" class="mt-2"></div>' : '');
    }

    linesEl.addEventListener('click', function (e) {
      var line = e.target.closest('[data-line]');
      if (!line) return;
      var slug = line.getAttribute('data-line');
      var cart = readCart();
      if (e.target.closest('[data-remove]')) {
        delete cart[slug];
        writeCart(cart);
        render();
        return;
      }
      var delta = e.target.closest('[data-qty]');
      if (delta) {
        var step = parseInt(delta.getAttribute('data-qty'), 10);
        cart[slug] = Math.max(1, (cart[slug] || 1) + step);
        writeCart(cart);
        render();
      }
    });

    linesEl.addEventListener('change', function (e) {
      var input = e.target.closest('[data-qty-input]');
      if (!input) return;
      var line = input.closest('[data-line]');
      var cart = readCart();
      cart[line.getAttribute('data-line')] = Math.max(1, parseInt(input.value, 10) || 1);
      writeCart(cart);
      render();
    });

    document.addEventListener('cart:change', render);
    render();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------ Catalogue ------------------------------- */
  function initCatalog() {
    var root = $('[data-catalog]');
    if (!root) return;
    var grid = $('[data-catalog-grid]', root);
    var cards = $$('.pcard', grid);
    var countEl = $('[data-catalog-count]', root);
    var emptyEl = $('[data-catalog-empty]', root);
    var searchEl = $('[data-catalog-search]', root);
    var filterEls = $$('[data-filter]', root);
    var active = 'all';

    function apply() {
      var term = (searchEl && searchEl.value ? searchEl.value : '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var okCat = active === 'all' || card.getAttribute('data-product') === active;
        var haystack = (card.getAttribute('data-name') || '') + ' ' + card.textContent.toLowerCase();
        var okTerm = !term || haystack.indexOf(term) !== -1;
        var visible = okCat && okTerm;
        card.style.display = visible ? '' : 'none';
        if (visible) shown++;
      });
      if (countEl) countEl.textContent = fmt(t('ui.resultsTemplate', '%s products'), shown);
      if (emptyEl) emptyEl.hidden = shown !== 0;
    }

    filterEls.forEach(function (btn) {
      btn.addEventListener('click', function () {
        active = btn.getAttribute('data-filter');
        filterEls.forEach(function (other) {
          var on = other === btn;
          other.setAttribute('aria-pressed', on ? 'true' : 'false');
          other.classList.toggle('badge--outline', !on);
        });
        apply();
      });
    });
    if (searchEl) {
      var debounce;
      searchEl.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(apply, 140);
      });
    }
    apply();
  }

  /* -------------------------------- Gallery ------------------------------- */
  function initGallery() {
    var gallery = $('[data-gallery]');
    if (!gallery) return;
    var main = $('.gallery__main img', gallery);
    var thumbs = $$('[data-thumb]', gallery);
    var srcs = thumbs.map(function (b) {
      var im = $('img', b);
      return im ? im.getAttribute('src') : '';
    });
    thumbs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        thumbs.forEach(function (o) {
          o.classList.toggle('is-active', o === b);
        });
        if (main && srcs[i]) main.setAttribute('src', srcs[i]);
        void i;
      });
    });
  }

  /* --------------------------------- Forms -------------------------------- */
  function initForms() {
    $$('[data-inquiry]').forEach(function (form) {
      var success = $('[data-form-success]', form);
      var error = $('[data-form-error]', form);
      var submit = $('[data-submit]', form);
      var submitLabel = submit ? submit.querySelector('span') : null;
      var original = submitLabel ? submitLabel.textContent : '';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        error.classList.remove('is-visible');
        success.classList.remove('is-visible');

        var invalid = [];
        $$('[required]', form).forEach(function (el) {
          var field = el.closest('.field');
          var ok = el.type === 'checkbox' ? el.checked : String(el.value).trim() !== '';
          if (el.type === 'email' && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
          if (field) field.classList.toggle('has-error', !ok);
          if (!ok) invalid.push(el);
        });
        if (invalid.length) {
          invalid[0].focus();
          error.textContent = t('ui.formInvalid', 'Please complete the highlighted fields.');
          error.classList.add('is-visible');
          return;
        }

        var data = {};
        new FormData(form).forEach(function (value, key) {
          data[key] = value;
        });
        data.language = LANG;
        data.page = location.pathname;
        var cart = readCart();
        if (Object.keys(cart).length) {
          data.cart = Object.keys(cart)
            .map(function (slug) {
              var p = product(slug);
              return (p ? p.name + ' (' + p.sku + ')' : slug) + ' × ' + cart[slug];
            })
            .join('; ');
        }

        if (submit) submit.setAttribute('aria-disabled', 'true');
        if (submitLabel) submitLabel.textContent = t('ui.sending', 'Sending…');

        var endpoint = CONF.inquiryEndpoint;
        var finish = function (ok) {
          if (submit) submit.removeAttribute('aria-disabled');
          if (submitLabel) submitLabel.textContent = original;
          if (ok) {
            form.reset();
            success.classList.add('is-visible');
            success.scrollIntoView({ block: 'center', behavior: 'smooth' });
            writeCart({});
          } else {
            error.innerHTML =
              escapeHtml(t('ui.formError', 'Something went wrong. Please email us directly at')) +
              ' <a href="mailto:' +
              CONF.inquiryMailto +
              '">' +
              CONF.inquiryMailto +
              '</a>';
            error.classList.add('is-visible');
          }
        };

        if (!endpoint) {
          // No endpoint configured: hand off to the visitor's mail client with a
          // prefilled message so the inquiry still reaches a human.
          var body = Object.keys(data)
            .map(function (k) {
              return k + ': ' + data[k];
            })
            .join('\n');
          var subject = 'Website inquiry — ' + (data.name || 'new enquiry');
          var mailto =
            'mailto:' +
            CONF.inquiryMailto +
            '?subject=' +
            encodeURIComponent(subject) +
            '&body=' +
            encodeURIComponent(body);
          window.location.href = mailto;
          finish(true);
          return;
        }

        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
          .then(function (res) {
            finish(res.ok);
          })
          .catch(function () {
            finish(false);
          });
      });
    });

    $$('[data-newsletter]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
          if (input) input.focus();
          return;
        }
        if (CONF.inquiryEndpoint) {
          fetch(CONF.inquiryEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ type: 'newsletter', email: input.value.trim(), language: LANG }),
          }).catch(function () {});
        }
        form.reset();
        toast(t('ui.subscribed', 'Thanks — you are subscribed.'));
      });
    });
  }

  /* --------------------------------- Boot --------------------------------- */
  function boot() {
    applyTranslations();
    initHeader();
    initDrawer();
    initLanguage();
    initAccordions();
    initReveal();
    initCartButtons();
    initCartPage();
    initCatalog();
    initGallery();
    initForms();
    updateCartBadge();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
