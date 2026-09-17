import { parseLegacyMarkdown } from '../src/utils/legacyParser.ts';

const sampleMarkdown = `
# Project TODO

## Sprint 1: Setup
- [x] Initial project setup #p0 #feat
  Configured Vite and TypeScript.
  Tested build output.
- [ ] Fix navbar flicker on mobile [BUG] [P1]
  Flickers when navigating between tabs.
- [ ] Refactor state management #tech_debt #p2

## Sprint 2: UI
- [ ] Dark mode toggle #ux #p3
`;

const items = parseLegacyMarkdown(sampleMarkdown);
console.log('Parsed items count:', items.length);
console.log(JSON.stringify(items, null, 2));

if (items.length !== 4) {
  console.error('Expected 4 items, got:', items.length);
  process.exit(1);
}

if (items[0].status !== 'done' || items[0].priority !== 'p0' || items[0].type !== 'feature') {
  console.error('Item 0 mismatch:', items[0]);
  process.exit(1);
}

if (items[1].type !== 'bug' || items[1].priority !== 'p1' || !items[1].description.includes('Flickers')) {
  console.error('Item 1 mismatch:', items[1]);
  process.exit(1);
}

console.log('✅ Legacy Markdown parser verified successfully!');
