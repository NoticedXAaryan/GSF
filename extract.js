const fs = require('fs');
const path = 'C:\\Users\\notic\\.gemini\\antigravity\\brain\\10cec537-f2a0-4e6b-aade-202969f6974d\\.system_generated\\logs\\transcript_full.jsonl';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
const foundFiles = new Set();
for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i].trim()) continue;
  try {
    const json = JSON.parse(lines[i]);
    if (json.type === 'TOOL_RESPONSE' && json.content) {
      const match = json.content.match(/File Path: `file:\/\/\/[^`]+(components\/[a-zA-Z0-9_]+\.tsx|app\/page\.tsx|app\/globals\.css)`/);
      if (match) {
        const filepath = match[1];
        if (!foundFiles.has(filepath)) {
          foundFiles.add(filepath);
          const lines = json.content.split('\n');
          let code = '';
          let insideCode = false;
          for(const line of lines) {
             if (line.includes('The following code has been modified')) { insideCode = true; continue; }
             if (line.includes('The above content shows the entire')) { insideCode = false; continue; }
             if (insideCode) {
                const parts = line.split(': ');
                if(parts.length > 1 && !isNaN(parseInt(parts[0]))) {
                   code += parts.slice(1).join(': ') + '\n';
                } else if(line.length > 0) {
                   code += line + '\n';
                }
             }
          }
          if (code.trim()) {
            const outname = filepath.replace(/[\/\\]/g, '_');
            fs.writeFileSync(outname, code);
            console.log('Saved', outname);
          }
        }
      }
    }
  } catch (e) { }
}
