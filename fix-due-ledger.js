const fs = require('fs');

// Fix due/page.tsx
let dueContent = fs.readFileSync('src/app/contributions/due/page.tsx', 'utf8');

dueContent = dueContent.replace(/<Trans tKey="app\.text" \/><\/Link>/, '<Trans tKey="contributions.due.breadcrumb.home" /></Link>');
dueContent = dueContent.replace(/<span className="font-medium text-foreground"><Trans tKey="app\.text" \/><\/span>/, '<span className="font-medium text-foreground"><Trans tKey="contributions.due.breadcrumb.due" /></span>');

dueContent = dueContent.replace(/<div className="flex items-center justify-between">/, '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">');
dueContent = dueContent.replace(/<h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app\.text" \/><\/h1>/, '<h1 className="text-3xl font-bold tracking-tight"><Trans tKey="contributions.due.pageTitle" /></h1>');
dueContent = dueContent.replace(/<Trans tKey="app\.text" \/>\{formatMonth\(getNow\(\)\.getMonth\(\)\)\} \{currentYear\} <Trans tKey="app\.text" \/>/, '<Trans tKey="contributions.due.subtitle" /> {formatMonth(getNow().getMonth())} {currentYear}');

dueContent = dueContent.replace(/<TableHead><Trans tKey="app\.text" \/><\/TableHead>\s*<TableHead><Trans tKey="app\.text" \/><\/TableHead>\s*<TableHead><Trans tKey="app\.text" \/><\/TableHead>\s*<TableHead><Trans tKey="app\.text" \/><\/TableHead>\s*<TableHead><Trans tKey="app\.text" \/><\/TableHead>/,
`<TableHead><Trans tKey="contributions.due.columns.member" /></TableHead>
              <TableHead><Trans tKey="contributions.due.columns.group" /></TableHead>
              <TableHead><Trans tKey="contributions.due.columns.status" /></TableHead>
              <TableHead><Trans tKey="contributions.due.columns.period" /></TableHead>
              <TableHead><Trans tKey="contributions.due.columns.actions" /></TableHead>`);

dueContent = dueContent.replace(/<AlertCircle className="h-3 w-3" \/> <Trans tKey="app\.text" \/><\/Badge>/, '<AlertCircle className="h-3 w-3" /> <Trans tKey="contributions.due.unpaid" /></Badge>');
dueContent = dueContent.replace(/<TableCell><Trans tKey="app\.text" \/><\/TableCell>/, '<TableCell>{formatMonth(currentMonth - 1)} {currentYear}</TableCell>');
dueContent = dueContent.replace(/<Trans tKey="app\.text" \/><\/Link>/, '<Trans tKey="contributions.due.receiveAction" /></Link>');
dueContent = dueContent.replace(/<Trans tKey="app\.text" \/><\/TableCell>/, '<Trans tKey="contributions.due.empty" /></TableCell>');

fs.writeFileSync('src/app/contributions/due/page.tsx', dueContent);

// Fix ledger/page.tsx
let ledgerContent = fs.readFileSync('src/app/contributions/ledger/page.tsx', 'utf8');

ledgerContent = ledgerContent.replace(/<Trans tKey="app\.text" \/><\/Link>/, '<Trans tKey="contributions.ledger.breadcrumb.home" /></Link>');
ledgerContent = ledgerContent.replace(/<span className="font-medium text-foreground"><Trans tKey="app\.text" \/><\/span>/, '<span className="font-medium text-foreground"><Trans tKey="contributions.ledger.breadcrumb.ledger" /></span>');

ledgerContent = ledgerContent.replace(/<h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app\.text" \/><\/h1>/, '<h1 className="text-3xl font-bold tracking-tight"><Trans tKey="contributions.ledger.pageTitle" /></h1>');
ledgerContent = ledgerContent.replace(/<p className="text-muted-foreground"><Trans tKey="app\.text" \/><\/p>/, '<p className="text-muted-foreground"><Trans tKey="contributions.ledger.subtitle" /></p>');

ledgerContent = ledgerContent.replace(/<div className="text-xl font-semibold"><Trans tKey="app\.text" \/><\/div>/, '<div className="text-xl font-semibold"><Trans tKey="contributions.ledger.comingSoon" /></div>');
ledgerContent = ledgerContent.replace(/<p className="text-muted-foreground"><Trans tKey="app\.text" \/><\/p>/, '<p className="text-muted-foreground"><Trans tKey="contributions.ledger.comingSoonDesc" /></p>');

fs.writeFileSync('src/app/contributions/ledger/page.tsx', ledgerContent);
console.log('Fixed pages');
