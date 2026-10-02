(function () {
  'use strict';
  const measurementId = 'G-7HY8069S02';
  const production = ['carpetfriendlysolutions.com', 'www.carpetfriendlysolutions.com'].includes(location.hostname);
  const params = new URLSearchParams(location.search);
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  if (params.get('cfs_internal') === '1') write('cfs_internal', '1');
  if (params.get('cfs_internal') === '0') write('cfs_internal', '0');
  const internal = params.get('cfs_internal') === '1' || (params.get('cfs_internal') !== '0' && read('cfs_internal') === '1');
  const excluded = !production || internal || navigator.webdriver === true;
  let consent = read('cfs_analytics_consent');
  let started = false;
  const allowedEvents = new Set(['click_call','click_text','open_estimate_wizard','open_online_estimate_form','generate_lead','quote_submit_error','copy_phone_number','click_reviews','click_service_page','click_location_page','click_order_cleaner','click_checkout']);
  const safeKeys = new Set(['contact_method','placement','service_count','photo_count','page_type','failure_type']);
  function start() {
    if (started || excluded || consent !== 'granted') return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    const cleanUrl = new URL(location.origin + location.pathname);
    ['utm_source','utm_medium','utm_campaign'].forEach(key => { const value=params.get(key); if(value && /^[a-z0-9_. -]{1,100}$/i.test(value)) cleanUrl.searchParams.set(key,value); });
    window.gtag('config', measurementId, {page_location:cleanUrl.href, page_referrer:document.referrer.split('?')[0].split('#')[0], allow_google_signals:false, allow_ad_personalization_signals:false});
    const ga = document.createElement('script'); ga.async=true; ga.src='https://www.googletagmanager.com/gtag/js?id='+measurementId; document.head.appendChild(ga);
    window.clarity = window.clarity || function () { (window.clarity.q=window.clarity.q||[]).push(arguments); };
    window.clarity('consentv2', {analytics_Storage:'granted',ad_Storage:'denied'});
    const clarity = document.createElement('script'); clarity.async=true; clarity.src='https://www.clarity.ms/tag/x1evotdyk2'; document.head.appendChild(clarity);
  }
  function track(name, details) {
    if (!started || excluded || consent !== 'granted' || !allowedEvents.has(name)) return;
    const safe = {page_type:document.body.dataset.pageType || 'home'};
    Object.entries(details || {}).forEach(([key,value]) => { if(safeKeys.has(key) && (typeof value==='number' || /^[a-z0-9_-]{1,40}$/i.test(String(value)))) safe[key]=value; });
    try { window.gtag('event',name,safe); window.clarity('event',name); } catch (_) { /* Analytics must never interrupt contact. */ }
  }
  window.CFSAnalytics = Object.freeze({track, excluded, internal});
  function ready() {
    const area = document.createElement('aside'); area.className='cfs-privacy'; area.setAttribute('aria-label','Analytics preferences');
    const style = document.createElement('style');
    style.textContent='.cfs-privacy{position:relative;padding:14px 20px;margin:0;background:#f4faf6;color:#10352d;border-top:1px solid #d9e7dd;font:14px/1.5 system-ui,sans-serif;text-align:center}.cfs-privacy p{margin:0 0 8px}.cfs-privacy button,.cfs-privacy a{display:inline-block;min-height:44px;padding:10px 14px;margin:3px;border:1px solid #2f7d57;border-radius:8px;background:white;color:#10352d;font:inherit;cursor:pointer}.cfs-privacy [hidden]{display:none!important}';
    document.head.appendChild(style);
    area.innerHTML='<p data-consent-message>Allow usage analytics and masked session recordings to help improve our site? Calling, texting, and quotes work either way.</p><button type="button" data-consent="granted">Allow analytics</button><button type="button" data-consent="denied">No thanks</button><button type="button" data-settings hidden>Analytics preferences</button> <a href="privacy.html">Privacy policy</a>';
    document.body.appendChild(area);
    const message=area.querySelector('[data-consent-message]');
    function render() {
      const decided=Boolean(consent) || excluded;
      message.hidden=decided && !internal;
      if(internal) message.textContent='Owner/testing mode: your visits and actions are excluded from analytics on this browser.';
      area.querySelectorAll('[data-consent]').forEach(button=>button.hidden=decided);
      area.querySelector('[data-settings]').hidden=excluded || !consent;
    }
    area.querySelector('[data-settings]').addEventListener('click',()=>{message.hidden=false;area.querySelectorAll('[data-consent]').forEach(button=>button.hidden=false);});
    area.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>{
      consent=button.dataset.consent; write('cfs_analytics_consent',consent);
      if(started && consent==='denied') {
        window['ga-disable-'+measurementId]=true;
        try { window.gtag('consent','update',{analytics_storage:'denied'}); window.clarity('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'}); } catch (_) {}
        location.reload(); return;
      }
      start();render();
    }));
    render();
    document.querySelectorAll('a[href^="sms:"]').forEach(link=>{
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1)) link.href=link.getAttribute('href').replace('?body=','&body=');
    });
    document.addEventListener('click',event=>{
      const el=event.target.closest('a,button'); if(!el || el.hasAttribute('data-estimate-open') || el.hasAttribute('data-email-estimate')) return;
      const href=el.getAttribute('href')||'';
      const placement=el.closest('.mobile-cta,.mobilebar')?'sticky':el.closest('header')?'header':el.closest('footer')?'footer':'content';
      if(href.startsWith('tel:')) track('click_call',{contact_method:'phone',placement});
      else if(href.startsWith('sms:')) track('click_text',{contact_method:'sms',placement});
      else if(href.startsWith('https://square.link/')) track('click_checkout',{placement});
      else { const action=el.dataset.track; const names={reviews:'click_reviews',service_page:'click_service_page',location_page:'click_location_page',order_cleaner:'click_order_cleaner'}; if(names[action]) track(names[action],{placement}); }
    });
  }
  start();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
