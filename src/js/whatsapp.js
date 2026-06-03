/**
 * WhatsApp Form Handler
 * Karla Colin Maya | v1.0
 *
 * Builds a structured WhatsApp message from form data
 * and opens it via wa.me API.
 *
 * WhatsApp: +52 722 702 4348
 */

(function WhatsAppForms() {
  'use strict';

  const WA_NUMBER = '527227024348'; // Mexico +52
  const WA_BASE   = 'https://wa.me/';

  /**
   * Format a structured message for WhatsApp
   * @param {Object} data – form field key→value map
   * @returns {string} URL-encoded WhatsApp message
   */
  function buildMessage(data) {
    var lines = [
      '🌟 *Nueva consulta desde el sitio web*',
      '─────────────────────────',
    ];

    if (data.nombre)    lines.push('👤 *Nombre:* ' + data.nombre);
    if (data.empresa)   lines.push('🏢 *Empresa/Organización:* ' + data.empresa);
    if (data.email)     lines.push('📧 *Correo:* ' + data.email);
    if (data.telefono)  lines.push('📱 *Teléfono:* ' + data.telefono);
    if (data.servicio)  lines.push('🔹 *Servicio de interés:* ' + data.servicio);
    if (data.alcance)   lines.push('📍 *Alcance:* ' + data.alcance);
    if (data.fecha)     lines.push('📅 *Fecha tentativa:* ' + data.fecha);

    if (data.mensaje) {
      lines.push('─────────────────────────');
      lines.push('💬 *Mensaje:*');
      lines.push(data.mensaje);
    }

    lines.push('─────────────────────────');
    lines.push('_Enviado desde www.karlacolinmaya.mx_');

    return encodeURIComponent(lines.join('\n'));
  }

  /**
   * Open WhatsApp with built message
   * @param {string} msg – pre-encoded message
   */
  function openWhatsApp(msg) {
    var url = WA_BASE + WA_NUMBER + '?text=' + msg;
    // Use window.open so it works on desktop (opens web.whatsapp.com)
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Validate a single form field
   * @param {HTMLElement} field
   * @returns {boolean}
   */
  function validateField(field) {
    if (!field.checkValidity()) {
      field.setAttribute('aria-invalid', 'true');
      return false;
    }
    field.removeAttribute('aria-invalid');
    return true;
  }

  /**
   * Extract field values from a form element
   * @param {HTMLFormElement} form
   * @returns {Object}
   */
  function extractData(form) {
    var data = {};
    var fields = form.querySelectorAll('[name]');
    fields.forEach(function (field) {
      var key   = field.getAttribute('name');
      var value = (field.value || '').trim();
      if (value) data[key] = value;
    });
    return data;
  }

  /**
   * Show inline form error
   */
  function showError(field, message) {
    var errorEl = field.closest('.form_field');
    if (!errorEl) return;
    var errorMsg = errorEl.querySelector('.form_error');
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.style.display = 'block';
    }
    field.setAttribute('aria-invalid', 'true');
    field.focus();
  }

  /**
   * Clear all errors in a form
   */
  function clearErrors(form) {
    form.querySelectorAll('.form_error').forEach(function (el) {
      el.style.display = 'none';
      el.textContent = '';
    });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
  }

  /**
   * Handle form submit
   */
  function handleSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;

    clearErrors(form);

    // Validate all required fields
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      if (!validateField(field)) {
        if (valid) showError(field, 'Este campo es obligatorio.');
        valid = false;
      }
    });

    // Email format check
    var emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        showError(emailField, 'Por favor ingresa un correo válido.');
        valid = false;
      }
    }

    if (!valid) return;

    // Build and send
    var data    = extractData(form);
    var message = buildMessage(data);
    openWhatsApp(message);

    // Show success feedback
    var successEl = form.querySelector('.form_success');
    if (successEl) {
      form.querySelectorAll('.form_grid, .form_submit-area, .form_title').forEach(function (el) {
        el.style.display = 'none';
      });
      successEl.classList.add('is-visible');
      successEl.setAttribute('tabindex', '-1');
      successEl.focus();
    }

    // Reset form after delay
    setTimeout(function () {
      form.reset();
      if (successEl) {
        successEl.classList.remove('is-visible');
        form.querySelectorAll('.form_grid, .form_submit-area, .form_title').forEach(function (el) {
          el.style.display = '';
        });
      }
    }, 8000);
  }

  /**
   * Bind all contact forms on the page
   */
  function init() {
    document.querySelectorAll('[data-whatsapp-form]').forEach(function (form) {
      form.addEventListener('submit', handleSubmit);

      // Live validation on blur
      form.querySelectorAll('[required]').forEach(function (field) {
        field.addEventListener('blur', function () {
          validateField(field);
        });
        field.addEventListener('input', function () {
          if (field.value.trim()) {
            field.removeAttribute('aria-invalid');
            var errorEl = field.closest('.form_field');
            if (errorEl) {
              var err = errorEl.querySelector('.form_error');
              if (err) err.style.display = 'none';
            }
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.WhatsAppForms = { init: init, buildMessage: buildMessage };
}());
