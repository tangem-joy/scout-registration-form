/**
 * script.js — Scout Registration Form
 *
 * Handles:
 *  - Client-side validation (BD mobile format)
 *  - Conditional scouting-details field
 *  - Progress bar update
 *  - Character counter for textarea
 *  - Form submission via fetch() → Google Apps Script
 *  - Success / error toast messages
 *  - Loading state & multi-submit guard
 */

'use strict';

/* ============================================================
   ⚙️  CONFIGURATION
   Replace the URL below with your deployed Google Apps Script
   Web App URL after following the README setup steps.
   ============================================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCLeC9kAeyqpO5R3By-XBwODWGfZRqf-vxZDoaz7eqKPCYcDxDGNNXoQZXIKiWwwjTcw/exec";

/* ============================================================
   CONSTANTS & REGEX
   ============================================================ */
// Bangladeshi mobile numbers start with 01 followed by
// 3–9 then 8 more digits (total 11 digits).
const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const form           = document.getElementById('registrationForm');
const submitBtn      = document.getElementById('submitBtn');
const progressBar    = document.getElementById('progressBar');
const toastContainer = document.getElementById('toastContainer');
const detailsGroup   = document.getElementById('group-details');
const detailsTextarea = document.getElementById('scouting_details');
const detailsCount   = document.getElementById('detailsCount');
const radioYes       = document.getElementById('exp-yes');
const radioNo        = document.getElementById('exp-no');
const radioGenderMale   = document.getElementById('gender-male');
const radioGenderFemale = document.getElementById('gender-female');

/* ============================================================
   STATE
   ============================================================ */
let isSubmitting = false; // Guard against duplicate submissions

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

/**
 * Validates a Bangladeshi mobile number string.
 * @param {string} value
 * @returns {boolean}
 */
function isBDMobile(value) {
  return BD_MOBILE_REGEX.test(value.trim());
}

/**
 * Sets a field to error state.
 * @param {HTMLElement} fieldGroup - The .field-group container
 * @param {string}      errorId    - ID of the error <span>
 * @param {string}      message    - Error text to display
 */
function setError(fieldGroup, errorId, message) {
  fieldGroup.classList.add('has-error');
  const input = fieldGroup.querySelector('.field-input');
  if (input) {
    input.classList.add('is-error');
    input.classList.remove('is-valid');
    input.setAttribute('aria-invalid', 'true');
  }
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;
}

/**
 * Sets a field to valid state.
 * @param {HTMLElement} fieldGroup
 * @param {string}      errorId
 */
function setValid(fieldGroup, errorId) {
  fieldGroup.classList.remove('has-error');
  const input = fieldGroup.querySelector('.field-input');
  if (input) {
    input.classList.remove('is-error');
    input.classList.add('is-valid');
    input.setAttribute('aria-invalid', 'false');
  }
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = '';
}

/**
 * Clears validation state (neutral).
 * @param {HTMLElement} fieldGroup
 * @param {string}      errorId
 */
function clearValidation(fieldGroup, errorId) {
  fieldGroup.classList.remove('has-error');
  const input = fieldGroup.querySelector('.field-input');
  if (input) {
    input.classList.remove('is-error', 'is-valid');
    input.removeAttribute('aria-invalid');
  }
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = '';
}

/* ============================================================
   FIELD VALIDATORS
   Returns true if valid, false if error.
   ============================================================ */

function validateName() {
  const group = document.getElementById('group-name');
  const value = document.getElementById('name').value.trim();
  if (!value) {
    setError(group, 'name-error', 'নাম অবশ্যই পূরণ করতে হবে।');
    return false;
  }
  if (value.length < 2) {
    setError(group, 'name-error', 'নামটি কমপক্ষে ২ অক্ষরের হতে হবে।');
    return false;
  }
  setValid(group, 'name-error');
  return true;
}

function validateMobile() {
  const group = document.getElementById('group-mobile');
  const value = document.getElementById('mobile').value.trim();
  if (!value) {
    setError(group, 'mobile-error', 'মোবাইল নম্বর অবশ্যই পূরণ করতে হবে।');
    return false;
  }
  if (!isBDMobile(value)) {
    setError(group, 'mobile-error', 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)।');
    return false;
  }
  setValid(group, 'mobile-error');
  return true;
}

function validateWhatsApp() {
  const group = document.getElementById('group-whatsapp');
  const value = document.getElementById('whatsapp').value.trim();
  if (!value) {
    setError(group, 'whatsapp-error', 'WhatsApp নম্বর অবশ্যই পূরণ করতে হবে।');
    return false;
  }
  if (!isBDMobile(value)) {
    setError(group, 'whatsapp-error', 'সঠিক বাংলাদেশি WhatsApp নম্বর দিন (01XXXXXXXXX)।');
    return false;
  }
  setValid(group, 'whatsapp-error');
  return true;
}

function validateInstitution() {
  const group = document.getElementById('group-institution');
  const value = document.getElementById('institution').value.trim();
  if (!value) {
    setError(group, 'institution-error', 'প্রতিষ্ঠানের নাম অবশ্যই পূরণ করতে হবে।');
    return false;
  }
  setValid(group, 'institution-error');
  return true;
}

function validateClass() {
  const group = document.getElementById('group-class');
  const value = document.getElementById('class').value;
  if (!value) {
    setError(group, 'class-error', 'অনুগ্রহ করে আপনার ক্লাস নির্বাচন করুন।');
    return false;
  }
  setValid(group, 'class-error');
  return true;
}

function validateGender() {
  const group = document.getElementById('group-gender');
  const selected = form.querySelector('input[name="gender"]:checked');
  const errorEl = document.getElementById('gender-error');
  if (!selected) {
    group.classList.add('has-error');
    if (errorEl) errorEl.textContent = 'অনুগ্রহ করে জেন্ডার নির্বাচন করুন।';
    return false;
  }
  group.classList.remove('has-error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validateExperience() {
  const group = document.getElementById('group-experience');
  const selected = form.querySelector('input[name="scouting_experience"]:checked');
  const errorEl = document.getElementById('experience-error');
  if (!selected) {
    group.classList.add('has-error');
    if (errorEl) errorEl.textContent = 'অনুগ্রহ করে হ্যাঁ বা না নির্বাচন করুন।';
    return false;
  }
  group.classList.remove('has-error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

/**
 * Runs all validators and returns true only if all pass.
 * @returns {boolean}
 */
function validateAll() {
  const results = [
    validateName(),
    validateMobile(),
    validateWhatsApp(),
    validateInstitution(),
    validateClass(),
    validateGender(),
    validateExperience(),
  ];
  return results.every(Boolean);
}

/* ============================================================
   PROGRESS BAR
   Calculates form completion percentage based on filled fields.
   ============================================================ */

function updateProgress() {
  const fields = [
    document.getElementById('name').value.trim(),
    document.getElementById('mobile').value.trim(),
    document.getElementById('whatsapp').value.trim(),
    document.getElementById('institution').value.trim(),
    document.getElementById('class').value,
    form.querySelector('input[name="gender"]:checked') ? 'yes' : '',
    form.querySelector('input[name="scouting_experience"]:checked') ? 'yes' : '',
  ];

  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);
  progressBar.style.width = pct + '%';
}

/* ============================================================
   CONDITIONAL SCOUTING DETAILS
   ============================================================ */

function toggleScoutingDetails() {
  const selected = form.querySelector('input[name="scouting_experience"]:checked');
  if (selected && selected.value === 'হ্যাঁ') {
    detailsGroup.classList.add('visible');
    // Trigger re-animation
    detailsGroup.style.animation = 'none';
    void detailsGroup.offsetWidth; // reflow
    detailsGroup.style.animation = '';
  } else {
    detailsGroup.classList.remove('visible');
    detailsTextarea.value = ''; // clear when hidden
    if (detailsCount) detailsCount.textContent = '0';
  }
}

/* ============================================================
   CHARACTER COUNTER
   ============================================================ */

if (detailsTextarea && detailsCount) {
  detailsTextarea.addEventListener('input', () => {
    detailsCount.textContent = detailsTextarea.value.length;
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */

/**
 * Displays a toast message inside the form card.
 * @param {'success'|'error'} type
 * @param {string}            message
 */
function showToast(type, message) {
  // Remove any existing toasts
  toastContainer.innerHTML = '';

  const icon = type === 'success' ? '✅' : '❌';
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Scroll into view
  toast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-dismiss success after 6 seconds
  if (type === 'success') {
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 6000);
  }
}

/* ============================================================
   LOADING STATE
   ============================================================ */

function setLoading(loading) {
  isSubmitting = loading;
  submitBtn.disabled = loading;
  if (loading) {
    submitBtn.classList.add('is-loading');
  } else {
    submitBtn.classList.remove('is-loading');
  }
}

/* ============================================================
   FORM SUBMISSION
   ============================================================ */

async function submitForm(data) {
  /**
   * URLSearchParams is the most reliable method for Google Apps Script.
   * GAS automatically parses URL-encoded POST bodies into e.parameter.
   * This avoids all CORS and JSON parsing issues.
   */
  const params = new URLSearchParams();
  params.append('name',                data.name);
  params.append('mobile',              data.mobile);
  params.append('whatsapp',            data.whatsapp);
  params.append('institution',         data.institution);
  params.append('class',               data.class);
  params.append('subject_group',       data.subject_group);
  params.append('gender',              data.gender);
  params.append('scouting_experience', data.scouting_experience);
  params.append('scouting_details',    data.scouting_details);

  await fetch(SCRIPT_URL, {
    method: 'POST',
    body: params,
    mode: 'no-cors', // Required for GAS — response will be opaque but data IS saved
  });

  // With no-cors, any resolved promise = success (network errors throw)
  return true;
}

/* ============================================================
   FORM RESET
   ============================================================ */

function resetForm() {
  form.reset();
  progressBar.style.width = '0%';
  detailsGroup.classList.remove('visible');
  if (detailsCount) detailsCount.textContent = '0';

  // Clear all validation states
  form.querySelectorAll('.field-input').forEach(el => {
    el.classList.remove('is-valid', 'is-error');
    el.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
  });
  form.querySelectorAll('.field-group').forEach(el => {
    el.classList.remove('has-error');
  });
}

/* ============================================================
   COLLECT FORM DATA
   ============================================================ */

function collectData() {
  return {
    name:                document.getElementById('name').value.trim(),
    mobile:              document.getElementById('mobile').value.trim(),
    whatsapp:            document.getElementById('whatsapp').value.trim(),
    institution:         document.getElementById('institution').value.trim(),
    class:               document.getElementById('class').value,
    subject_group:       document.getElementById('subject_group').value.trim(),
    gender:              (form.querySelector('input[name="gender"]:checked') || {}).value || '',
    scouting_experience: (form.querySelector('input[name="scouting_experience"]:checked') || {}).value || '',
    scouting_details:    detailsTextarea.value.trim(),
  };
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */

// Inline validation on blur (after first touch)
document.getElementById('name').addEventListener('blur', validateName);
document.getElementById('mobile').addEventListener('blur', validateMobile);
document.getElementById('whatsapp').addEventListener('blur', validateWhatsApp);
document.getElementById('institution').addEventListener('blur', validateInstitution);
document.getElementById('class').addEventListener('change', validateClass);

// Progress & radio toggle
form.addEventListener('input', updateProgress);
form.addEventListener('change', updateProgress);

[radioYes, radioNo].forEach(radio => {
  if (radio) radio.addEventListener('change', toggleScoutingDetails);
});

// Only allow digits in tel fields
['mobile', 'whatsapp'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('keypress', e => {
    if (!/\d/.test(e.key) && !['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  });
  el.addEventListener('paste', e => {
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d+$/.test(pasted)) e.preventDefault();
  });
});

// Main form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Guard against duplicate submissions
  if (isSubmitting) return;

  // Clear previous toast
  toastContainer.innerHTML = '';

  // Validate all fields
  if (!validateAll()) {
    // Scroll to the first error
    const firstError = form.querySelector('.has-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = firstError.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }
    return;
  }

  // Check Script URL is configured
  if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    showToast(
      'error',
      '⚠️ Script URL কনফিগার করা হয়নি। অনুগ্রহ করে script.js-এ SCRIPT_URL সেট করুন।'
    );
    return;
  }

  const data = collectData();

  // Start loading
  setLoading(true);

  try {
    await submitForm(data);

    // Success
    showToast('success', 'আপনার তথ্য সফলভাবে জমা হয়েছে। ধন্যবাদ। 🎉');
    resetForm();
  } catch (err) {
    console.error('Submission error:', err);
    showToast(
      'error',
      'তথ্য জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
    );
  } finally {
    setLoading(false);
  }
});

/* ============================================================
   INIT
   ============================================================ */
// Set initial progress
updateProgress();
