const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk('src', (err, files) => {
  if (err) throw err;
  
  files.filter(f => f.endsWith('.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('use client') || !content.includes('useForm')) return;
    
    // Check if it has getNow(), Date.now(), or new Date() in defaultValues
    if (!/getNow\(\)|new Date\(\)|Date\.now\(\)/.test(content)) return;

    let modified = false;

    // Simple heuristic to fix donation-form.tsx as an example
    if (content.includes('date: format(new Date(), "yyyy-MM-dd")')) {
      content = content.replace('date: format(new Date(), "yyyy-MM-dd")', 'date: ""');
      const insertIdx = content.indexOf('async function onSubmit');
      if (insertIdx !== -1) {
        content = content.slice(0, insertIdx) + `  useEffect(() => {\n    form.setValue("date", format(new Date(), "yyyy-MM-dd"))\n  }, [form])\n\n  ` + content.slice(insertIdx);
        if (!content.includes('useEffect')) {
          content = content.replace('import { useState }', 'import { useState, useEffect }');
        }
        modified = true;
      }
    }

    // We can run string replacements manually for others or let this script handle them 
    if (modified) {
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  });
});
