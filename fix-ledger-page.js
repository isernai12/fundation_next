const fs = require('fs');
let content = fs.readFileSync('src/app/loans/ledger/page.tsx', 'utf8');

content = content.replace(/import \{ getTranslations \} from "@\/i18n\/LanguageProvider"\n\n/, '');
content = content.replace(/const \{ loanId \} = searchParams\n  const \{ t \} = await getTranslations\(\)/, 'const { loanId } = searchParams');

content = content.replace(/<h1 className="text-2xl font-bold tracking-tight">\{specificLoan \? `\$\{t\("loans\.ledger\.pageTitle"\)\} - \$\{specificLoan\.loanNumber\}` : t\("loans\.ledger\.pageTitle"\)\}<\/h1>/, 
  '<h1 className="text-2xl font-bold tracking-tight"><Trans tKey="loans.ledger.pageTitle" />{specificLoan ? ` - ${specificLoan.loanNumber}` : ""}</h1>'
);

content = content.replace(/\{specificLoan \? t\("loans\.ledger\.subtitleSpecific"\)\.replace\("\{name\}", specificLoan\.beneficiary\?\.fullName \|\| ""\)\.replace\("\{amount\}", specificLoan\.amount\)\.replace\("\{remaining\}", specificLoan\.remainingBalance\) : t\("loans\.ledger\.subtitle"\)\}/, 
  '{specificLoan ? `Ledger for ${specificLoan.beneficiary?.fullName}. Total Loan: ৳${specificLoan.amount}, Remaining: ৳${specificLoan.remainingBalance}` : <Trans tKey="loans.ledger.subtitle" />}'
);

fs.writeFileSync('src/app/loans/ledger/page.tsx', content);
