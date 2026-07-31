const fs = require('fs');

function replaceSidebar() {
  const file = 'src/components/layout/sidebar.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/t\("layout\./g, 't("layout.sidebar.');
  fs.writeFileSync(file, content);
}

function replaceHeader() {
  const file = 'src/components/layout/header.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/t\('layout\./g, 't(\'layout.sidebar.');
  content = content.replace(/t\("layout\.logo_8c2857"\)/g, 't("layout.sidebar.logo_8c2857")');
  content = content.replace(/t\('header\./g, 't(\'layout.header.');
  
  fs.writeFileSync(file, content);
}

replaceSidebar();
replaceHeader();
console.log("Replaced");
