# AI Guidelines for i18n Translation Work

As an AI assistant working on the Foundation ERP, you must adhere strictly to these rules when interacting with the i18n translation system.

## 1. Architectural Rules
- The i18n system uses a modular namespace architecture located in `src/i18n/dictionaries/`.
- **DO NOT** edit the legacy monolithic files in `src/i18n/locales/` unless explicitly instructed.
- **DO NOT** create huge, flat translation files. Use the domain-driven modular files provided (`common.json`, `layout.json`, `dashboard.json`, `features/[name].json`).

## 2. Adding New Translations
When a user asks you to add new translations or build a new feature:
1. **Never use hardcoded strings** in the UI. Always use the `t()` function or `<Trans tKey="..." />`.
2. **Determine the Namespace**: Decide which JSON file is most appropriate for the new strings.
3. **Use `snake_case`**: Key names MUST be in `snake_case`. Do not use camelCase or kebab-case.
4. **Synchronization is Mandatory**: For every key you add to an English dictionary (e.g. `en/common.json`), you MUST add the exact same key to the corresponding Bengali dictionary (`bn/common.json`). Failing to synchronize will break the UI in the fallback language.
5. **Updating the Barrel File**: If you create a new feature namespace file (e.g., `en/features/loans.json`), you MUST export it in `src/i18n/dictionaries/index.ts` so the `LanguageProvider` can load it.

## 3. Modifying Existing Keys
- Only change existing keys if there is a spelling mistake or context issue.
- If you modify an existing key structure, ensure you update ALL references in the `.tsx` components, or the UI will crash/display raw keys.

## 4. What NEVER To Do
- **NEVER** put feature-specific module text into `common.json`.
- **NEVER** use dynamic string interpolation for keys if you can avoid it (e.g., `t('status.' + statusVariable)` is hard to statically analyze; try to use explicit mapping).
- **NEVER** use English values as the key name (e.g., `"Save Account": "Save Account"` is WRONG. Use `"save_account": "Save Account"`).
- **NEVER** write Bengali characters inside `en/` dictionaries, and **NEVER** leave English placeholder text inside `bn/` dictionaries.

## 5. Pre-Pull Request Workflow
Before reporting a task as complete:
1. Verify both `en/` and `bn/` dictionaries have structurally identical keys.
2. Ensure you haven't broken the `LanguageProvider.tsx` context object.
3. Verify that the UI displays the translated text properly and no `namespace.key_name` raw strings are visible.
