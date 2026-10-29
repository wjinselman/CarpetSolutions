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
  // Honor prior opt-outs and browser privacy signals; never infer consent.
  const optedOut = read('cfs_analytics_consent') === 'denied' || navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const excluded = !production || internal || navigator.webdriver === true || optedOut;
  let started = false;
  const allowedEvents = new Set(['click_call','click_text','open_estimate_wizard','open_online_estimate_form','generate_lead','quote_submit_error','copy_phone_number','click_reviews','click_service_page','click_location_page','click_order_cleaner','click_checkout','click_facebook']);
  const safeKeys = new Set(['contact_method','placement','service_count','photo_count','page_type','failure_type']);
  function start() {
    if (started || excluded) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    const cleanUrl = new URL(location.origin + location.pathname);
    ['utm_source','utm_medium','utm_campaign'].forEach(key => { const value=params.get(key); if(value && /^[a-z0-9_. -]{1,100}$/i.test(value)) cleanUrl.searchParams.set(key,value); });
    window.gtag('config', measurementId, {page_location:cleanUrl.href, page_referrer:document.referrer.split('?')[0].split('#')[0], allow_google_signals:false, allow_ad_personalization_signals:false});
    const ga = document.createElement('script'); ga.async=true; ga.src='https://www.googletagmanager.com/gtag/js?id='+measurementId; document.head.appendChild(ga);
    window.clarity = window.clarity || function () { (window.clarity.q=window.clarity.q||[]).push(arguments); };
    window.clarity('consentv2', {analytics_Storage:'denied',ad_Storage:'denied'});
    const clarity = document.createElement('script'); clarity.async=true; clarity.src='https://www.clarity.ms/tag/x1evotdyk2'; document.head.appendChild(clarity);
  }
  function track(name, details) {
    if (!started || excluded || !allowedEvents.has(name)) return;
    const safe = {page_type:document.body.dataset.pageType || 'home'};
    Object.entries(details || {}).forEach(([key,value]) => { if(safeKeys.has(key) && (typeof value==='number' || /^[a-z0-9_-]{1,40}$/i.test(String(value)))) safe[key]=value; });
    try { window.gtag('event',name,safe); window.clarity('event',name); } catch (_) { /* Analytics must never interrupt contact. */ }
  }
  window.CFSAnalytics = Object.freeze({track, excluded, internal});
  function ready() {
    const area = document.createElement('aside');
    area.className = 'cfs-privacy';
    area.style.cssText = 'padding:12px 20px;text-align:center;font:14px/1.5 system-ui,sans-serif';
    const privacy = document.createElement('a');
    privacy.href = '/privacy.html';
    privacy.textContent = 'Privacy policy';
    area.appendChild(privacy);
    if (internal) area.appendChild(document.createTextNode(' — Owner/testing mode: your visits are excluded.'));
    document.body.appendChild(area);
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
      else { const action=el.dataset.track; const names={reviews:'click_reviews',service_page:'click_service_page',location_page:'click_location_page',order_cleaner:'click_order_cleaner',facebook:'click_facebook'}; if(names[action]) track(names[action],{placement}); }
    });
  }
  start();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
