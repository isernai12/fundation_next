import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // Matches `৳${...toFixed(2)}`
    if (content.match(/৳\$\{(.*?)\.toFixed\(2\)\}/)) {
      content = content.replace(/৳\$\{(.*?)\.toFixed\(2\)\}/g, (match, p1) => {
        return `৳\${Number(${p1}).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      });
      changed = true;
    }
    
    // Matches >৳...toFixed(2)< (in JSX Text) 
    // Wait, in JSX we have `৳{(...).toFixed(2)}`
    if (content.match(/৳\{([^}]*?)\.toFixed\(2\)\}/)) {
      content = content.replace(/৳\{([^}]*?)\.toFixed\(2\)\}/g, (match, p1) => {
        return `৳{Number(${p1}).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Updated ${filepath}`);
    }
  }
});
