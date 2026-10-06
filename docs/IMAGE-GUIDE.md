# Image guide

Every file in `assets/img/` is **generated placeholder artwork** — an ink/jade gradient with a
motif and a caption. The site looks finished rather than "under construction" because the
placeholders are on-brand, but they are not photographs.

**To replace them: drop your real image over the placeholder using the exact same filename.**
No code change is required. The build copies `assets/img/` verbatim into `dist/`.

Recommended: shoot or export at the sizes below, save as progressive JPEG at quality 80–86, and
keep each file under ~350 KB. Run the images through a compressor before uploading.

---

## Hero and open-graph

| File | Size (px) | Aspect | Used on |
| --- | --- | --- | --- |
| `hero-lab.jpg` | 1600 × 1000 | 8:5 | Homepage hero (technology) |
| `hero-clinic.jpg` | 1600 × 1000 | 8:5 | Homepage hero (clinic variant) |
| `og-default.jpg` | 1200 × 630 | 1.91:1 | Social sharing card for every page |

`og-default.jpg` is referenced absolutely (`https://<domain>/assets/img/og-default.jpg`), so it must
exist even if you change nothing else. Avoid text in the outer 60 px — some platforms crop it.

## Capability and about imagery — 1400 × 1050 (4:3)

| File | Subject the caption implies |
| --- | --- |
| `tech-transfer.jpg` | Pilot plant or production vessel, instrumentation visible |
| `tech-collab.jpg` | Meeting, lab walkthrough, or signed-partnership moment |
| `tech-quality.jpg` | Analyst at an HPLC, sample prep, or documentation review |
| `clinic-room.jpg` | Treatment room, couch, tidy and well lit |
| `clinic-herbs.jpg` | Dispensary: granule cabinets, scales, labelling station |
| `clinic-course.jpg` | Teaching session, practitioners around a table |
| `about-facility.jpg` | Building exterior or assembly floor in Zhengzhou |
| `about-team.jpg` | Team at work — prefer candid over a posed row |
| `about-timeline.jpg` | A milestone image: first shipment, first clinic, first audit |
| `cert-quality.jpg` | Certificates on a wall, or a document review |
| `cert-lab.jpg` | Third-party testing laboratory |

## Product pages — 1200 × 900 (4:3)

One main image per product, plus three gallery alternates. The gallery on a product page shows the
first four images listed in that product's `gallery` array in `src/content.js`.

| File | Product |
| --- | --- |
| `p-extraction-unit.jpg` | Multi-function Extraction Unit |
| `p-concentration.jpg` | Vacuum Concentration Line |
| `p-drying-spray.jpg` | Spray Drying Skid |
| `p-granule-line.jpg` | Herbal Granule Production Line |
| `p-lab-analyzer.jpg` | HPLC Analysis Workstation |
| `p-lab-kit.jpg` | Raw Material Identification Kit |
| `p-diagnostic-scanner.jpg` | TCM Diagnostic Scanning Platform |
| `p-telehealth.jpg` | Cross-border Consultation Platform |
| `p-herb-set.jpg` | Certified Herb Sourcing Set |
| `p-extract-powder.jpg` | Standardised Extract Powders |
| `p-clinic-starter.jpg` | TCM Clinic Start-up Package |
| `p-training-kit.jpg` | Clinical Training Curriculum |
| `p-clinic-room.jpg` | Gallery alternate: treatment room fit-out |
| `p-clinic-herbs.jpg` | Gallery alternate: dispensary and granule storage |
| `p-clinic-course.jpg` | Gallery alternate: clinical training session |

## Articles — 1400 × 788 (16:9)

| File | Article |
| --- | --- |
| `news-regulatory.jpg` | Regulatory pathways for TCM in the EU |
| `news-quality.jpg` | What a batch record must prove |
| `news-market.jpg` | Clinic partnerships in North America |
| `news-training.jpg` | Structured clinical training |
| `news-tech.jpg` | Scaling a pilot process to production |
| `news-supply.jpg` | Herb sourcing and traceability |

## Other

| File | Notes |
| --- | --- |
| `favicon.svg` | Vector monogram. Replace the colours to match your brand, or swap for your own SVG. Keep it square. |

---

## Notes on photography

- **Consistency beats perfection.** All 32 images carry the same dark ink/jade treatment today. If
  you replace only some of them, the site will look patchy. Either replace a whole group (all
  products, or all articles) or keep the placeholders until you have a full set.
- **Do not use stock imagery of identifiable people for testimonial or team sections** unless you
  hold a model release. The testimonial quotations on the homepage are illustrative placeholders —
  replace them with real, permissioned quotes before publishing.
- **Avoid images with text baked in.** All captions and labels in the layout are real text, so text
  inside an image will duplicate, mistranslate or break in the other five languages.
- **Check the dark treatment.** The hero and page headers place the image on a dark background, so
  images with large white areas can glare. Mid-tone images sit best.
