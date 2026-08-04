# AndromeSky

Interactive astronomy SPA built with Angular and Aladin Lite.

## Features

- SkyMap
- Guided exploration
- Quiz
- NASA integration

```
andromesky
├─ .angular
├─ .editorconfig
├─ .postcssrc.json
├─ angular.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ data
│  │  ├─ constellations.json
│  │  ├─ hipparcos.json
│  │  └─ messier.json
│  ├─ favicon.ico
│  ├─ icons
│  │  └─ andromeSky-logo.svg
│  └─ Rapport
│     ├─ Rapport TFE.docx
│     └─ ~$pport TFE.docx
├─ README.md
├─ src
│  ├─ app
│  │  ├─ app.config.ts
│  │  ├─ app.css
│  │  ├─ app.html
│  │  ├─ app.routes.ts
│  │  ├─ app.spec.ts
│  │  ├─ app.ts
│  │  ├─ components
│  │  │  ├─ header
│  │  │  │  ├─ header.css
│  │  │  │  ├─ header.html
│  │  │  │  ├─ header.spec.ts
│  │  │  │  └─ header.ts
│  │  │  ├─ object-panel
│  │  │  │  ├─ object-panel.css
│  │  │  │  ├─ object-panel.html
│  │  │  │  └─ object-panel.ts
│  │  │  ├─ quiz-questions
│  │  │  │  ├─ quiz-questions.css
│  │  │  │  ├─ quiz-questions.html
│  │  │  │  └─ quiz-questions.ts
│  │  │  ├─ quiz-results
│  │  │  │  ├─ quiz-results.css
│  │  │  │  ├─ quiz-results.html
│  │  │  │  └─ quiz-results.ts
│  │  │  ├─ quiz-settings
│  │  │  │  ├─ quiz-settings.css
│  │  │  │  ├─ quiz-settings.html
│  │  │  │  └─ quiz-settings.ts
│  │  │  ├─ search-bar
│  │  │  │  ├─ search-bar.css
│  │  │  │  ├─ search-bar.html
│  │  │  │  ├─ search-bar.spec.ts
│  │  │  │  └─ search-bar.ts
│  │  │  ├─ side-panel
│  │  │  │  ├─ side-panel.css
│  │  │  │  ├─ side-panel.html
│  │  │  │  ├─ side-panel.spec.ts
│  │  │  │  └─ side-panel.ts
│  │  │  ├─ sky-map
│  │  │  │  ├─ sky-map.css
│  │  │  │  ├─ sky-map.html
│  │  │  │  ├─ sky-map.spec.ts
│  │  │  │  └─ sky-map.ts
│  │  │  └─ svg-icon
│  │  │     ├─ svg-icon.css
│  │  │     ├─ svg-icon.html
│  │  │     ├─ svg-icon.spec.ts
│  │  │     └─ svg-icon.ts
│  │  ├─ constants
│  │  │  └─ wiki.constant.ts
│  │  ├─ data
│  │  │  └─ astronomical-objects.ts
│  │  ├─ helpers
│  │  │  └─ wiki.helper.ts
│  │  ├─ models
│  │  │  ├─ app-mode.model.ts
│  │  │  ├─ astronomical-object.model.ts
│  │  │  ├─ nasa-image.model.ts
│  │  │  ├─ quiz.model.ts
│  │  │  ├─ score.model.ts
│  │  │  └─ wiki.model.ts
│  │  └─ services
│  │     ├─ app-state.service.ts
│  │     ├─ astronomical-object.service.ts
│  │     ├─ catalog-loader.service.ts
│  │     ├─ constellation.service.ts
│  │     ├─ json-loader.service.ts
│  │     ├─ nasa-image.service.ts
│  │     ├─ quiz.service.ts
│  │     ├─ score.service.ts
│  │     ├─ sky-map.service.ts
│  │     └─ wikipedia.service.ts
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.css
├─ tailwind.config.ts
├─ tsconfig.app.json
├─ tsconfig.json
└─ tsconfig.spec.json

```