import fs from 'fs';

const filePath = 'app/api/admin/blog/generate/route.ts';

console.log('🔧 Updating SEO Wereldklasse tool...\n');

// Read file with Windows line endings normalized
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Change 1: Add existingContent to schema
const oldSchema = `const requestSchema = z.object({
  primaryKeyword: z.string().min(3).max(100),
  category: z.string().uuid(),
  year: z.string().optional().default('2025'),
  targetAudience: z.string().optional(),
  toneOfVoice: z.string().optional().default('vriendelijk en motiverend'),
  articleLength: z.number().optional().default(1200),
});`;

const newSchema = `const requestSchema = z.object({
  primaryKeyword: z.string().min(3).max(100),
  category: z.string().uuid(),
  year: z.string().optional().default('2025'),
  targetAudience: z.string().optional(),
  toneOfVoice: z.string().optional().default('vriendelijk en motiverend'),
  articleLength: z.number().optional().default(1200),
  existingContent: z.string().optional(), // Bestaande content die alleen SEO-vriendelijk gemaakt moet worden
});`;

if (!content.includes('existingContent')) {
  content = content.replace(oldSchema, newSchema);
  console.log('✅ Added existingContent field to schema');
} else {
  console.log('⏭️  existingContent already in schema');
}

// Change 2: Extract existingContent from result.data
const oldExtract = `const { primaryKeyword, category, year, targetAudience, toneOfVoice, articleLength } = result.data;`;
const newExtract = `const { primaryKeyword, category, year, targetAudience, toneOfVoice, articleLength, existingContent } = result.data;`;

if (!content.includes('existingContent } = result.data')) {
  content = content.replace(oldExtract, newExtract);
  console.log('✅ Updated destructuring to include existingContent');
} else {
  console.log('⏭️  Destructuring already updated');
}

// Change 3: Update prompt to handle existing content
const oldPromptStart = `    // Build the AI prompt
    const prompt = \`Je bent een SEO expert en dating content specialist voor de Nederlandse markt. Je schrijft voor Wereldklasse, een premium dating platform.

TAAK: Schrijf een complete, SEO-geoptimaliseerde blog post over "\${primaryKeyword}".`;

const newPromptStart = `    // Build the AI prompt
    const prompt = existingContent
      ? \`Je bent een SEO expert voor Wereldklasse. Je taak is om bestaande content SEO-vriendelijk te maken ZONDER de tekst te herschrijven.

BESTAANDE CONTENT:
\${existingContent}

TAAK: Maak deze content SEO-vriendelijk door:
1. Voeg HTML structuur toe: <h1>, <h2>, <h3>, <p> tags
2. Identificeer de hoofdtitel en maak er een <h1> van
3. Identificeer secties en maak er <h2>/<h3> van
4. Voeg 2-3 interne links toe naar: /register, /features, of /dashboard waar relevant
5. Behoud de EXACTE tekst - verander GEEN woorden, zinnen of betekenis
6. Alleen structuur en links toevoegen!

PRIMARY KEYWORD: "\${primaryKeyword}"
JAAR: \${year}
\`
      : \`Je bent een SEO expert en dating content specialist voor de Nederlandse markt. Je schrijft voor Wereldklasse, een premium dating platform.

TAAK: Schrijf een complete, SEO-geoptimaliseerde blog post over "\${primaryKeyword}".`;

if (!content.includes('BESTAANDE CONTENT:')) {
  content = content.replace(oldPromptStart, newPromptStart);
  console.log('✅ Updated prompt to handle existing content');
} else {
  console.log('⏭️  Prompt already updated');
}

// Write back with Windows line endings
fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf8');

console.log('\n💾 Changes saved!');
console.log('\n🎉 SEO tool updated successfully!');
console.log('   • existingContent parameter toegevoegd');
console.log('   • Prompt aangepast om bestaande tekst te respecteren');
console.log('   • Tool voegt nu alleen SEO structuur toe zonder tekst te wijzigen\n');
