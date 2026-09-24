import assert from 'node:assert';
import {
  parseBacklogMd,
  serializeBacklogMd,
  normalizeStatus,
  normalizePriority,
  formatStatusForMd,
  formatPriorityForMd,
  generateTaskFilename,
  generateMonolithicBacklogMd
} from './backlogMdParser.ts';

console.log('Testing backlogMdParser...');

// 1. Status normalization
assert.strictEqual(normalizeStatus('Draft'), 'draft');
assert.strictEqual(normalizeStatus('ideas'), 'ideas');
assert.strictEqual(normalizeStatus('Idea'), 'ideas');
assert.strictEqual(normalizeStatus('Discovery'), 'ideas');
assert.strictEqual(normalizeStatus('backlog'), 'draft');
assert.strictEqual(normalizeStatus('To Do'), 'draft');
assert.strictEqual(normalizeStatus('in_progress'), 'doing');
assert.strictEqual(normalizeStatus('In Progress'), 'doing');
assert.strictEqual(normalizeStatus('doing'), 'doing');
assert.strictEqual(normalizeStatus('testing_qa'), 'review');
assert.strictEqual(normalizeStatus('Testing'), 'review');
assert.strictEqual(normalizeStatus('Review'), 'review');
assert.strictEqual(normalizeStatus('finish'), 'ready');
assert.strictEqual(normalizeStatus('Ready for deploy'), 'ready');
assert.strictEqual(normalizeStatus('ready'), 'ready');
assert.strictEqual(normalizeStatus('Done'), 'done');
assert.strictEqual(normalizeStatus('deployed'), 'done');
assert.strictEqual(normalizeStatus('dismissed'), 'dismissed');
assert.strictEqual(normalizeStatus('cancelled'), 'dismissed');

console.log('✅ Status normalization passed');

// 2. Sample real task parsing
const sampleMd = `---
id: BACK-355
title: 'Add task type field (bug, feature, enhancement, etc.)'
status: Done
assignee:
  - '@codex'
created_date: '2026-01-01 23:37'
updated_date: '2026-07-17 06:33'
labels:
  - enhancement
  - core
dependencies: []
priority: medium
milestone: 'Sprint 2'
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a mutually exclusive 'type' field to tasks that categorizes them semantically.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Task types are configurable per-project
- [ ] #2 CLI task create supports type flag
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Verify child records.
2. Run focused tests.
<!-- SECTION:PLAN:END -->
`;

const parsed = parseBacklogMd(sampleMd);
assert.strictEqual(parsed.id, 'BACK-355');
assert.strictEqual(parsed.title, 'Add task type field (bug, feature, enhancement, etc.)');
assert.strictEqual(parsed.status, 'done');
assert.strictEqual(parsed.priority, 'medium');
assert.strictEqual(parsed.milestone, 'Sprint 2');
assert.strictEqual(parsed.assignees?.[0], '@codex');
assert.strictEqual(parsed.labels?.length, 2);
assert.strictEqual(parsed.acceptanceCriteria?.length, 2);
assert.strictEqual(parsed.acceptanceCriteria?.[0].checked, true);
assert.strictEqual(parsed.acceptanceCriteria?.[0].index, 1);
assert.strictEqual(parsed.acceptanceCriteria?.[1].checked, false);
assert.strictEqual(parsed.acceptanceCriteria?.[1].index, 2);
assert.ok(parsed.description?.includes('Add a mutually exclusive'));
assert.ok(parsed.implementationPlan?.includes('1. Verify child records'));

console.log('✅ Backlog.md parsing passed');

// 3. Serialization round-trip
const serialized = serializeBacklogMd(parsed);
const reparsed = parseBacklogMd(serialized);
assert.strictEqual(reparsed.id, parsed.id);
assert.strictEqual(reparsed.title, parsed.title);
assert.strictEqual(reparsed.status, parsed.status);
assert.strictEqual(reparsed.acceptanceCriteria?.length, 2);
assert.strictEqual(reparsed.acceptanceCriteria?.[0].checked, true);
assert.strictEqual(reparsed.acceptanceCriteria?.[1].checked, false);

console.log('✅ Serialization round-trip passed');

// 3.1. Priority lossless round-trip (DEV-044)
for (const p of ['p0', 'p1', 'p2', 'p3']) {
  const formatted = formatPriorityForMd(p);
  const restored = normalizePriority(formatted);
  assert.strictEqual(restored, p, `Priority ${p} must round-trip through Markdown (${formatted}) -> ${restored}`);
}
console.log('✅ Priority lossless round-trip (p0, p1, p2, p3) passed');

// 4. Filename generation
assert.strictEqual(
  generateTaskFilename('BACK-355', 'Add task type field'),
  'back-355 - add-task-type-field.md'
);
console.log('✅ Filename generation passed');

// 5. Monolithic export
const monolithic = generateMonolithicBacklogMd('Test Project', [parsed]);
assert.ok(monolithic.includes('# Backlog: Test Project'));
assert.ok(monolithic.includes('Add task type field'));
console.log('✅ Monolithic export passed');

console.log('🎉 All parser tests passed successfully!');
