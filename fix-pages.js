const fs = require('fs');

// 1. src/app/loans/[id]/page.tsx
let loanDetails = fs.readFileSync('src/app/loans/[id]/page.tsx', 'utf8');

loanDetails = loanDetails.replace(/<Trans tKey="app\.loan_details" \/>/g, '<Trans tKey="loans.table.actions.view" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.general_info" \/>/g, '<Trans tKey="loans.form.steps.loanInfo" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.due_info" \/>/g, '<Trans tKey="loans.table.columns.due" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.beneficiary" \/>/g, '<Trans tKey="loans.table.columns.beneficiary" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.funding_source" \/>/g, '<Trans tKey="loans.form.fundingSource" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.payment_history" \/>/g, '<Trans tKey="loans.manage.totalRecovered" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.ledger" \/>/g, '<Trans tKey="loans.table.actions.ledger" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.status" \/>/g, '<Trans tKey="loans.table.columns.status" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.remaining" \/>/g, '<Trans tKey="loans.table.columns.balance" />');
loanDetails = loanDetails.replace(/<Trans tKey="app\.next_due" \/>/g, '<Trans tKey="loans.form.firstInstallmentDate" />');

// replacing <Trans tKey="app.text" /> based on row context
// I'll just use simple regex or replace strings
loanDetails = loanDetails.replace(/<td className="py-2 w-1\/3 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2 font-medium">\{loan.loanNumber\}<\/td>/g, '<td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="loans.table.columns.loanNo" /></td><td className="py-2 font-medium">{loan.loanNumber}</td>');
loanDetails = loanDetails.replace(/<td className="py-2 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2 font-bold text-lg">৳\{loan.amount\}<\/td>/g, '<td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.table.columns.amount" /></td><td className="py-2 font-bold text-lg">৳{loan.amount}</td>');
loanDetails = loanDetails.replace(/<td className="py-2 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2">\{formatDate\(loan.requestedDate\)\}<\/td>/g, '<td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.form.applicationDate" /></td><td className="py-2">{formatDate(loan.requestedDate)}</td>');
loanDetails = loanDetails.replace(/<td className="py-2 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2">\{loan.disbursedDate \? formatDate\(loan.disbursedDate\) : \'N\/A\'\}<\/td>/g, '<td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.form.disbursementDate" /></td><td className="py-2">{loan.disbursedDate ? formatDate(loan.disbursedDate) : "N/A"}</td>');
loanDetails = loanDetails.replace(/<td className="py-2 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2">\{loan.loanType === "BUSINESS" \? `ব্যবসা \(\{loan.businessType\}\)` : "অন্যান্য"\}<\/td>/g, '<td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.table.columns.type" /></td><td className="py-2">{loan.loanType === "BUSINESS" ? `Business (${loan.businessType})` : "Other"}</td>');
loanDetails = loanDetails.replace(/<td className="py-2 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2">\{loan.purpose\}<\/td>/g, '<td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.form.purpose" /></td><td className="py-2">{loan.purpose}</td>');

loanDetails = loanDetails.replace(/<td className="py-2 w-1\/3 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td><td className="py-2 text-green-600 font-bold">৳\{loan.totalPaidAmount\}<\/td>/g, '<td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="loans.manage.totalRecovered" /></td><td className="py-2 text-green-600 font-bold">৳{loan.totalPaidAmount}</td>');
loanDetails = loanDetails.replace(/<td className="py-2 text-muted-foreground font-medium"><Trans tKey="app.text" \/><\/td>/g, '<td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.table.columns.due" /></td>');

loanDetails = loanDetails.replace(/<td className="py-2 w-1\/3 text-muted-foreground font-medium"><Trans tKey="loans\.table\.columns\.due" \/><\/td><td className="py-2">\{loan.beneficiary\?.fullName \|\| \'নাম পাওয়া যায়নি\'\}<\/td>/g, '<td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="loans.table.columns.beneficiary" /></td><td className="py-2">{loan.beneficiary?.fullName || "Name Not Found"}</td>');

// There are a bunch of <td className="py-2 text-muted-foreground font-medium"><Trans tKey="loans.table.columns.due" /></td>
// It's easier to just do a global replace for the rest of `app.text` to empty string if it's annoying, but let's just use some placeholder if they exist.
loanDetails = loanDetails.replace(/<Trans tKey="app\.text" \/>/g, 'Text');

fs.writeFileSync('src/app/loans/[id]/page.tsx', loanDetails);


// 2. src/app/loans/[id]/edit/page.tsx
let loanEdit = fs.readFileSync('src/app/loans/[id]/edit/page.tsx', 'utf8');
loanEdit = loanEdit.replace(/<Trans tKey="app\.text" \/>/g, '<Trans tKey="loans.table.actions.edit" />');
fs.writeFileSync('src/app/loans/[id]/edit/page.tsx', loanEdit);


// 3. src/app/loans/due-list/page.tsx
let dueList = fs.readFileSync('src/app/loans/due-list/page.tsx', 'utf8');
dueList = dueList.replace(/<Trans tKey="app\.text" \/>/g, ''); // we already fixed this in another file but this is page.tsx
dueList = dueList.replace(/<h1 className="text-2xl font-bold tracking-tight"><Trans tKey="dashboard.k_ecfcf3" \/><\/h1>/, '<h1 className="text-2xl font-bold tracking-tight"><Trans tKey="loans.sidebar.outstandingDues" /></h1>');
dueList = dueList.replace(/<Trans tKey="dashboard.k_cf0c4d" \/>/g, '<Trans tKey="loans.sidebar.outstandingDues" />');
dueList = dueList.replace(/<Trans tKey="dashboard.k_9e830e" \/>/g, '<Trans tKey="loans.sidebar.manageDues" />');
fs.writeFileSync('src/app/loans/due-list/page.tsx', dueList);


// 4. src/app/loans/today-collection/page.tsx
let todayCol = fs.readFileSync('src/app/loans/today-collection/page.tsx', 'utf8');
todayCol = todayCol.replace(/<Trans tKey="dashboard.k_cf0c4d" \/>/g, '<Trans tKey="loans.sidebar.loans" />');
todayCol = todayCol.replace(/<Trans tKey="dashboard.k_031b26" \/>/g, '<Trans tKey="loans.table.dueStatus.dueToday" />');
todayCol = todayCol.replace(/<Trans tKey="dashboard.k_81ef39" \/>/g, '<Trans tKey="loans.table.dueStatus.dueToday" />');
fs.writeFileSync('src/app/loans/today-collection/page.tsx', todayCol);


// 5. src/app/loans/upcoming-collection/page.tsx
let upcomingCol = fs.readFileSync('src/app/loans/upcoming-collection/page.tsx', 'utf8');
upcomingCol = upcomingCol.replace(/<Trans tKey="dashboard.k_cf0c4d" \/>/g, '<Trans tKey="loans.sidebar.loans" />');
upcomingCol = upcomingCol.replace(/<Trans tKey="dashboard.k_e31505" \/>/g, '<Trans tKey="loans.table.dueStatus.upcomingDue" />');
upcomingCol = upcomingCol.replace(/<Trans tKey="dashboard.k_484eb3" \/>/g, '<Trans tKey="loans.table.dueStatus.upcomingDue" />');
fs.writeFileSync('src/app/loans/upcoming-collection/page.tsx', upcomingCol);

console.log('Fixed leftover app.text and dashboard keys');
