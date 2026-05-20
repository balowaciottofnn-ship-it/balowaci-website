# BaloWaci Legal Document Index

This folder contains the source Markdown for BaloWaci legal documents. Public website pages are generated from these files into `legal/*.html` and copied into `www/legal/` for the Capacitor bundle.

These documents are business-ready drafts, not legal advice. Before launch, app store submission, paid sales, licensing, pilots, investor use, or public reliance, BaloWaci should have qualified counsel review the final documents.

## Core Public Documents

| Document | Source | Public Page | Purpose |
| --- | --- | --- | --- |
| Privacy Policy | `privacy-policy.md` | `privacy-policy.html` | Explains data collection, use, sharing, retention, rights, and contact process. |
| Terms of Service | `terms-of-service.md` | `terms-of-service.html` | Governs use of the website, app, content, feedback forms, and service features. |
| User Agreement | `user-agreement.md` | `user-agreement.html` | Plain-language user responsibilities and feedback rules. |
| Cookie Policy | `cookie-policy.md` | `cookie-policy.html` | Explains cookies, local storage, analytics, and choices. |
| End User License Agreement | `eula.md` | `eula.html` | Mobile/app software license terms for app store distribution. |
| Refund Policy | `refund-policy.md` | `refund-policy.html` | Sets default refund expectations for digital, app, service, and physical offerings. |
| DMCA and Copyright Policy | `dmca-policy.md` | `dmca-policy.html` | Provides copyright notice and counter-notice process. |
| Acceptable Use Policy | `acceptable-use-policy.md` | `acceptable-use-policy.html` | Lists prohibited activity and submission standards. |
| Intellectual Property Notice | `intellectual-property-notice.md` | `intellectual-property-notice.html` | Protects brand, product concepts, creative work, and invention-related materials. |
| Data Processing Agreement | `data-processing-agreement.md` | `data-processing-agreement.html` | Template for business, vendor, pilot, and privacy processing relationships. |
| Accessibility Statement | `accessibility-statement.md` | `accessibility-statement.html` | States accessibility goals and feedback channel. |

## Internal and Formation Documents

| Document | Location | Notes |
| --- | --- | --- |
| Certificate of Organization Draft | `../BaloWaci-Certificate-of-Organization-DRAFT.pdf` | Draft only. It states it is not yet filed with the State of Iowa. Confirm entity status before relying on it. |
| Universe Time Wheel Patent Disclosure | `../interfaces/universe-time-wheel-patent.html` | Internal invention disclosure. Do not share publicly without patent counsel review. |

## Maintenance Checklist

- [x] Add website-ready legal pages.
- [x] Add footer link to the legal center.
- [x] Include app-distribution terms through the EULA.
- [x] Include high-priority DMCA and refund policies.
- [x] Add a repeatable generator for public legal HTML.
- [ ] Confirm official company name, filing status, mailing address, and registered agent details.
- [ ] Confirm final governing law and dispute venue with counsel.
- [ ] Confirm app store policy requirements before iOS or Android submission.
- [ ] Confirm payment, subscription, refund, and warranty language before paid launch.
- [ ] Add a cookie consent and preference tool if analytics, advertising, or jurisdictional requirements make it necessary.
- [ ] Appoint and register a DMCA agent if BaloWaci wants DMCA safe harbor protection.
- [ ] Review privacy practices against actual vendors before production launch.

## Updating Public Pages

After editing a Markdown document, run:

```bash
node scripts/generate-legal-html.js
```

Then run the app bundle preparation when needed:

```bash
npm run app:prepare
```

## Contact

- Email: info@balowaci.com
- Website: https://balowaci.com
