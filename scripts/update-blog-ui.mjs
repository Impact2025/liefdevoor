import fs from 'fs';

const filePath = 'app/admin/blog/new/page.tsx';

console.log('🔧 Updating Blog UI for SEO mode...\n');

// Read file with Windows line endings normalized
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Change 1: Add useState for preserve content mode
const oldStateImport = `import { useState } from 'react'`;
const newStateImport = `import { useState } from 'react'`;

// Find the state declarations section and add new state
const stateDeclarations = content.match(/(const \[generating, setGenerating\] = useState.*?\n)/);
if (stateDeclarations) {
  const oldLine = stateDeclarations[1];
  if (!content.includes('preserveContent')) {
    const newLine = oldLine + `  const [preserveContent, setPreserveContent] = useState(false) // Behoud bestaande tekst bij SEO optimalisatie\n`;
    content = content.replace(oldLine, newLine);
    console.log('✅ Added preserveContent state');
  } else {
    console.log('⏭️  preserveContent state already exists');
  }
}

// Change 2: Update fetch call to include existingContent
const oldFetch = `      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword,
          category: categoryId,
          year: new Date().getFullYear().toString(),
          targetAudience: targetAudience || undefined,
          toneOfVoice,
          articleLength
        })
      })`;

const newFetch = `      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword,
          category: categoryId,
          year: new Date().getFullYear().toString(),
          targetAudience: targetAudience || undefined,
          toneOfVoice,
          articleLength,
          existingContent: preserveContent ? content : undefined // Stuur bestaande content mee als preserve mode aan staat
        })
      })`;

if (!content.includes('existingContent: preserveContent')) {
  content = content.replace(oldFetch, newFetch);
  console.log('✅ Updated fetch to include existingContent');
} else {
  console.log('⏭️  Fetch already includes existingContent');
}

// Change 3: Add checkbox in UI (find the AI generation section)
// This is trickier - we need to find the right place in the UI
// Look for the "Laat AI je content automatisch optimaliseren" section

const uiSection = `                          Laat AI je content automatisch optimaliseren voor SEO, leesbaarheid en social media bij het opslaan.`;

if (content.includes(uiSection) && !content.includes('Behoud bestaande tekst')) {
  const replacement = `                          Laat AI je content automatisch optimaliseren voor SEO, leesbaarheid en social media bij het opslaan.
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={preserveContent}
                            onChange={(e) => setPreserveContent(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-blue-900">✨ Behoud bestaande tekst</div>
                            <div className="text-sm text-blue-700">Voeg alleen SEO structuur (H1/H2/H3, interne links) toe zonder de tekst te herschrijven</div>
                          </div>
                        </label>
                        <div className="text-sm text-gray-600">`;

  content = content.replace(uiSection, replacement);
  console.log('✅ Added checkbox UI for preserve content mode');
} else if (content.includes('Behoud bestaande tekst')) {
  console.log('⏭️  Checkbox UI already exists');
} else {
  console.log('⚠️  Could not find UI section to add checkbox');
}

// Write back with Windows line endings
fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf8');

console.log('\n💾 Changes saved!');
console.log('\n🎉 Blog UI updated successfully!');
console.log('   • preserveContent state toegevoegd');
console.log('   • Fetch call aangepast om existingContent mee te sturen');
console.log('   • Checkbox toegevoegd voor "Behoud bestaande tekst" mode\n');
