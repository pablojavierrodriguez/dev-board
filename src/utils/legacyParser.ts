/**
 * Heuristic parser for legacy flat Markdown task files (TODO.md, BACKLOG.md).
 * Converts checklists, headings, and tagged notes into structured Backlog items.
 */

export interface ParsedLegacyItem {
  tempId: string;
  title: string;
  description: string;
  status: 'draft' | 'ready' | 'doing' | 'done';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  type: 'feature' | 'bug' | 'tech_debt' | 'ux';
  milestone?: string;
  module?: string;
  selected: boolean;
}

export function parseLegacyMarkdown(rawContent: string, defaultMilestone?: string): ParsedLegacyItem[] {
  if (!rawContent || !rawContent.trim()) return [];

  const lines = rawContent.split(/\r?\n/);
  const items: ParsedLegacyItem[] = [];

  let currentHeading = defaultMilestone || '';
  let currentModule = '';
  let currentItem: ParsedLegacyItem | null = null;
  let currentDescLines: string[] = [];
  let counter = 1;

  const flushCurrentItem = () => {
    if (currentItem) {
      if (currentDescLines.length > 0) {
        currentItem.description = currentDescLines.join('\n').trim();
      }
      items.push(currentItem);
      currentItem = null;
      currentDescLines = [];
    }
  };

  const checkboxRegex = /^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/;
  const headerRegex = /^(#{1,4})\s+(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for section header (e.g. ## Sprint 1, ### Módulo Auth, ## Bugs)
    const headerMatch = line.match(headerRegex);
    if (headerMatch) {
      flushCurrentItem();
      const headerText = headerMatch[2].trim();
      const lower = headerText.toLowerCase();

      if (lower.includes('sprint') || lower.includes('milestone') || lower.includes('fase') || lower.includes('v1.') || lower.includes('v0.')) {
        currentHeading = headerText;
      } else if (lower.includes('módulo') || lower.includes('modulo') || lower.includes('component')) {
        currentModule = headerText.replace(/m[óo]dulo:?\s*/i, '').trim();
      } else {
        // Generic section header: treat as milestone or module depending on context
        currentHeading = headerText;
      }
      continue;
    }

    // Check for task checklist item (- [ ] Task title or - [x] Task title)
    const checkMatch = line.match(checkboxRegex);
    if (checkMatch) {
      flushCurrentItem();

      const isChecked = checkMatch[2].toLowerCase() === 'x';
      let title = checkMatch[3].trim();

      // Heuristic extraction of Priority (#p0, #p1, [P0], (urgente), etc.)
      let priority: 'p0' | 'p1' | 'p2' | 'p3' = 'p2';
      if (/(\[p0\]|#p0|\(p0\)|\(alta\)|\(urgente\)|p0:)/i.test(title)) {
        priority = 'p0';
        title = title.replace(/(\[p0\]|#p0|\(p0\)|\(alta\)|\(urgente\)|p0:)/gi, '').trim();
      } else if (/(\[p1\]|#p1|\(p1\)|\(high\)|p1:)/i.test(title)) {
        priority = 'p1';
        title = title.replace(/(\[p1\]|#p1|\(p1\)|\(high\)|p1:)/gi, '').trim();
      } else if (/(\[p2\]|#p2|\(p2\)|\(medium\)|p2:)/i.test(title)) {
        priority = 'p2';
        title = title.replace(/(\[p2\]|#p2|\(p2\)|\(medium\)|p2:)/gi, '').trim();
      } else if (/(\[p3\]|#p3|\(p3\)|\(low\)|p3:)/i.test(title)) {
        priority = 'p3';
        title = title.replace(/(\[p3\]|#p3|\(p3\)|\(low\)|p3:)/gi, '').trim();
      }

      // Heuristic extraction of Type ([BUG], [FEAT], #tech_debt, etc.)
      let type: 'feature' | 'bug' | 'tech_debt' | 'ux' = 'feature';
      if (/(\[bug\]|#bug|\(bug\)|fix:|bug:)/i.test(title)) {
        type = 'bug';
        title = title.replace(/(\[bug\]|#bug|\(bug\)|fix:|bug:)/gi, '').trim();
      } else if (/(\[tech[_-]?debt\]|#tech[_-]?debt|refactor:|chore:)/i.test(title)) {
        type = 'tech_debt';
        title = title.replace(/(\[tech[_-]?debt\]|#tech[_-]?debt|refactor:|chore:)/gi, '').trim();
      } else if (/(\[ux\]|#ux|\(ux\)|design:|ui:)/i.test(title)) {
        type = 'ux';
        title = title.replace(/(\[ux\]|#ux|\(ux\)|design:|ui:)/gi, '').trim();
      } else if (/(\[feat(ure)?\]|#feat(ure)?)/i.test(title)) {
        type = 'feature';
        title = title.replace(/(\[feat(ure)?\]|#feat(ure)?)/gi, '').trim();
      }

      // Clean up title
      title = title.replace(/^[:\-\s]+/, '').trim();

      currentItem = {
        tempId: `IMPORT-${String(counter++).padStart(3, '0')}`,
        title: title || 'Sin título',
        description: '',
        status: isChecked ? 'done' : 'ready',
        priority,
        type,
        milestone: currentHeading || undefined,
        module: currentModule || undefined,
        selected: true
      };
      continue;
    }

    // If we have an active item and the line is indented or not a new item, append to description
    if (currentItem) {
      const trimmed = line.trim();
      if (trimmed) {
        currentDescLines.push(trimmed);
      }
    }
  }

  flushCurrentItem();
  return items;
}
