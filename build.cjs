// Optional: refresh the HTML fallback for search engines and JavaScript-disabled readers.
// Normal edits to profile.json appear live without running this command.
const fs=require('fs');const {renderProfile}=require('./renderer.js');
const data=JSON.parse(fs.readFileSync('profile.json','utf8'));
const file=fs.readFileSync('index.html','utf8');
fs.writeFileSync('index.html',file.replace(/<!-- PROFILE START -->[\s\S]*?<!-- PROFILE END -->/,'<!-- PROFILE START -->'+renderProfile(data)+'<!-- PROFILE END -->'));
