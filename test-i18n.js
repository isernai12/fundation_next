const { enDictionaries, bnDictionaries } = require("./src/i18n/dictionaries");

const en = { ...enDictionaries };

const t = (path) => {
  if (!path) return ""
  const keys = path.split(".")
  let current = en
  
  for (const key of keys) {
    if (current === undefined || current[key] === undefined) {
      return "FALLBACK: " + path;
    }
    current = current[key]
  }
  return current;
}

console.log(t("beneficiaries.form.personal_info"));
