# Taiwan Essential Calendar

Curated Traditional Chinese (`zh-TW`) Taiwan calendar feeds in standards-compliant RFC 5545 `.ics` format.

> Include dates that an ordinary person living in Taiwan is reasonably likely to care about or recognize in everyday life. Avoid completeness for completeness's sake.

The project is intentionally small and opinionated. It is a community-maintained calendar, not an official Taiwan government calendar, and it does not reproduce the annual government office work calendar.

## Calendar feeds

The stable production subscription URLs are:

| Feed | Purpose | Subscription URL |
| --- | --- | --- |
| **Taiwan Essential** (recommended) | Union of the other three feeds | `https://calendar.laurancelin.com/tw-essential.ics` |
| Taiwan Public Holidays | Important holiday dates | `https://calendar.laurancelin.com/tw-public-holidays.ics` |
| Taiwan Traditional | Important traditional observances not already in Public Holidays | `https://calendar.laurancelin.com/tw-traditional.ics` |
| Taiwan Modern | Widely recognized modern observances in Taiwan | `https://calendar.laurancelin.com/tw-modern.ics` |

All feeds contain explicit Gregorian all-day dates for **2026 through 2125 inclusive**. Event summaries are Traditional Chinese. Calendar names remain English.

### Exact event lists

**Taiwan Public Holidays**

- 元旦
- 小年夜
- 除夕
- 正月初一
- 正月初二
- 正月初三
- 和平紀念日
- 兒童節
- 清明節
- 勞動節
- 端午節
- 中秋節
- 教師節
- 國慶日
- 臺灣光復節
- 行憲紀念日

This feed intentionally excludes substitute holidays, compensatory holidays, adjusted workdays, make-up workdays, and temporary one-off schedule changes.

**Taiwan Traditional**

- 元宵節
- 七夕
- 中元節
- 重陽節
- 冬至

Traditional holidays already in Public Holidays are not duplicated here.

**Taiwan Modern**

- 情人節 — February 14
- 母親節 — second Sunday of May
- 父親節 — August 8
- 萬聖節 — October 31
- 聖誕節 — December 25
- 跨年夜 — December 31

**Taiwan Essential** is generated in code as Public Holidays + Traditional + Modern. It has no separate event definitions. Coincident events remain independent; December 25 contains both 行憲紀念日 and 聖誕節.

## Inclusion philosophy

The calendar should approximately answer:

> Is today an important public holiday, traditional festival, or widely recognized modern observance in Taiwan?

It deliberately excludes many obscure occupational, specialist, religious, and commemorative observances. The goal is useful curation, not an encyclopedia. See [CONTRIBUTING.md](CONTRIBUTING.md) before proposing an addition or removal.

## Date calculation

Lunar-to-Gregorian conversion and the dates of 清明 and 冬至 use [`lunar-javascript`](https://github.com/6tail/lunar-javascript), a maintained, dependency-free implementation based on the Shou Xing astronomical calendar algorithms. The generator requests ordinary positive-numbered lunar months, so a festival is not accidentally repeated in a leap month. 小年夜 and 除夕 are derived by subtracting two and one days from lunar New Year rather than assuming the preceding lunar month has a fixed length.

Every calculated result becomes an explicit Gregorian `VALUE=DATE` event. Calendar clients do not need to understand lunar recurrence rules or solar terms. Tests cross-check representative fixtures against the [Hong Kong Observatory Gregorian–Lunar conversion tables](https://www.hko.gov.hk/en/gts/time/conversion.htm), including a leap-seventh-month year.

## iCalendar behavior

The serializer produces UTF-8 RFC 5545 data with:

- `VERSION:2.0`, `CALSCALE:GREGORIAN`, and `METHOD:PUBLISH`;
- CRLF line endings and UTF-8-aware 75-octet line folding;
- escaped TEXT values and `LANGUAGE=zh-TW` summaries;
- all-day `DTSTART;VALUE=DATE` and exclusive next-day `DTEND;VALUE=DATE`;
- `TRANSP:TRANSPARENT`;
- deterministic UIDs in the `calendar.laurancelin.com` namespace;
- a deterministic `DTSTAMP`, making byte-for-byte repeat builds possible.

The test suite parses every generated file with [`ical.js`](https://github.com/mozilla-comm/ical.js) and checks round-trip summaries, all-day semantics, unique/stable UIDs, UTF-8 validity, line lengths, and deterministic output.

## Architecture

```text
data/                       one source definition for every event
src/date-calculation.js     Gregorian, lunar, and solar-term rules
src/events.js               event expansion and Essential composition
src/ics.js                  RFC 5545 serialization
src/generate.js             feed writer
scripts/                    local generation and site assembly
tests/                      date fixtures and full-feed invariants
site/                       plain HTML, CSS, and JavaScript
dist/                       generated local feeds (ignored)
_site/                      generated Pages artifact (ignored)
```

No database, server, runtime scraping, or network call is involved in generation.

## Local development

Requirements: Node.js 22 or newer and Corepack.

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
```

Run the tests:

```bash
pnpm test
```

Generate only the four calendars in `dist/`:

```bash
pnpm generate
```

Generate the feeds and assemble the complete static site in `_site/`:

```bash
pnpm build
```

Run everything required before a pull request:

```bash
pnpm check
```

To preview the built site locally, serve `_site/` with any static file server. Generated directories are ignored and should not be committed.

## GitHub Pages deployment

`.github/workflows/pages.yml` runs on pushes to `main` and manual dispatch. Its build job installs locked dependencies, runs the complete test suite, generates the calendars, builds `_site/`, and uploads that directory as the Pages artifact. A separate deploy job depends on the successful build job and deploys through the protected `github-pages` environment using the official Pages actions.

Because deploy has `needs: build`, a failed test or build cannot replace the last successful deployment. The workflow does not commit generated output to any branch.

Repository setup:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Keep or create the `github-pages` environment. Optionally restrict it to the `main` branch.
4. Push to `main` or run the workflow manually.

The uploaded artifact has this shape:

```text
_site/
  index.html
  tw-essential.ics
  tw-public-holidays.ics
  tw-traditional.ics
  tw-modern.ics
  assets/
```

No repository `CNAME` file is used. GitHub documents that a `CNAME` file does not configure custom domains for custom Actions deployments; configure the domain in repository settings instead.

### MIME type

`.ics` is the registered extension for `text/calendar`, and GitHub Pages normally serves it accordingly from a static artifact. Pages does not provide per-file response-header configuration, so the project avoids extra infrastructure solely to append `charset=utf-8`; the content itself is valid UTF-8 and declares no conflicting encoding. After the first deployment, verify the actual response with:

```bash
curl -I https://calendar.laurancelin.com/tw-essential.ics
```

The expected content type is `text/calendar` (ideally `text/calendar; charset=utf-8`). Also complete a real subscription from Apple Calendar after DNS and HTTPS are active; that end-to-end production check cannot be performed before deployment.

## Custom domain and DNS

DNS changes are manual and do not affect the existing website at `https://laurancelin.com`.

After the GitHub Pages workflow deploys successfully:

1. In GitHub account Pages settings, verify ownership of `laurancelin.com` using the TXT record GitHub provides.
2. In this repository's **Settings → Pages → Custom domain**, enter `calendar.laurancelin.com`.
3. At the DNS provider, create a `CNAME` record whose host/name is `calendar` and whose target is the owner's Pages hostname, normally `laurancelin.github.io`.
4. Wait for GitHub's DNS check to succeed.
5. Enable **Enforce HTTPS** when GitHub makes it available.

Do not redirect or otherwise change the apex `laurancelin.com` site.

## Subscribe with Apple Calendar

On iPhone or iPad, opening a `webcal://` subscription link on the project website is the shortest route. If needed, go to **Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add Subscribed Calendar**, then paste one of the HTTPS feed URLs.

On macOS, open Calendar and choose **File → New Calendar Subscription**, paste the HTTPS feed URL, and choose an automatic refresh interval.

After production deployment, verify at least the Essential feed on both iPhone and macOS. Subscription clients may cache remote calendars, so updates are not always immediate.

## License and disclaimer

Released under the [MIT License](LICENSE).

This is a community-maintained open-source project. It is not an official Taiwan government calendar and should not be used as the sole authority for legal deadlines, work schedules, school schedules, or government office closures.
