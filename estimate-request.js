(() => {
  'use strict';
  const form = document.getElementById('quick-estimate');
  const status = document.getElementById('quote-status');
  const send = document.getElementById('quote-send');
  const track = (event, data = {}) => window.CFSAnalytics?.track(event, data);
  const text = document.getElementById('text-direct');
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  text.href = 'sms:+15806680147' + (ios ? '&' : '?') + 'body=' + encodeURIComponent('Hi, I would like a cleaning estimate. My city is: ');
  let pending = false;
  let sent = false;
  let started = false;
  form.addEventListener('input', () => {
    if (!started) { started = true; track('quote_start', {placement: 'estimate_page'}); }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || sent) return;
    if (!form.reportValidity()) return;
    const services = [...form.querySelectorAll('[name="service"]:checked')].map(item => item.value);
    const fail = (message, target) => { status.textContent = message; target?.focus(); };
    if (!services.length) { fail('Choose at least one cleaning service.', form.querySelector('[name="service"]')); return; }
    if (!form.elements.name.value.trim() || !form.elements.city.value.trim()) { fail('Please add your name and city.', !form.elements.name.value.trim() ? form.elements.name : form.elements.city); return; }
    const phone = form.elements.phone.value.trim();
    if (phone.replace(/\D/g, '').length < 10) { fail('Please enter your phone number, including the area code.', form.elements.phone); return; }
    const files = [...document.getElementById('photos').files];
    if (files.length > 3 || files.reduce((sum, file) => sum + file.size, 0) > 8000000) { fail('Choose up to 3 photos, with a total size of 8 MB or less.', document.getElementById('photos')); return; }
    if (files.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size)) { fail('Please choose nonempty JPG, PNG or WebP photos. You can also text photos instead.', document.getElementById('photos')); return; }
    if (form.elements._honey.value) return;
    const data = new FormData();
    const payload = {
      name: form.elements.name.value.trim(), phone,
      email: form.elements.email.value.trim(), service: services.join(', '),
      job_size: form.elements.job_size.value, city: form.elements.city.value.trim(),
      details: form.elements.details.value.trim() || 'None entered',
      _subject: 'NEW CarPET Friendly Estimate Request — ' + form.elements.name.value.trim(),
      _captcha: 'false', _template: 'table', _honey: '',
      request_source: 'Website estimate page'
    };
    // Fixed allowlist: never transmit arbitrary URL parameters or personal data to analytics.
    const url = new URL(location.href);
    const allowed = ['google', 'erics', 'facebook', 'van', 'referral'];
    const source = url.searchParams.get('source') || url.searchParams.get('utm_source');
    if (allowed.includes(source)) payload.request_source += ' / ' + source;
    Object.entries(payload).forEach(([key, value]) => data.append(key, value));
    files.forEach((file, index) => data.append(index ? 'attachment' + (index + 1) : 'attachment', file, file.name));
    pending = true;
    send.disabled = true;
    send.textContent = 'Sending…';
    status.textContent = 'Sending your request. Please keep this page open.';
    const controls = [...form.querySelectorAll('input, textarea, select')];
    controls.forEach(control => { control.disabled = true; });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/CarpetFriendlySolutions@gmail.com', {
        method: 'POST', headers: {Accept: 'application/json'}, body: data, signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Unconfirmed delivery');
      sent = true;
      status.textContent = 'Your estimate request was accepted. William or Rebecca will contact you to discuss pricing and appointment availability. Your appointment is not booked yet.';
      send.textContent = 'Request Sent ✓';
      track('generate_lead', {contact_method: 'online', placement: 'estimate_page', service_count: services.length, photo_count: files.length});
      form.reset();
    } catch (error) {
      status.textContent = 'We couldn’t confirm delivery. Your details and photos are still here. Call or text 580-668-0147 to check before retrying.';
      send.textContent = 'Send My Estimate Request';
      send.disabled = false;
      track('quote_submit_error', {placement: 'estimate_page', failure_type: error.name === 'AbortError' ? 'timeout' : 'unconfirmed'});
    } finally {
      clearTimeout(timer);
      pending = false;
      controls.forEach(control => { control.disabled = sent; });
    }
  });
})();
