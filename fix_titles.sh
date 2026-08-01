#!/bin/bash

add_metadata() {
  local file=$1
  local title=$2
  
  if ! grep -q "export const metadata" "$file"; then
    # Add metadata below imports
    sed -i "/^import /!b; :a; n; /^import /ba; i \\
import { Metadata } from \"next\";\\
\\
export const metadata: Metadata = {\\
  title: \"$title\",\\
};\\
" "$file"
  fi
}

add_metadata "src/app/beneficiaries/manage/page.tsx" "Beneficiary Management"
add_metadata "src/app/campaigns/manage/page.tsx" "Sadaqah Management"
add_metadata "src/app/grants/manage/page.tsx" "Grant Management"
add_metadata "src/app/loans/page.tsx" "Qard Hasanah Management"
add_metadata "src/app/groups/manage/page.tsx" "Group Management"

# Let's fix app.text in unauthorized page directly
sed -i 's/<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3"><Trans tKey="app.text" \/><\/h1>/<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3"><Trans tKey="unauthorized.title" fallback="Access Denied" \/><\/h1>/' src/app/unauthorized/page.tsx

sed -i 's/<p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">\n        <Trans tKey="app.text" \/><\/p>/<p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">\n        <Trans tKey="unauthorized.desc" fallback="You do not have permission to access this page." \/><\/p>/' src/app/unauthorized/page.tsx

sed -i 's/<ArrowLeft className="w-4 h-4 mr-2" \/>\n          <Trans tKey="app.text" \/><\/Button>/<ArrowLeft className="w-4 h-4 mr-2" \/>\n          <Trans tKey="unauthorized.back" fallback="Go Back" \/><\/Button>/' src/app/unauthorized/page.tsx

sed -i 's/<LayoutDashboard className="w-4 h-4 mr-2" \/>\n              <Trans tKey="app.text" \/><\/Link>/<LayoutDashboard className="w-4 h-4 mr-2" \/>\n              <Trans tKey="unauthorized.dashboard" fallback="Go to Dashboard" \/><\/Link>/' src/app/unauthorized/page.tsx

# Fix app.text in profile pages
sed -i 's/<Trans tKey="app.text" \/>/<Trans tKey="profile.title" fallback="My Profile" \/>/g' src/app/profile/page.tsx
sed -i 's/<Trans tKey="app.text" \/>/<Trans tKey="profile.devices" fallback="Active Devices" \/>/g' src/app/profile/devices/page.tsx

# Fix app.text in member edit page
sed -i 's/<Trans tKey="app.text" \/>/<Trans tKey="members.edit.title" fallback="Edit Member" \/>/g' src/app/members/[id]/edit/page.tsx
add_metadata "src/app/members/[id]/edit/page.tsx" "Edit Member"

# Fix app.text in loans today/upcoming collection
sed -i 's/<Trans tKey="app.text" \/>/<Trans tKey="loans.todayCollection.title" fallback="Today'\''s Collection" \/>/g' src/app/loans/today-collection/page.tsx
add_metadata "src/app/loans/today-collection/page.tsx" "Today's Collection"

sed -i 's/<Trans tKey="app.text" \/>/<Trans tKey="loans.upcomingCollection.title" fallback="Upcoming Collection" \/>/g' src/app/loans/upcoming-collection/page.tsx
add_metadata "src/app/loans/upcoming-collection/page.tsx" "Upcoming Collection"

# Fix app.text in member dues
sed -i 's/<Trans tKey="app.text" \/>/<Trans tKey="members.dues.title" fallback="Member Dues" \/>/g' src/app/(dashboard)/members/[id]/dues/page.tsx
add_metadata "src/app/(dashboard)/members/[id]/dues/page.tsx" "Member Dues"

