## [1.5.2](https://github.com/mk-162/fixMate/compare/v1.5.1...v1.5.2) (2026-01-03)


### Bug Fixes

* enforce https protocol on API base URL ([3d60876](https://github.com/mk-162/fixMate/commit/3d608761a4ce84d12bb135f1da49a2f647bee634))

## [1.5.1](https://github.com/mk-162/fixMate/compare/v1.5.0...v1.5.1) (2026-01-03)


### Bug Fixes

* add detailed logging and error handling to Twilio webhooks ([09ba931](https://github.com/mk-162/fixMate/commit/09ba93175d28c7b16949d6fccf853f261500e4f9))

# [1.5.0](https://github.com/mk-162/fixMate/compare/v1.4.0...v1.5.0) (2026-01-03)


### Features

* add Properties and Tenants management UI with CRUD modals ([67edc8b](https://github.com/mk-162/fixMate/commit/67edc8b5ec630494bb20026505f044e6540dae4d))

# [1.4.0](https://github.com/mk-162/fixMate/compare/v1.3.1...v1.4.0) (2026-01-03)


### Features

* add properties, tenants, organizations API with org filtering ([94c067b](https://github.com/mk-162/fixMate/commit/94c067ba3c642151102337169a96ca5d5be90012))

## [1.3.1](https://github.com/mk-162/fixMate/compare/v1.3.0...v1.3.1) (2026-01-03)


### Bug Fixes

* prevent redirect loop in middleware organization check ([0d1abcc](https://github.com/mk-162/fixMate/commit/0d1abcc71370acce7c14c27a78f4b4dd883b1ce5))

# [1.3.0](https://github.com/mk-162/fixMate/compare/v1.2.1...v1.3.0) (2026-01-03)


### Features

* add Twilio WhatsApp integration with webhook endpoints ([4e01a58](https://github.com/mk-162/fixMate/commit/4e01a585671ff529d4ee987a84819301c2564db2))

## [1.2.1](https://github.com/mk-162/fixMate/compare/v1.2.0...v1.2.1) (2026-01-03)


### Bug Fixes

* disable auto-migrations to prevent 'already exists' errors ([8b1d9d8](https://github.com/mk-162/fixMate/commit/8b1d9d850e32f7dcc3f3a6364f1057c6ce1defb1))

# [1.2.0](https://github.com/mk-162/fixMate/compare/v1.1.2...v1.2.0) (2026-01-03)


### Bug Fixes

* handle migration errors gracefully for existing schemas ([486edd8](https://github.com/mk-162/fixMate/commit/486edd8a25719b46a7b2188124276bb6e226aed1))


### Features

* add FixMate MVP dashboard with stats and quick actions ([378091e](https://github.com/mk-162/fixMate/commit/378091e9c979c040547574764520eaaf482efb6a))

## [1.1.2](https://github.com/mk-162/fixMate/compare/v1.1.1...v1.1.2) (2026-01-03)


### Bug Fixes

* add anthropic package to requirements ([05c34f8](https://github.com/mk-162/fixMate/commit/05c34f845fbfd9449f898d69ab2f690c61edf835))

## [1.1.1](https://github.com/mk-162/fixMate/compare/v1.1.0...v1.1.1) (2026-01-03)


### Bug Fixes

* use Python 3.12.1 for Railway compatibility ([b36db09](https://github.com/mk-162/fixMate/commit/b36db09be26ac38e842c6f0c6613a8a5da68ace8))

# [1.1.0](https://github.com/mk-162/fixMate/compare/v1.0.0...v1.1.0) (2026-01-03)


### Features

* add Python FastAPI backend with Claude Agent SDK ([0b3f441](https://github.com/mk-162/fixMate/commit/0b3f44161eec89ea8e40032b484635fdf970dbd9))

# 1.0.0 (2026-01-03)


### Bug Fixes

* add demo banner at the top of the landing page ([09bf8c8](https://github.com/mk-162/fixMate/commit/09bf8c8aba06eba1405fb0c20aeec23dfb732bb7))
* chnage dashboard index message button in french translation ([2f1dca8](https://github.com/mk-162/fixMate/commit/2f1dca84cb05af52a959dd9630769ed661d8c69b))
* clerk integration ([a9981cd](https://github.com/mk-162/fixMate/commit/a9981cddcb4a0e2365066938533cd13225ce10a9))
* hide text in logo used in dashboard and add spacing for sign in button used in navbar ([a0eeda1](https://github.com/mk-162/fixMate/commit/a0eeda12251551fd6a8e50222f46f3d47f0daad7))
* in dashboard, make the logo smaller, display without text ([f780727](https://github.com/mk-162/fixMate/commit/f780727659fa58bbe6e4250dd63b2819369b7308))
* issue to build Next.js with Node.js 22.7, use 22.6 instead ([4acaef9](https://github.com/mk-162/fixMate/commit/4acaef95edec3cd72a35405969ece9d55a2bb641))
* redirect user to the landing page after signing out ([6e9f383](https://github.com/mk-162/fixMate/commit/6e9f3839daaab56dd3cf3e57287ea0f3862b8588))
* remove custom framework configuration for i18n-ally vscode ([63f87fe](https://github.com/mk-162/fixMate/commit/63f87feb3c0cb186c500ef9bed9cb50d7309224d))
* remove hydration error and unify with pro version 1.6.1 ([ea2d02b](https://github.com/mk-162/fixMate/commit/ea2d02bd52de34c6cd2390d160ffe7f14319d5c3))
* remove update deps github workflow, add separator in dashboard header ([fcf0fb4](https://github.com/mk-162/fixMate/commit/fcf0fb48304ce45f6ceefa7d7eae11692655c749))
* update checkly.config.ts ([61424bf](https://github.com/mk-162/fixMate/commit/61424bfa71764c08d349b7555c5f8696b070ffb5))
* update clerk to the latest version and update middlware to use await with auth ([2287192](https://github.com/mk-162/fixMate/commit/2287192ddcf5b27a1f43ac2b7a992e065b990627))
* update logicalId in checkly configuration ([6e7a479](https://github.com/mk-162/fixMate/commit/6e7a4795bff0b92d3681fadc36256aa957eb2613))
* use new vitest vscode setting for preventing automatic opening of the test results ([2a2b945](https://github.com/mk-162/fixMate/commit/2a2b945050f8d19883d6f2a8a6ec5ccf8b1f4173))


### Features

* add custom framework for i18n-ally and replace deprecated Jest VSCode configuration ([a9889dc](https://github.com/mk-162/fixMate/commit/a9889dc129aeeba8801f4f47e54d46e9515e6a29))
* add FixMate MVP - AI-powered maintenance platform ([3f69bea](https://github.com/mk-162/fixMate/commit/3f69beae5d68b4eaad2f71371084f7fe60e169df))
* add link to the GitHub repository ([ed42176](https://github.com/mk-162/fixMate/commit/ed42176bdc2776cacc2c939bac45914a1ede8e51))
* create dashboard header component ([f3dc1da](https://github.com/mk-162/fixMate/commit/f3dc1da451ab8dce90d111fe4bbc8d4bc99e4b01))
* don't redirect to organization-selection if the user is already on this page ([87da997](https://github.com/mk-162/fixMate/commit/87da997b853fd9dcb7992107d2cb206817258910))
* initial commit ([d58e1d9](https://github.com/mk-162/fixMate/commit/d58e1d97e11baa0a756bd038332eb84daf5a8327))
* launching SaaS boilerplate for helping developers to build SaaS quickly ([7f24661](https://github.com/mk-162/fixMate/commit/7f246618791e3a731347dffc694a52fa90b1152a))
* make the landing page responsive and works on mobile ([27e908a](https://github.com/mk-162/fixMate/commit/27e908a735ea13845a6cc42acc12e6cae3232b9b))
* make user dashboard responsive ([f88c9dd](https://github.com/mk-162/fixMate/commit/f88c9dd5ac51339d37d1d010e5b16c7776c73b8d))
* migreate Env.mjs file to Env.ts ([2e6ff12](https://github.com/mk-162/fixMate/commit/2e6ff124dcc10a3c12cac672cbb82ec4000dc60c))
* remove next-sitemap and use the native Next.js sitemap/robots.txt ([75c9751](https://github.com/mk-162/fixMate/commit/75c9751d607b8a6a269d08667f7d9900797ff38a))
* update de Next.js Boilerplate v3.58.1 ([16aea65](https://github.com/mk-162/fixMate/commit/16aea651ef93ed627e3bf310412cfd3651aeb3e4))
* update to Drizzle Kit 0.22, Storybook 8, migrate to vitest ([c2f19cd](https://github.com/mk-162/fixMate/commit/c2f19cd8e9dc983e0ad799da2474610b57b88f50))
* update to Next.js Boilerpalte v3.54 ([ae80843](https://github.com/mk-162/fixMate/commit/ae808433e50d6889559fff382d4b9c595d34e04f))
* upgrade to Clerk v5 and use Clerk's Core 2 ([a92cef0](https://github.com/mk-162/fixMate/commit/a92cef026b5c85a703f707aabf42d28a16f07054))
* use Node.js version 20 and 22 in GitHub Actions ([226b5e9](https://github.com/mk-162/fixMate/commit/226b5e970f46bfcd384ca60cd63ebb15516eca21))
* vscode jest open test result view on test fails and add unauthenticatedUrl in clerk middleware ([3cfcb6b](https://github.com/mk-162/fixMate/commit/3cfcb6b00d91dabcb00cbf8eb2d8be6533ff672e))

## [1.7.7](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.6...v1.7.7) (2025-12-12)


### Bug Fixes

* update checkly.config.ts ([61424bf](https://github.com/ixartz/SaaS-Boilerplate/commit/61424bfa71764c08d349b7555c5f8696b070ffb5))

## [1.7.6](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.5...v1.7.6) (2025-05-01)


### Bug Fixes

* update clerk to the latest version and update middlware to use await with auth ([2287192](https://github.com/ixartz/SaaS-Boilerplate/commit/2287192ddcf5b27a1f43ac2b7a992e065b990627))

## [1.7.5](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.4...v1.7.5) (2025-05-01)


### Bug Fixes

* clerk integration ([a9981cd](https://github.com/ixartz/SaaS-Boilerplate/commit/a9981cddcb4a0e2365066938533cd13225ce10a9))

## [1.7.4](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.3...v1.7.4) (2024-12-20)


### Bug Fixes

* remove custom framework configuration for i18n-ally vscode ([63f87fe](https://github.com/ixartz/SaaS-Boilerplate/commit/63f87feb3c0cb186c500ef9bed9cb50d7309224d))
* use new vitest vscode setting for preventing automatic opening of the test results ([2a2b945](https://github.com/ixartz/SaaS-Boilerplate/commit/2a2b945050f8d19883d6f2a8a6ec5ccf8b1f4173))

## [1.7.3](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.2...v1.7.3) (2024-11-07)


### Bug Fixes

* chnage dashboard index message button in french translation ([2f1dca8](https://github.com/ixartz/SaaS-Boilerplate/commit/2f1dca84cb05af52a959dd9630769ed661d8c69b))
* remove update deps github workflow, add separator in dashboard header ([fcf0fb4](https://github.com/ixartz/SaaS-Boilerplate/commit/fcf0fb48304ce45f6ceefa7d7eae11692655c749))

## [1.7.2](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.1...v1.7.2) (2024-10-17)


### Bug Fixes

* hide text in logo used in dashboard and add spacing for sign in button used in navbar ([a0eeda1](https://github.com/ixartz/SaaS-Boilerplate/commit/a0eeda12251551fd6a8e50222f46f3d47f0daad7))
* in dashboard, make the logo smaller, display without text ([f780727](https://github.com/ixartz/SaaS-Boilerplate/commit/f780727659fa58bbe6e4250dd63b2819369b7308))
* remove hydration error and unify with pro version 1.6.1 ([ea2d02b](https://github.com/ixartz/SaaS-Boilerplate/commit/ea2d02bd52de34c6cd2390d160ffe7f14319d5c3))

## [1.7.1](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.7.0...v1.7.1) (2024-10-04)


### Bug Fixes

* update logicalId in checkly configuration ([6e7a479](https://github.com/ixartz/SaaS-Boilerplate/commit/6e7a4795bff0b92d3681fadc36256aa957eb2613))

# [1.7.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.6.1...v1.7.0) (2024-10-04)


### Features

* update de Next.js Boilerplate v3.58.1 ([16aea65](https://github.com/ixartz/SaaS-Boilerplate/commit/16aea651ef93ed627e3bf310412cfd3651aeb3e4))

## [1.6.1](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.6.0...v1.6.1) (2024-08-31)


### Bug Fixes

* add demo banner at the top of the landing page ([09bf8c8](https://github.com/ixartz/SaaS-Boilerplate/commit/09bf8c8aba06eba1405fb0c20aeec23dfb732bb7))
* issue to build Next.js with Node.js 22.7, use 22.6 instead ([4acaef9](https://github.com/ixartz/SaaS-Boilerplate/commit/4acaef95edec3cd72a35405969ece9d55a2bb641))

# [1.6.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.5.0...v1.6.0) (2024-07-26)


### Features

* update to Next.js Boilerpalte v3.54 ([ae80843](https://github.com/ixartz/SaaS-Boilerplate/commit/ae808433e50d6889559fff382d4b9c595d34e04f))

# [1.5.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.4.0...v1.5.0) (2024-06-05)


### Features

* update to Drizzle Kit 0.22, Storybook 8, migrate to vitest ([c2f19cd](https://github.com/ixartz/SaaS-Boilerplate/commit/c2f19cd8e9dc983e0ad799da2474610b57b88f50))

# [1.4.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.3.0...v1.4.0) (2024-05-17)


### Features

* vscode jest open test result view on test fails and add unauthenticatedUrl in clerk middleware ([3cfcb6b](https://github.com/ixartz/SaaS-Boilerplate/commit/3cfcb6b00d91dabcb00cbf8eb2d8be6533ff672e))

# [1.3.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.2.1...v1.3.0) (2024-05-16)


### Features

* add custom framework for i18n-ally and replace deprecated Jest VSCode configuration ([a9889dc](https://github.com/ixartz/SaaS-Boilerplate/commit/a9889dc129aeeba8801f4f47e54d46e9515e6a29))
* create dashboard header component ([f3dc1da](https://github.com/ixartz/SaaS-Boilerplate/commit/f3dc1da451ab8dce90d111fe4bbc8d4bc99e4b01))
* don't redirect to organization-selection if the user is already on this page ([87da997](https://github.com/ixartz/SaaS-Boilerplate/commit/87da997b853fd9dcb7992107d2cb206817258910))
* make the landing page responsive and works on mobile ([27e908a](https://github.com/ixartz/SaaS-Boilerplate/commit/27e908a735ea13845a6cc42acc12e6cae3232b9b))
* make user dashboard responsive ([f88c9dd](https://github.com/ixartz/SaaS-Boilerplate/commit/f88c9dd5ac51339d37d1d010e5b16c7776c73b8d))
* migreate Env.mjs file to Env.ts ([2e6ff12](https://github.com/ixartz/SaaS-Boilerplate/commit/2e6ff124dcc10a3c12cac672cbb82ec4000dc60c))
* remove next-sitemap and use the native Next.js sitemap/robots.txt ([75c9751](https://github.com/ixartz/SaaS-Boilerplate/commit/75c9751d607b8a6a269d08667f7d9900797ff38a))
* upgrade to Clerk v5 and use Clerk's Core 2 ([a92cef0](https://github.com/ixartz/SaaS-Boilerplate/commit/a92cef026b5c85a703f707aabf42d28a16f07054))
* use Node.js version 20 and 22 in GitHub Actions ([226b5e9](https://github.com/ixartz/SaaS-Boilerplate/commit/226b5e970f46bfcd384ca60cd63ebb15516eca21))

## [1.2.1](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.2.0...v1.2.1) (2024-03-30)


### Bug Fixes

* redirect user to the landing page after signing out ([6e9f383](https://github.com/ixartz/SaaS-Boilerplate/commit/6e9f3839daaab56dd3cf3e57287ea0f3862b8588))

# [1.2.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.1.0...v1.2.0) (2024-03-29)


### Features

* add link to the GitHub repository ([ed42176](https://github.com/ixartz/SaaS-Boilerplate/commit/ed42176bdc2776cacc2c939bac45914a1ede8e51))

# [1.1.0](https://github.com/ixartz/SaaS-Boilerplate/compare/v1.0.0...v1.1.0) (2024-03-29)


### Features

* launching SaaS boilerplate for helping developers to build SaaS quickly ([7f24661](https://github.com/ixartz/SaaS-Boilerplate/commit/7f246618791e3a731347dffc694a52fa90b1152a))

# 1.0.0 (2024-03-29)


### Features

* initial commit ([d58e1d9](https://github.com/ixartz/SaaS-Boilerplate/commit/d58e1d97e11baa0a756bd038332eb84daf5a8327))
