export interface PermissionActionConfig {
  module: string
  action: string
  label: string
}

export interface SubmenuPermissionConfig {
  id: string
  name: string
  href?: string
  permissions: PermissionActionConfig[]
}

export interface ModulePermissionConfig {
  id: string
  name: string
  moduleKey: string
  submenus: SubmenuPermissionConfig[]
}

export const HIERARCHICAL_PERMISSIONS_CONFIG: ModulePermissionConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard / ড্যাশবোর্ড",
    moduleKey: "Dashboard",
    submenus: [
      {
        id: "dashboard_overview",
        name: "ড্যাশবোর্ড সারসংক্ষেপ (Overview)",
        href: "/",
        permissions: [
          { module: "Dashboard", action: "View", label: "ড্যাশবোর্ড দেখুন (View)" }
        ]
      }
    ]
  },
  {
    id: "members",
    name: "Members / সদস্য ব্যবস্থাপনা",
    moduleKey: "Members",
    submenus: [
      {
        id: "members_manage",
        name: "সদস্য ব্যবস্থাপনা (Manage Members)",
        href: "/members/manage",
        permissions: [
          { module: "Members", action: "View", label: "সদস্য তালিকা দেখুন (View)" },
          { module: "Members", action: "Edit", label: "সদস্য সম্পাদনা (Edit)" },
          { module: "Members", action: "Delete", label: "সদস্য মুছুন (Delete)" }
        ]
      },
      {
        id: "members_add",
        name: "নতুন সদস্য যোগ (Add Member)",
        href: "/members/new",
        permissions: [
          { module: "Members", action: "Add", label: "নতুন সদস্য তৈরি করুন (Add)" }
        ]
      },
      {
        id: "members_ledger",
        name: "সদস্য লেজার (Member Ledger)",
        href: "/members/ledger",
        permissions: [
          { module: "Members", action: "View", label: "লেজার দেখুন (View)" }
        ]
      },
      {
        id: "members_dues",
        name: "বকেয়া চাঁদা (Member Dues)",
        href: "/members/dues",
        permissions: [
          { module: "Members", action: "View", label: "বকেয়া হিসাব দেখুন (View)" }
        ]
      }
    ]
  },
  {
    id: "beneficiaries",
    name: "Beneficiaries / সুবিধাভোগী",
    moduleKey: "Beneficiaries",
    submenus: [
      {
        id: "beneficiaries_manage",
        name: "সুবিধাভোগী ব্যবস্থাপনা (Manage Beneficiaries)",
        href: "/beneficiaries/manage",
        permissions: [
          { module: "Beneficiaries", action: "View", label: "সুবিধাভোগী দেখুন (View)" },
          { module: "Beneficiaries", action: "Edit", label: "সম্পাদনা ও স্ট্যাটাস পরিবর্তন (Edit/Activate)", },
          { module: "Beneficiaries", action: "Delete", label: "সুবিধাভোগী মুছুন (Delete)" }
        ]
      },
      {
        id: "beneficiaries_add",
        name: "নতুন সুবিধাভোগী যোগ (Add Beneficiary)",
        href: "/beneficiaries/new",
        permissions: [
          { module: "Beneficiaries", action: "Add", label: "নতুন সুবিধাভোগী তৈরি করুন (Add)" }
        ]
      },
      {
        id: "beneficiaries_ledger",
        name: "সুবিধাভোগী লেজার ও ইতিহাস",
        href: "/beneficiaries/ledger",
        permissions: [
          { module: "Beneficiaries", action: "View", label: "ইতিহাস ও লেজার দেখুন (View)" }
        ]
      }
    ]
  },
  {
    id: "donors",
    name: "Donors / অনুদানদাতা",
    moduleKey: "Donors",
    submenus: [
      {
        id: "donors_manage",
        name: "অনুদানদাতা ব্যবস্থাপনা (Manage Donors)",
        href: "/donors/manage",
        permissions: [
          { module: "Donors", action: "View", label: "অনুদানদাতা দেখুন (View)" },
          { module: "Donors", action: "Edit", label: "সম্পাদনা (Edit)" },
          { module: "Donors", action: "Delete", label: "মুছুন (Delete)" }
        ]
      },
      {
        id: "donors_add",
        name: "নতুন অনুদানদাতা (Add Donor)",
        href: "/donors/new",
        permissions: [
          { module: "Donors", action: "Add", label: "তৈরি করুন (Add)" }
        ]
      },
      {
        id: "donors_receive",
        name: "অনুদান গ্রহণ (Receive Donation)",
        href: "/donors/receive",
        permissions: [
          { module: "Donors", action: "Receive Installment", label: "অনুদান গ্রহণ করুন (Receive)" }
        ]
      }
    ]
  },
  {
    id: "fund_collection",
    name: "Fund Collection / তহবিল ও চাঁদা",
    moduleKey: "Fund Collection",
    submenus: [
      {
        id: "contributions_manage",
        name: "চাঁদা ব্যবস্থাপনা (Manage Contributions)",
        href: "/contributions",
        permissions: [
          { module: "Fund Collection", action: "View", label: "চাঁদা তালিকা দেখুন (View)" },
          { module: "Fund Collection", action: "Edit", label: "চাঁদা তথ্য সম্পাদনা (Edit)" },
          { module: "Fund Collection", action: "Delete", label: "চাঁদা রেকর্ড মুছুন (Delete)" }
        ]
      },
      {
        id: "contributions_add",
        name: "তহবিল / চাঁদা গ্রহণ (Collect Fund)",
        href: "/contributions/new",
        permissions: [
          { module: "Fund Collection", action: "Add", label: "চাঁদা জমা করুন (Add)" }
        ]
      }
    ]
  },
  {
    id: "loans",
    name: "Loans / ঋণ",
    moduleKey: "Loans",
    submenus: [
      {
        id: "loans_manage",
        name: "ঋণ ব্যবস্থাপনা (Manage Loans)",
        href: "/loans",
        permissions: [
          { module: "Loans", action: "View", label: "ঋণ তালিকা দেখুন (View)" },
          { module: "Loans", action: "Edit", label: "ঋণ সংশোধন করুন (Edit)" },
          { module: "Loans", action: "Delete", label: "ঋণ মুছুন (Delete)" }
        ]
      },
      {
        id: "loans_add",
        name: "নতুন ঋণ প্রদান (New Loan)",
        href: "/loans/new",
        permissions: [
          { module: "Loans", action: "Add", label: "ঋণ আবেদন তৈরি করুন (Add)" }
        ]
      },
      {
        id: "loans_repayments",
        name: "ঋণ পরিশোধ ও কিস্তি (Repayments)",
        href: "/loans/repayments",
        permissions: [
          { module: "Loans", action: "Manage", label: "কিস্তি গ্রহণ ও সমাপ্ত করুন (Manage)" }
        ]
      }
    ]
  },
  {
    id: "grants",
    name: "Grants / অনুদান",
    moduleKey: "Grants",
    submenus: [
      {
        id: "grants_manage",
        name: "অনুদান ব্যবস্থাপনা (Manage Grants)",
        href: "/grants/manage",
        permissions: [
          { module: "Grants", action: "View", label: "অনুদান তালিকা দেখুন (View)" },
          { module: "Grants", action: "Edit", label: "অনুদান সম্পাদনা (Edit)" },
          { module: "Grants", action: "Delete", label: "অনুদান মুছুন (Delete)" }
        ]
      },
      {
        id: "grants_add",
        name: "নতুন অনুদান (New Grant)",
        href: "/grants/new",
        permissions: [
          { module: "Grants", action: "Add", label: "নতুন অনুদান প্রদান করুন (Add)" }
        ]
      }
    ]
  },
  {
    id: "groups",
    name: "Groups / গ্রুপ",
    moduleKey: "Groups",
    submenus: [
      {
        id: "groups_manage",
        name: "গ্রুপ ব্যবস্থাপনা (Manage Groups)",
        href: "/groups/manage",
        permissions: [
          { module: "Groups", action: "View", label: "গ্রুপ তালিকা দেখুন (View)" },
          { module: "Groups", action: "Edit", label: "গ্রুপ তথ্য সংশোধন (Edit)" },
          { module: "Groups", action: "Delete", label: "গ্রুপ আর্কাইভ/মুছুন (Delete)" }
        ]
      },
      {
        id: "groups_add",
        name: "নতুন গ্রুপ তৈরি (New Group)",
        href: "/groups/new",
        permissions: [
          { module: "Groups", action: "Add", label: "নতুন গ্রুপ তৈরি করুন (Add)" }
        ]
      }
    ]
  },
  {
    id: "reports",
    name: "Reports / রিপোর্ট",
    moduleKey: "Reports",
    submenus: [
      {
        id: "reports_view",
        name: "রিপোর্ট ও অ্যানালিটিক্স",
        href: "/reports",
        permissions: [
          { module: "Reports", action: "View", label: "আর্থিক ও কার্যক্রম রিপোর্ট দেখুন (View)" }
        ]
      }
    ]
  },
  {
    id: "users",
    name: "Users / ব্যবহারকারী",
    moduleKey: "Users",
    submenus: [
      {
        id: "users_manage",
        name: "ব্যবহারকারী তালিকা ও পারমিশন",
        href: "/settings/users",
        permissions: [
          { module: "Users", action: "View", label: "ব্যবহারকারী দেখুন (View)" },
          { module: "Users", action: "Edit", label: "তথ্য ও কাস্টম পারমিশন সম্পাদনা (Edit)" },
          { module: "Users", action: "Delete", label: "ব্যবহারকারী মুছুন (Delete)" }
        ]
      },
      {
        id: "users_add",
        name: "নতুন ব্যবহারকারী তৈরি",
        href: "/settings/users",
        permissions: [
          { module: "Users", action: "Add", label: "নতুন অ্যাকাউন্ট খুলুন (Add)" }
        ]
      }
    ]
  },
  {
    id: "roles_permissions",
    name: "Roles & Permissions / রোলস ও পারমিশন",
    moduleKey: "Roles & Permissions",
    submenus: [
      {
        id: "roles_manage",
        name: "রোল পারমিশন কনফিগারেশন",
        href: "/settings/roles",
        permissions: [
          { module: "Roles & Permissions", action: "View", label: "রোল দেখুন (View)" },
          { module: "Roles & Permissions", action: "Manage", label: "পারমিশন পরিবর্তন ও সংরক্ষণ (Manage)" }
        ]
      }
    ]
  },
  {
    id: "settings",
    name: "Settings / সেটিংস",
    moduleKey: "Settings",
    submenus: [
      {
        id: "settings_general",
        name: "সাধারণ ও সিস্টেম সেটিংস",
        href: "/settings",
        permissions: [
          { module: "Settings", action: "View", label: "সেটিংস দেখুন (View)" },
          { module: "Settings", action: "Edit", label: "সেটিংস সংরক্ষণ (Edit)" },
          { module: "Settings", action: "Manage", label: "উন্নত কনফিগারেশন (Manage)" }
        ]
      }
    ]
  }
]
