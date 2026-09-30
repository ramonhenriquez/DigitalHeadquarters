/**
 * Command palette behaviour. Progressive enhancement: without JS the
 * Search button simply does nothing and the nav still works.
 */
interface Entry {
  group: string;
  title: string;
  hint?: string;
  href?: string;
  action?: 'theme' | 'copy-email';
  keywords?: string;
}

const dialog = document.querySelector<HTMLDialogElement>('[data-palette]');
const input = document.querySelector<HTMLInputElement>('[data-palette-input]');
const list = document.querySelector<HTMLUListElement>('[data-palette-list]');
const empty = document.querySelector<HTMLElement>('[data-palette-empty]');
const statusEl = document.querySelector<HTMLElement>('[data-palette-status]');
const raw = document.getElementById('palette-index')?.textContent;

if (dialog && input && list && raw) {
  const entries: Entry[] = JSON.parse(raw);
  let results: Entry[] = [];
  let active = 0;
  let opener: HTMLElement | null = null;

  const score = (e: Entry, q: string): number => {
    if (!q) return e.group === 'Pages' || e.group === 'Projects' ? 1 : 0;
    const t = e.title.toLowerCase();
    const h = (e.hint ?? '').toLowerCase();
    const k = (e.keywords ?? '').toLowerCase();
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let s = 0;
    for (const term of terms) {
      if (t.startsWith(term)) s += 8;
      else if (t.split(/[\s()/,-]+/).some((w) => w.startsWith(term))) s += 6;
      else if (t.includes(term)) s += 4;
      else if (h.includes(term)) s += 3;
      else if (k.includes(term)) s += 1;
      else return 0;
    }
    return s;
  };

  const render = () => {
    const q = input.value.trim();
    results = entries
      .map((e, i) => ({ e, s: score(e, q), i }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .slice(0, 40)
      .map((r) => r.e);

    // Keep groups together in their first-seen order
    const order: string[] = [];
    results.forEach((r) => order.includes(r.group) || order.push(r.group));
    results = order.flatMap((g) => results.filter((r) => r.group === g));

    list.replaceChildren();
    let lastGroup = '';
    results.forEach((r, i) => {
      if (r.group !== lastGroup) {
        const head = document.createElement('li');
        head.className = 'palette__group';
        head.setAttribute('role', 'presentation');
        head.textContent = r.group;
        list.append(head);
        lastGroup = r.group;
      }
      const li = document.createElement('li');
      li.id = `palette-opt-${i}`;
      li.className = 'palette__option';
      li.setAttribute('role', 'option');
      li.dataset.index = String(i);
      const title = document.createElement('span');
      title.className = 'palette__title';
      title.textContent = r.title;
      li.append(title);
      if (r.hint) {
        const hint = document.createElement('span');
        hint.className = 'palette__hint';
        hint.textContent = r.hint;
        li.append(hint);
      }
      li.addEventListener('mousemove', () => setActive(i, false));
      li.addEventListener('click', () => run(r));
      list.append(li);
    });

    empty!.hidden = results.length > 0;
    statusEl!.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    setActive(0, true);
  };

  const setActive = (i: number, scroll = true) => {
    if (!results.length) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    active = (i + results.length) % results.length;
    list.querySelectorAll('[role="option"]').forEach((el) => el.setAttribute('aria-selected', 'false'));
    const el = document.getElementById(`palette-opt-${active}`);
    el?.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', `palette-opt-${active}`);
    if (scroll) el?.scrollIntoView({ block: 'nearest' });
  };

  const run = async (e: Entry) => {
    if (e.action === 'theme') {
      close();
      document.getElementById('theme-toggle')?.click();
      return;
    }
    if (e.action === 'copy-email') {
      const email = dialog.dataset.email ?? '';
      try {
        await navigator.clipboard.writeText(email);
        statusEl!.textContent = `Copied ${email}`;
        const t = list.querySelector('[aria-selected="true"] .palette__title');
        if (t) t.textContent = `Copied ${email}`;
        setTimeout(close, 900);
      } catch {
        window.location.href = `mailto:${email}`;
      }
      return;
    }
    if (e.href) window.location.href = e.href;
  };

  const open = () => {
    if (dialog.open) return;
    opener = document.activeElement as HTMLElement | null;
    input.value = '';
    render();
    dialog.showModal();
    input.focus();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) close(); // backdrop click
  });

  input.addEventListener('input', render);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setActive(active + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(active - 1); }
    else if (ev.key === 'Home' && ev.ctrlKey) { ev.preventDefault(); setActive(0); }
    else if (ev.key === 'End' && ev.ctrlKey) { ev.preventDefault(); setActive(results.length - 1); }
    else if (ev.key === 'Enter' && results[active]) { ev.preventDefault(); run(results[active]); }
  });

  document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', open));

  document.addEventListener('keydown', (ev) => {
    const target = ev.target as HTMLElement;
    const typing = target.closest('input, textarea, select, [contenteditable="true"]');
    if ((ev.key === 'k' || ev.key === 'K') && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault();
      dialog.open ? close() : open();
    } else if (ev.key === '/' && !typing && !dialog.open) {
      ev.preventDefault();
      open();
    }
  });
}
export {};
