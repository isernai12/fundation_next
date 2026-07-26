const fs = require('fs');

const path = './src/components/layout/sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace lucide imports
content = content.replace(/import {[^}]+} from "lucide-react"/, 'import { ChevronDown, X } from "lucide-react"');

// Rewrite sidebar items
const newItems = `type SubMenuItem = {
  name: string
  href: string
}

type MenuItem = {
  name: string
  href: string
  iconName: string
  submenu?: SubMenuItem[]
}

type Section = {
  title: string
  items: MenuItem[]
}

const sidebarSections: Section[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", iconName: "dashboard" },
      { 
        name: "Members", 
        href: "/members", 
        iconName: "group",
        submenu: [
          { name: "নতুন সদস্য", href: "/members/new" },
          { name: "সদস্য ব্যবস্থাপনা", href: "/members/manage" },
          { name: "সদস্য লেজার", href: "/members/ledger" },
          { name: "বকেয়া চাঁদা", href: "/members/dues" },
        ]
      },
      { 
        name: "Beneficiaries", 
        href: "/beneficiaries", 
        iconName: "diversity_3",
        submenu: [
          { name: "নতুন সুবিধাভোগী", href: "/beneficiaries/new" },
          { name: "সুবিধাভোগী ব্যবস্থাপনা", href: "/beneficiaries/manage" },
          { name: "সুবিধাভোগী লেজার", href: "/beneficiaries/ledger" },
          { name: "সহায়তার ইতিহাস", href: "/beneficiaries/assistance-history" },
          { name: "ঋণের ইতিহাস", href: "/beneficiaries/loan-history" },
        ]
      },
    ]
  },
  {
    title: "Finance",
    items: [
      { 
        name: "Donations", 
        href: "/donors", 
        iconName: "volunteer_activism",
        submenu: [
          { name: "নতুন অনুদানদাতা", href: "/donors/new" },
          { name: "অনুদানদাতা ব্যবস্থাপনা", href: "/donors/manage" },
          { name: "অনুদান গ্রহণ", href: "/donors/receive" },
          { name: "অনুদান লেজার", href: "/donors/ledger" },
        ]
      },
      { 
        name: "Financial Support", 
        href: "/campaigns", 
        iconName: "payments",
        submenu: [
          { name: "নতুন তহবিল", href: "/campaigns/new" },
          { name: "তহবিল ব্যবস্থাপনা", href: "/campaigns/manage" },
          { name: "তহবিলে অর্থ গ্রহণ", href: "/campaigns/contribute" },
          { name: "তহবিল লেজার", href: "/campaigns/ledger" },
        ]
      },
      { 
        name: "Fund Collection", 
        href: "/contributions", 
        iconName: "savings",
        submenu: [
          { name: "তহবিল গ্রহণ", href: "/contributions/new" },
          { name: "মাসিক চাঁদা", href: "/contributions/monthly" },
          { name: "চাঁদা ব্যবস্থাপনা", href: "/contributions" },
          { name: "বকেয়া চাঁদা", href: "/contributions/due" },
          { name: "চাঁদা লেজার", href: "/contributions/ledger" },
        ]
      },
      { 
        name: "Loans", 
        href: "/loans", 
        iconName: "account_balance",
        submenu: [
          { name: "নতুন ঋণ", href: "/loans/new" },
          { name: "ঋণ ব্যবস্থাপনা", href: "/loans" },
          { name: "ঋণ পরিশোধ", href: "/loans/repayments" },
          { name: "ঋণ লেজার", href: "/loans/ledger" },
        ]
      },
      { 
        name: "Grants", 
        href: "/grants", 
        iconName: "redeem",
        submenu: [
          { name: "নতুন অনুদান", href: "/grants/new" },
          { name: "অনুদান ব্যবস্থাপনা", href: "/grants/manage" },
          { name: "অনুদান লেজার", href: "/grants/ledger" },
        ]
      },
    ]
  },
  {
    title: "Organization",
    items: [
      { 
        name: "Groups", 
        href: "/groups", 
        iconName: "groups",
        submenu: [
          { name: "নতুন গ্রুপ", href: "/groups/new" },
          { name: "গ্রুপ ব্যবস্থাপনা", href: "/groups/manage" },
          { name: "গ্রুপের সদস্য", href: "/groups/members" },
          { name: "গ্রুপ ফান্ড", href: "/groups/fund" },
          { name: "গ্রুপ লেজার", href: "/groups/ledger" },
        ]
      },
      { name: "Reports", href: "/reports", iconName: "analytics" },
      { name: "Settings", href: "/settings", iconName: "settings" },
    ]
  }
]`;

content = content.replace(/type SubMenuItem[\s\S]*?\]\n/, newItems + '\n');
content = content.replace(/sidebarItems/g, 'sidebarSections.flatMap(s => s.items)');
fs.writeFileSync(path, content);
