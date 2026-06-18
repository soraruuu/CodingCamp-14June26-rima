# Implementation Plan: To-Do Life Dashboard

## Overview

Incremental enhancement of the existing `index.html` / `css/styles.css` / `js/script.js` skeleton.
Each task targets a specific gap between the current implementation and the full requirements.
No new dependencies are added beyond `fast-check` (CDN or npm dev-dep) for property tests.
All changes stay in the three existing files unless a test file is introduced.

---

## Tasks

- [ ] 1. Add storage utility helpers and alert banners to index.html + script.js
  - [ ] 1.1 Insert `#storage-warning` and `#storage-error` alert banner `<div>` elements in `index.html` immediately after the `.dashboard-container` opening tag (hidden by default via the `hidden` attribute)
    - Use classes `alert-banner alert-warning` and `alert-banner alert-error` respectively
    - _Requirements: 5.9, 6.4_
  - [ ] 1.2 Implement `isLocalStorageAvailable()` at the top of `js/script.js`
    - Attempt a test `setItem` / `getItem` / `removeItem` cycle; return `true` on success, `false` on any thrown error
    - _Requirements: 6.4_
  - [ ] 1.3 Implement `safeLocalStorageSet(key, value)` immediately after `isLocalStorageAvailable()`
    - Wrap `localStorage.setItem(key, value)` in `try/catch`; on success return `true`; on failure un-hide `#storage-error` and return `false`
    - _Requirements: 5.9_
  - [ ] 1.4 Call `isLocalStorageAvailable()` at script startup (before `renderTasks` / `renderLinks`); if it returns `false`, un-hide `#storage-warning`
    - _Requirements: 6.4_

- [ ] 2. Add CSS for alert banners, card visual hierarchy, task edit mode, and responsive fixes
  - [ ] 2.1 Add `.alert-banner`, `.alert-warning`, and `.alert-error` rules to `css/styles.css`
    - `.alert-banner`: `display: none` by default (toggled with JS `hidden` removal), full-width, padding, border-radius, font-size ≥ 16px
    - `.alert-warning`: amber/yellow background; `.alert-error`: red-tinted background
    - _Requirements: 5.9, 6.4, 7.5_
  - [ ] 2.2 Strengthen card visual hierarchy rules in `css/styles.css`
    - Ensure every `.card` has a visible `border` (e.g., `1px solid #d1d5db`) in addition to its existing `box-shadow`
    - Confirm `body` base `font-size` is ≥ 16px (update if needed)
    - _Requirements: 7.5_
  - [ ] 2.3 Add task edit-mode styles to `css/styles.css`
    - `.task-item--editing`: subtle highlight background
    - `.task-edit-input`: full-width text input, font-size ≥ 16px, border, border-radius, padding
    - `.task-actions`: `display: flex; gap: 6px;` for the Edit/Delete (and Save/Cancel) button pair
    - `.btn-sm`: smaller padding variant (e.g., `padding: 6px 12px; font-size: 13px`) for inline row buttons
    - _Requirements: 4.6, 7.5_
  - [ ] 2.4 Verify and correct responsive breakpoint rules in `css/styles.css`
    - Below 480px: `.input-group` must be `flex-direction: column` (already exists — verify it is not overridden)
    - At 480px+: `.input-group` switches to `flex-direction: row` (already exists — verify it applies to Quick Links two-input group as well)
    - _Requirements: 7.3, 7.4_

- [ ] 3. Fix Focus Timer: remove alert/auto-reset, add inline status, guard duplicate Stop
  - [ ] 3.1 Add `<div id="timer-status" class="timer-status" aria-live="polite"></div>` to `index.html` below `#timer-display`, inside `.timer-card`
    - _Requirements: 3.5_
  - [ ] 3.2 In `js/script.js`, remove the `alert("Focus time is over!")` call and the `resetTimer()` call from the `setInterval` callback inside `startTimer()`; replace with: `document.getElementById('timer-status').textContent = 'Session complete!';`
    - _Requirements: 3.5_
  - [ ] 3.3 Update `startTimer()` to clear `#timer-status` at the beginning of its body (before the guard check), so restarting after a completed session clears the message
    - _Requirements: 3.5_
  - [ ] 3.4 Update `stopTimer()` to add an early-return guard: `if (!isRunning) return;`
    - _Requirements: 3.8_
  - [ ] 3.5 Update `resetTimer()` to clear `#timer-status`: `document.getElementById('timer-status').textContent = '';`
    - _Requirements: 3.4_
  - [ ]* 3.6 Write unit tests for Focus Timer behaviour
    - Test `startTimer()` guard: calling Start twice does not create two intervals
    - Test `stopTimer()` guard: calling Stop when already stopped is a no-op
    - Test timer reaching `00:00`: `isRunning` becomes `false`, display stays `00:00`, `#timer-status` shows "Session complete!"
    - Test `resetTimer()`: display resets to `25:00`, `#timer-status` is cleared
    - _Requirements: 3.4, 3.5, 3.7, 3.8_

- [ ] 4. Fix Task Management: correct localStorage key and implement Edit functionality
  - [ ] 4.1 Change all occurrences of the key `'productivity_tasks'` to `'dashboard_tasks'` in `js/script.js`
    - Affects the initial `localStorage.getItem` call and the `localStorage.setItem` inside `renderTasks()`
    - _Requirements: 6.3_
  - [ ] 4.2 Update `renderTasks()` in `js/script.js` to wrap the `localStorage.setItem` call in `safeLocalStorageSet()`, and add an Edit button to each task row in view mode
    - Task row view mode HTML: `<div class="task-actions"><button class="btn-secondary btn-sm" onclick="editTask(${index})">Edit</button><button class="btn-danger btn-sm" onclick="deleteTask(${index})">Delete</button></div>`
    - When `task._editing === true`, render edit-mode HTML instead: inline `<input class="task-edit-input">` pre-filled with `task.text`, Save and Cancel buttons, `onkeydown="handleEditKeyDown(event, ${index})"`
    - _Requirements: 4.6, 6.3_
  - [ ] 4.3 Implement `editTask(index)` in `js/script.js`
    - Set `tasks[index]._editing = true`, call `renderTasks()`, then `focus()` the newly rendered `.task-edit-input` for that row
    - _Requirements: 4.6_
  - [ ] 4.4 Implement `confirmEdit(index)` in `js/script.js`
    - Read the inline input value; if `trimmed === ''` do nothing and return (Req 4.9)
    - Otherwise set `tasks[index].text = trimmed`, delete `tasks[index]._editing`, call `renderTasks()` (which persists via `safeLocalStorageSet`)
    - _Requirements: 4.6, 4.9_
  - [ ] 4.5 Implement `cancelEdit(index)` in `js/script.js`
    - Delete `tasks[index]._editing`, call `renderTasks()` — no save
    - _Requirements: 4.6_
  - [ ] 4.6 Implement `handleEditKeyDown(event, index)` in `js/script.js`
    - `if (event.key === 'Enter') confirmEdit(index);`
    - `if (event.key === 'Escape') cancelEdit(index);`
    - _Requirements: 4.6_
  - [ ]* 4.7 Write unit tests for Task Management
    - `addTask('')` and `addTask('   ')` → list length unchanged
    - `addTask('Buy milk')` → list grows by 1, `completed = false`, input cleared
    - `toggleTask(0)` → flips `completed`
    - `deleteTask(0)` → removes item
    - `confirmEdit(0)` with empty/whitespace value → text unchanged
    - `confirmEdit(0)` with valid value → text updated, `_editing` cleared
    - `cancelEdit(0)` → text unchanged, `_editing` cleared
    - `handleEditKeyDown` Enter key → calls `confirmEdit`; Escape → calls `cancelEdit`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.9_

- [ ] 5. Checkpoint — tasks 1–4 complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Fix Quick Links: correct localStorage key, add length validation, safe storage, inject defaults once
  - [ ] 6.1 Change all occurrences of the key `'productivity_links'` to `'dashboard_links'` in `js/script.js`
    - Affects `localStorage.getItem` on load and `localStorage.setItem` inside `renderLinks()`
    - _Requirements: 6.3_
  - [ ] 6.2 Update the Quick Links initialisation block in `js/script.js` to inject defaults only on first load
    - Read `localStorage.getItem('dashboard_links')`; if `null`, set `quickLinks` to `DEFAULT_LINKS` and call `safeLocalStorageSet('dashboard_links', JSON.stringify(DEFAULT_LINKS))` before rendering
    - If not `null`, parse with `try/catch` falling back to `DEFAULT_LINKS` on invalid JSON
    - _Requirements: 5.8, 6.4_
  - [ ] 6.3 Add name (≤50 chars) and URL (≤2000 chars) length validation to `addLink()` in `js/script.js`
    - Reject (return early) if `name === ''` or `url === ''` or `name.length > 50` or `url.length > 2000`
    - _Requirements: 5.1, 5.2_
  - [ ] 6.4 Wrap the `localStorage.setItem` call in `renderLinks()` — and in `addLink()` / `deleteLink()` where persistence happens — with `safeLocalStorageSet()`
    - If `safeLocalStorageSet` returns `false` in `addLink()`, do NOT push the new item to `quickLinks` and do NOT re-render
    - _Requirements: 5.9, 6.3_
  - [ ] 6.5 Move persistence out of `renderLinks()` and into `addLink()` and `deleteLink()` only (so render is a pure display function with no side effects)
    - Both `addLink()` and `deleteLink()` call `safeLocalStorageSet('dashboard_links', JSON.stringify(quickLinks))` after mutating the array
    - _Requirements: 5.6_
  - [ ]* 6.6 Write unit tests for Quick Links
    - `addLink('', 'https://x.com')` → list unchanged
    - `addLink('X', '')` → list unchanged
    - `addLink` with name 51 chars → rejected
    - `addLink` with URL 2001 chars → rejected
    - `addLink('G', 'google.com')` → URL normalised to `https://google.com`
    - `deleteLink` removes item at index
    - First-load with null storage → Google + Gmail injected
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.8_

- [ ] 7. Set up fast-check and write property-based tests
  - [ ] 7.1 Create `js/script.test.js` (or `tests/properties.test.js`) and configure fast-check
    - Install fast-check as a dev dependency (`npm install --save-dev fast-check`) or reference CDN in a test HTML harness
    - Export or expose the pure functions under test (greeting logic, URL normalisation, task helpers) so they can be called from the test file without a DOM; wrap DOM-dependent functions in a minimal JSDOM setup if needed
    - _Requirements: 6.1_
  - [ ]* 7.2 Write property test for Property 1 — Greeting covers all 24 hours
    - `fc.integer({ min: 0, max: 23 })` → assert correct greeting bucket; assert result is never empty
    - Tag: `Feature: todo-life-dashboard, Property 1: Greeting covers all 24 hours with correct boundary assignment`
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 7.3 Write property test for Property 2 — Timer display MM:SS for any valid timeLeft
    - `fc.integer({ min: 0, max: 1500 })` → assert `#timer-display` matches `/^\d{2}:\d{2}$/` and values are arithmetically correct
    - Tag: `Feature: todo-life-dashboard, Property 2: Timer display always produces correct MM:SS for any valid timeLeft`
    - _Requirements: 3.6_
  - [ ]* 7.4 Write property test for Property 3 — Reset returns timer to initial state from any state
    - `fc.integer({ min: 0, max: 1500 })` × `fc.boolean()` → set `timeLeft` and `isRunning`, call `resetTimer()`, assert `timeLeft === 1500`, `isRunning === false`, display `=== '25:00'`
    - Tag: `Feature: todo-life-dashboard, Property 3: Reset returns timer to initial state from any state`
    - _Requirements: 3.4_
  - [ ]* 7.5 Write property test for Property 4 — Adding a valid task grows the list by exactly one
    - `fc.array(taskArb)` × `fc.string().filter(s => s.trim() !== '')` → assert `tasks.length === before + 1`, new item has trimmed text and `completed = false`
    - Tag: `Feature: todo-life-dashboard, Property 4: Adding a valid task grows the list by exactly one`
    - _Requirements: 4.1_
  - [ ]* 7.6 Write property test for Property 5 — Whitespace-only input rejected
    - `fc.array(taskArb)` × `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` → assert list is identical after `addTask` call
    - Tag: `Feature: todo-life-dashboard, Property 5: Whitespace-only input is rejected and list is unchanged`
    - _Requirements: 4.2_
  - [ ]* 7.7 Write property test for Property 6 — Task persistence round-trip
    - `fc.array(taskArb)` → JSON.stringify → JSON.parse → assert deep equality
    - Tag: `Feature: todo-life-dashboard, Property 6: Task persistence round-trip`
    - _Requirements: 4.7, 4.8, 6.3_
  - [ ]* 7.8 Write property test for Property 7 — Edit with non-empty updates; whitespace rejected
    - `fc.record({ text: fc.string(), completed: fc.boolean() })` × `fc.string()` (replacement) → split on `replacement.trim() === ''` to assert correct branch
    - Tag: `Feature: todo-life-dashboard, Property 7: Edit with non-empty value updates text; edit with whitespace value is rejected`
    - _Requirements: 4.6, 4.9_
  - [ ]* 7.9 Write property test for Property 8 — URL normalisation is idempotent
    - `fc.string()` → apply normalisation twice; assert result equals applying it once
    - Tag: `Feature: todo-life-dashboard, Property 8: URL normalisation is idempotent`
    - _Requirements: 5.3_
  - [ ]* 7.10 Write property test for Property 9 — Quick link length validation and persistence round-trip
    - Over-limit: `fc.string({ minLength: 51 })` for name or `fc.string({ minLength: 2001 })` for URL → assert list unchanged
    - Valid: `fc.string({ minLength: 1, maxLength: 50 })` × `fc.string({ minLength: 1, maxLength: 2000 })` → assert item appended and round-trip equality
    - Tag: `Feature: todo-life-dashboard, Property 9: Quick link length validation rejects over-limit inputs, and valid inputs are persisted`
    - _Requirements: 5.1, 5.2, 5.6, 5.7, 6.3_

- [ ] 8. Final checkpoint — wire everything together and verify
  - Ensure all tests pass, ask the user if questions arise.
  - Smoke-check: open `index.html` in a browser, confirm no console errors, all four cards visible, clock ticking, timer controls functional, task add/edit/delete working, Quick Links add/delete working, responsive layout at 320px and 640px.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- All three files (`index.html`, `css/styles.css`, `js/script.js`) are modified incrementally — no full rewrites.
- The `_editing` flag on task objects is transient: strip it before `JSON.stringify` if it leaks (or rely on the fact that `delete obj._editing` is called before every persist call).
- fast-check property tests require a Node/npm environment; if the project has no `package.json`, create a minimal one (`npm init -y`) before task 7.1.
- Each property test must run a minimum of 100 iterations (fast-check default is 100; no override needed unless specified).
- Responsive breakpoint manual checks at 320px, 375px, 480px, 768px, 1280px, and 1920px are outside the scope of automated tasks.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "4.1"] },
    { "id": 3, "tasks": ["3.6", "4.2", "4.3", "4.4", "4.5", "4.6", "6.1"] },
    { "id": 4, "tasks": ["4.7", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 5, "tasks": ["6.6", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10"] }
  ]
}
```
