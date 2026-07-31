const fs = require('fs');

const updateToasts = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/toast\.error\(res\.error \|\| (.*?)\)/g, 'toast.error(res.error ? t(res.error) : $1)');
  content = content.replace(/toast\.error\(res\.error\)/g, 'toast.error(res.error ? t(res.error) : "An error occurred")');
  fs.writeFileSync(file, content);
};

updateToasts('src/features/members/components/member-form.tsx');
updateToasts('src/features/members/components/members-table.tsx');
updateToasts('src/features/members/components/member-form-dialog.tsx');
