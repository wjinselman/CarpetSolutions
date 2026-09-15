# Carpet Friendly website update

## Included
- Removed the website photo picker. Customers attach photos once, directly in their messaging app. Online requests clearly explain that photos are sent separately by text.
- Online estimates require the form service to return an explicit success result before confirmation is displayed.
- Added a 20-second request timeout, submission guard, phone/email validation, and retry behavior that preserves contact details on failure.
- Corrected robots.txt to reference the custom-domain sitemap.
- Optimized seven large referenced images into separate WebP files, preserving originals.
- Extracted two embedded product photos into separately cached WebP assets.
- Added the product page's main heading.

## Verification
Mocked tests cover boolean/string success, rejected requests, HTTP errors, invalid JSON, double clicks and failure recovery. JavaScript syntax and local file/anchor checks pass across all 16 HTML pages. These checks do not confirm delivery to the real business inbox or replace visual testing on phones.

## Publishing
Upload the contents of this package to the existing website repository, including images and robots.txt. Keep CNAME set to carpetfriendlysolutions.com. This is a static website update; no Firebase deployment is involved.

After publishing, send one real estimate and confirm arrival at CarpetFriendlySolutions@gmail.com. FormSubmit may require recipient activation. Confirm that Square links still have the correct prices, shipping and pickup settings in your Square account. This update does not change checkout prices or invent shipping/return terms.
