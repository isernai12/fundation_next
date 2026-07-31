import json
import time
from googletrans import Translator
import re

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

translator = Translator()

def has_bengali(text):
    return bool(re.search(r'[\u0980-\u09FF]', text))

def translate_dict(d):
    for k, v in d.items():
        if isinstance(v, dict):
            translate_dict(v)
        elif isinstance(v, str) and has_bengali(v):
            match = re.search(r'\(([^)]+)\)', v)
            if match and re.match(r'^[A-Za-z0-9\s_-]+$', match.group(1)):
                d[k] = match.group(1).strip()
                print(f"Extracted: {v} -> {d[k]}")
            else:
                try:
                    res = translator.translate(v, src='bn', dest='en')
                    if res and res.text:
                        d[k] = res.text
                        print(f"Translated: {v} -> {res.text}")
                    time.sleep(0.2)
                except Exception as e:
                    print(f"Error translating {v}: {e}")

translate_dict(en_data)

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)
print("Done translating en.json")
