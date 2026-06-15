const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web-sveltekit', 'src', 'lib', 'styles', 'app.css');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all ':root.dark' with '.dark'
content = content.replace(/:root\.dark/g, '.dark');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced all occurrences of :root.dark with .dark in app.css');
