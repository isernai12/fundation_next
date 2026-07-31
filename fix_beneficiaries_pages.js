const fs = require('fs');

// 1. Fix app/beneficiaries/new/page.tsx
let newPage = fs.readFileSync('src/app/beneficiaries/new/page.tsx', 'utf8');

// Add import if missing
if (!newPage.includes('import { Trans }')) {
  newPage = newPage.replace(/import { ChevronRight } from "lucide-react"\n/, 'import { ChevronRight } from "lucide-react"\nimport { Trans } from "@/components/shared/trans"\n');
}

newPage = newPage.replace(/Beneficiaries\s*<\/Link>/, '<Trans tKey="beneficiaries.breadcrumbs.index" />\n        </Link>');
newPage = newPage.replace(/<span className="font-medium text-foreground">Add Beneficiary<\/span>/, '<span className="font-medium text-foreground"><Trans tKey="beneficiaries.breadcrumbs.add" /></span>');
newPage = newPage.replace(/<h1 className="text-3xl font-bold tracking-tight">Add Beneficiary<\/h1>/, '<h1 className="text-3xl font-bold tracking-tight"><Trans tKey="beneficiaries.add_page.title" /></h1>');
newPage = newPage.replace(/<p className="text-muted-foreground">Register a new beneficiary in the system\.<\/p>/, '<p className="text-muted-foreground"><Trans tKey="beneficiaries.add_page.subtitle" /></p>');

fs.writeFileSync('src/app/beneficiaries/new/page.tsx', newPage);

// 2. Fix app/beneficiaries/manage/page.tsx
let managePage = fs.readFileSync('src/app/beneficiaries/manage/page.tsx', 'utf8');

// Add import if missing
if (!managePage.includes('import { Trans }')) {
  managePage = managePage.replace(/import { ChevronRight } from "lucide-react"\n/, 'import { ChevronRight } from "lucide-react"\nimport { Trans } from "@/components/shared/trans"\n');
}

managePage = managePage.replace(/Beneficiaries\s*<\/Link>/, '<Trans tKey="beneficiaries.breadcrumbs.index" />\n        </Link>');
managePage = managePage.replace(/<span className="font-medium text-foreground">Manage Beneficiaries<\/span>/, '<span className="font-medium text-foreground"><Trans tKey="beneficiaries.breadcrumbs.manage" /></span>');
managePage = managePage.replace(/<h1 className="text-3xl font-bold tracking-tight">Manage Beneficiaries<\/h1>/, '<h1 className="text-3xl font-bold tracking-tight"><Trans tKey="beneficiaries.manage_page.title" /></h1>');
managePage = managePage.replace(/Administrate and manage all registered beneficiaries\./, '<Trans tKey="beneficiaries.manage_page.subtitle" />');

fs.writeFileSync('src/app/beneficiaries/manage/page.tsx', managePage);

// 3. Update dictionaries
const enPath = 'src/i18n/dictionaries/en/beneficiaries.json';
const bnPath = 'src/i18n/dictionaries/bn/beneficiaries.json';

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

en.breadcrumbs = {
  index: "Beneficiaries",
  add: "Add Beneficiary",
  manage: "Manage Beneficiaries"
};
bn.breadcrumbs = {
  index: "সুবিধাভোগী",
  add: "সুবিধাভোগী যুক্ত করুন",
  manage: "সুবিধাভোগী পরিচালনা করুন"
};

en.add_page = {
  title: "Add Beneficiary",
  subtitle: "Register a new beneficiary in the system."
};
bn.add_page = {
  title: "নতুন সুবিধাভোগী যুক্ত করুন",
  subtitle: "সিস্টেমে নতুন সুবিধাভোগী নিবন্ধন করুন।"
};

en.manage_page = {
  title: "Manage Beneficiaries",
  subtitle: "Administrate and manage all registered beneficiaries."
};
bn.manage_page = {
  title: "সুবিধাভোগী পরিচালনা করুন",
  subtitle: "নিবন্ধিত সকল সুবিধাভোগীকে পরিচালনা করুন।"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
