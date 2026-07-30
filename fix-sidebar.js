const fs = require('fs');
let code = fs.readFileSync('src/components/layout/sidebar.tsx', 'utf8');

// Add import
code = code.replace(
  'import { useSidebar } from "@/components/layout/sidebar-provider"',
  'import { useSidebar } from "@/components/layout/sidebar-provider"\nimport { useRbac } from "@/components/providers/rbac-provider"'
);

// Add permission to types
code = code.replace(
  'type SubMenuItem = {\n  name: string\n  href: string\n}',
  'type SubMenuItem = {\n  name: string\n  href: string\n  permission?: string\n}'
);

code = code.replace(
  'type MenuItem = {\n  name: string\n  href: string\n  icon: React.ElementType\n  submenu?: SubMenuItem[]\n}',
  'type MenuItem = {\n  name: string\n  href: string\n  icon: React.ElementType\n  permission?: string\n  submenu?: SubMenuItem[]\n}'
);

// Replace the static sections with a function or just add permission fields
// Wait, I can just use a regex or string replacement for the items.
// Actually, it's easier to just map them dynamically in the component or add them here.

const sectionStr = `const sidebarSections: Section[] = [
  {
    title: "প্রধান মেনু",
    items: [
      { name: "ড্যাশবোর্ড", href: "/", icon: LayoutDashboard, permission: "Dashboard:View" },
      { 
        name: "সদস্য", 
        href: "/members", 
        icon: Users,
        permission: "Members:View",
        submenu: [
          { name: "নতুন সদস্য", href: "/members/new", permission: "Members:Add" },
          { name: "সদস্য ব্যবস্থাপনা", href: "/members/manage" },
          { name: "সদস্য লেজার", href: "/members/ledger" },
          { name: "বকেয়া চাঁদা", href: "/members/dues" },
        ]
      },
      { 
        name: "সুবিধাভোগী", 
        href: "/beneficiaries", 
        icon: UserRoundCheck,
        permission: "Beneficiaries:View",
        submenu: [
          { name: "নতুন সুবিধাভোগী", href: "/beneficiaries/new", permission: "Beneficiaries:Add" },
          { name: "সুবিধাভোগী ব্যবস্থাপনা", href: "/beneficiaries/manage" },
          { name: "সুবিধাভোগী লেজার", href: "/beneficiaries/ledger" },
          { name: "সহায়তার ইতিহাস", href: "/beneficiaries/assistance-history" },
          { name: "ঋণের ইতিহাস", href: "/beneficiaries/loan-history" },
        ]
      },
    ]
  },
  {
    title: "আর্থিক কার্যক্রম",
    items: [
      { 
        name: "অনুদানদাতা", 
        href: "/donors", 
        icon: HandCoins,
        permission: "Donors:View",
        submenu: [
          { name: "নতুন অনুদানদাতা", href: "/donors/new", permission: "Donors:Add" },
          { name: "অনুদানদাতা ব্যবস্থাপনা", href: "/donors/manage" },
          { name: "অনুদান গ্রহণ", href: "/donors/receive" },
          { name: "অনুদান লেজার", href: "/donors/ledger" },
        ]
      },
      { 
        name: "আর্থিক কার্যক্রম", 
        href: "/campaigns", 
        icon: WalletCards,
        permission: "Fund Collection:View",
        submenu: [
          { name: "নতুন তহবিল", href: "/campaigns/new", permission: "Fund Collection:Add" },
          { name: "তহবিল ব্যবস্থাপনা", href: "/campaigns/manage" },
          { name: "তহবিলে অর্থ গ্রহণ", href: "/campaigns/contribute", permission: "Fund Collection:Add" },
          { name: "তহবিল লেজার", href: "/campaigns/ledger" },
        ]
      },
      { 
        name: "তহবিল / চাঁদা", 
        href: "/contributions", 
        icon: PiggyBank,
        permission: "Fund Collection:View",
        submenu: [
          { name: "তহবিল গ্রহণ", href: "/contributions/new", permission: "Fund Collection:Add" },
          { name: "মাসিক চাঁদা", href: "/contributions/monthly" },
          { name: "চাঁদা ব্যবস্থাপনা", href: "/contributions" },
          { name: "বকেয়া চাঁদা", href: "/contributions/due" },
          { name: "চাঁদা লেজার", href: "/contributions/ledger" },
        ]
      },
      { 
        name: "ঋণ", 
        href: "/loans", 
        icon: Landmark,
        permission: "Loans:View",
        submenu: [
          { name: "নতুন ঋণ", href: "/loans/new", permission: "Loans:Create" },
          { name: "ঋণ ব্যবস্থাপনা", href: "/loans" },
          { name: "ঋণ পরিশোধ", href: "/loans/repayments", permission: "Loans:Receive Installment" },
          { name: "ঋণ লেজার", href: "/loans/ledger" },
        ]
      },
      { 
        name: "অনুদান", 
        href: "/grants", 
        icon: Gift,
        permission: "Grants:View",
        submenu: [
          { name: "নতুন অনুদান", href: "/grants/new", permission: "Grants:Create" },
          { name: "অনুদান ব্যবস্থাপনা", href: "/grants/manage" },
          { name: "অনুদান লেজার", href: "/grants/ledger" },
        ]
      },
    ]
  },
  {
    title: "সংগঠন",
    items: [
      { 
        name: "গ্রুপ", 
        href: "/groups", 
        icon: UsersRound,
        permission: "Groups:View",
        submenu: [
          { name: "নতুন গ্রুপ", href: "/groups/new", permission: "Groups:Create" },
          { name: "গ্রুপ ব্যবস্থাপনা", href: "/groups/manage" },
          { name: "গ্রুপের সদস্য", href: "/groups/members" },
          { name: "গ্রুপ ফান্ড", href: "/groups/fund" },
          { name: "গ্রুপ লেজার", href: "/groups/ledger" },
        ]
      },
      { name: "সেটিংস", href: "/settings", icon: Settings, permission: "Settings:View" },
    ]
  }
]`;

code = code.replace(/const sidebarSections: Section\[\] = \[[\s\S]*?\]\n\]/, sectionStr);

// In Sidebar, filter sections
code = code.replace(
  'const { isOpen, setIsOpen, isCollapsed } = useSidebar()',
  'const { isOpen, setIsOpen, isCollapsed } = useSidebar()\n  const { permissions, can } = useRbac()\n\n  const filteredSections = React.useMemo(() => {\n    if (permissions.includes("*")) return sidebarSections;\n    return sidebarSections.map(section => ({\n      ...section,\n      items: section.items.filter(item => !item.permission || can(item.permission.split(":")[0], item.permission.split(":")[1])).map(item => ({\n        ...item,\n        submenu: item.submenu?.filter(sub => !sub.permission || can(sub.permission.split(":")[0], sub.permission.split(":")[1]))\n      }))\n    })).filter(section => section.items.length > 0)\n  }, [permissions, can])'
);

code = code.replace(/sidebarSections\.flatMap/g, 'filteredSections.flatMap');
code = code.replace(/sidebarSections\.map/g, 'filteredSections.map');

fs.writeFileSync('src/components/layout/sidebar.tsx', code);
console.log("Sidebar updated");
