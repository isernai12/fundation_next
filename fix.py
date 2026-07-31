import os, re

files = [
    "src/features/contributions/components/contributions-table.tsx",
    "src/features/contributions/components/contribution-form-dialog.tsx",
    "src/features/contributions/components/contribution-form.tsx",
    "src/features/contributions/components/edit-contribution-sheet.tsx",
    "src/features/campaigns/components/campaign-contribution-form.tsx",
    "src/features/campaigns/components/campaign-form.tsx",
    "src/features/campaigns/components/edit-campaign-contribution-sheet.tsx",
    "src/features/grants/components/grant-form.tsx",
    "src/features/donors/components/edit-donation-sheet.tsx",
    "src/features/loans/components/receive-loan-payment-form.tsx",
    "src/features/loans/components/loan-form.tsx"
]

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    orig_content = content
    # 1. Edit contribution-form-dialog.tsx
    if "contribution-form-dialog" in filepath:
        content = content.replace("const currentYear = getNow().getFullYear()", "")
        content = content.replace("const currentMonth = getNow().getMonth() + 1", "")
        content = content.replace("month: currentMonth", "month: 1")
        content = content.replace("year: currentYear", "year: 2026")
        content = content.replace("paymentDate: getNow().toLocaleDateString(\"en-CA\")", "paymentDate: \"\"")
        content = content.replace("paymentDate: getNow().toLocaleDateString('en-CA')", "paymentDate: \"\"")
        
        insert_idx = content.find("async function onSubmit")
        if insert_idx != -1 and "useEffect(() => {" not in content:
            eff = "\n  useEffect(() => {\n    form.setValue(\"month\", getNow().getMonth() + 1)\n    form.setValue(\"year\", getNow().getFullYear())\n    form.setValue(\"paymentDate\", getNow().toLocaleDateString(\"en-CA\"))\n  }, [form])\n\n  "
            content = content[:insert_idx] + eff + content[insert_idx:]
            if "useEffect" not in content[:200]:
                content = content.replace("import { useState", "import { useState, useEffect", 1)
        
    # 2. Edit contribution-form.tsx
    elif "contribution-form.tsx" in filepath:
        content = content.replace("month: getNow().getMonth() + 1", "month: 1")
        content = content.replace("year: getNow().getFullYear()", "year: 2026")
        content = content.replace("paymentDate: getNow().toLocaleDateString(\"en-CA\")", "paymentDate: \"\"")
        content = content.replace("paymentDate: getNow().toLocaleDateString('en-CA')", "paymentDate: \"\"")
        
        insert_idx = content.find("async function onSubmit")
        if insert_idx != -1 and "useEffect(() => {" not in content:
            eff = "\n  useEffect(() => {\n    form.setValue(\"month\", getNow().getMonth() + 1)\n    form.setValue(\"year\", getNow().getFullYear())\n    form.setValue(\"paymentDate\", getNow().toLocaleDateString(\"en-CA\"))\n  }, [form])\n\n  "
            content = content[:insert_idx] + eff + content[insert_idx:]
            if "useEffect" not in content[:200]:
                content = content.replace("import { useState", "import { useState, useEffect", 1)

    # 3. All other forms with just a date
    else:
        replacements = [
            (r"date: getNow\(\)\.toLocaleDateString\(['\"]en-CA['\"]\)", "date", "getNow().toLocaleDateString('en-CA')"),
            (r"grantDate: getNow\(\)\.toLocaleDateString\(['\"]en-CA['\"]\)", "grantDate", "getNow().toLocaleDateString('en-CA')"),
            (r"startDate: getNow\(\)\.toLocaleDateString\(['\"]en-CA['\"]\)", "startDate", "getNow().toLocaleDateString('en-CA')"),
            (r"paymentDate: new Date\(\)", "paymentDate", "new Date()"),
            (r"firstInstallmentDate: new Date\(\)", "firstInstallmentDate", "new Date()")
        ]
        
        for pat, key, val in replacements:
            if re.search(pat, content):
                content = re.sub(pat, key + r': ""', content)
                insert_idx = content.find("async function onSubmit")
                if insert_idx != -1 and "useEffect(() => {" not in content:
                    eff = "\n  useEffect(() => {\n    form.setValue(\"" + key + "\", " + val + ")\n  }, [form])\n\n  "
                    content = content[:insert_idx] + eff + content[insert_idx:]
                    if "useEffect" not in content[:200]:
                        content = content.replace("import { useState", "import { useState, useEffect", 1)
                        if "import { useState" not in orig_content[:200]: # Some files don't have useState
                            content = content.replace("import { useForm", "import { useState, useEffect }\nimport { useForm", 1)

    if orig_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated", filepath)
