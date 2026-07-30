const fs = require('fs');
const path = require('path');

const layoutsToCreate = [
  { dir: 'members', module: 'Members', action: 'View' },
  { dir: 'beneficiaries', module: 'Beneficiaries', action: 'View' },
  { dir: 'donors', module: 'Donors', action: 'View' },
  { dir: 'campaigns', module: 'Fund Collection', action: 'View' },
  { dir: 'contributions', module: 'Fund Collection', action: 'View' },
  { dir: 'loans', module: 'Loans', action: 'View' },
  { dir: 'grants', module: 'Grants', action: 'View' },
  { dir: 'groups', module: 'Groups', action: 'View' },
  { dir: 'settings', module: 'Settings', action: 'View' },
];

for (const item of layoutsToCreate) {
  const dirPath = path.join(__dirname, 'src', 'app', item.dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const layoutPath = path.join(dirPath, 'layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    const code = `import { authorizePage } from "@/lib/rbac"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await authorizePage("${item.module}", "${item.action}")
  
  return <>{children}</>
}
`;
    fs.writeFileSync(layoutPath, code);
    console.log(`Created layout for ${item.dir}`);
  } else {
    console.log(`Layout already exists for ${item.dir}`);
  }
}
