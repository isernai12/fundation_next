# Foundation ERP i18n Architecture

This document describes the modular internationalization (i18n) architecture used in the Foundation ERP system.

## 1. Directory Structure

All i18n-related files are located in `src/i18n/`.

```text
src/i18n/
  ├── LanguageProvider.tsx   # React Context Provider and core logic
  ├── LanguageSwitcher.tsx   # UI component to toggle languages
  ├── dictionaries/          # Modular JSON dictionaries
  │   ├── index.ts           # Central aggregator (barrel file)
  │   ├── en/                # English dictionaries
  │   │   ├── common.json    # Shared generic text (buttons, errors, etc.)
  │   │   ├── layout.json    # Header, Sidebar, Footer, Navigation
  │   │   ├── dashboard.json # Dashboard module
  │   │   └── features/      # All other feature modules
  │   │       ├── members.json
  │   │       └── ...
  │   └── bn/                # Bengali dictionaries (MUST mirror `en/` perfectly)
  │       └── ...
  └── locales/               # (Legacy) Old monolithic JSONs. Being phased out.
```

## 2. Namespace Strategy

We use a namespace-based strategy. The dot-notation key path you pass to the `t()` function directly maps to the file structure.

For example:
- `t('common.actions.save')` maps to `common.json`, object `"actions"`, key `"save"`.
- `t('layout.sidebar.dashboard')` maps to `layout.json`, object `"sidebar"`, key `"dashboard"`.
- `t('features.members.title')` maps to `features/members.json`, key `"title"`.

## 3. Adding New Translations

1. Identify the domain of the new string (e.g., is it a common button? is it specific to the members module?).
2. Open the corresponding `.json` file in BOTH `src/i18n/dictionaries/en/` and `src/i18n/dictionaries/bn/`.
3. Add the key using `snake_case` naming conventions.
4. Provide the correct English and Bengali translation values.
5. If creating a entirely new feature module (e.g., `features/donors.json`), remember to:
   - Create it in both `en/` and `bn/`
   - Import and export it in `src/i18n/dictionaries/index.ts`.

## 4. Best Practices and Common Mistakes

- **DO NOT** use UI terminology in keys (e.g. `red_button_text`). Describe the action or semantic meaning (e.g. `confirm_deletion`).
- **DO NOT** place feature-specific text in `common.json`. Keep `common.json` lean.
- **ALWAYS** mirror keys exactly between `en/` and `bn/`. Missing keys will cause the fallback logic to render raw key strings.
- **AVOID** deep nesting. Maximum recommended depth inside a JSON file is 2 levels. (e.g. `"module": { "section": { "key": "value" } }`).
