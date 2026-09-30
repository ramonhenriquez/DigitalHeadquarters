/**
 * Infrastructure explorer behaviour (progressive enhancement).
 *   - Tabs follow the WAI-ARIA tabs pattern (arrow keys, Home/End).
 *   - Map / List toggle; List is the default on narrow screens.
 *   - Selecting a node fills the side panel with its NodeDetail and
 *     highlights the edges it touches. Escape clears the selection.
 *   - With data-sync-url, ?view= and ?node= are read on load and kept current.
 */
const NARROW = window.matchMedia('(max-width: 759px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll<HTMLElement>('[data-explorer]').forEach((root) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const views = [...root.querySelectorAll<HTMLElement>('[data-view]')];
  const modeButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  const panel = root.querySelector<HTMLElement>('[data-panel]')!;
  const panelEmpty = root.querySelector<HTMLElement>('[data-panel-empty]')!;
  const panelContent = root.querySelector<HTMLElement>('[data-panel-content]')!;
  const panelClose = root.querySelector<HTMLButtonElement>('[data-panel-close]')!;
  const syncUrl = root.dataset.syncUrl === 'true';
  // Narrow screens use a native <select> instead of the tab strip
  const picker = root.querySelector<HTMLSelectElement>('[data-view-select]');

  let current = root.dataset.initialView ?? views[0]?.dataset.view ?? '';
  let selected: { view: string; node: string } | null = null;
  let lastTrigger: HTMLElement | null = null;

  const viewEl = (v: string) => views.find((el) => el.dataset.view === v);
  const board = (v: string) => viewEl(v)?.querySelector<SVGSVGElement>('[data-board]');

  // ── URL ──────────────────────────────────────────────────────
  const writeUrl = () => {
    if (!syncUrl) return;
    const url = new URL(window.location.href);
    url.searchParams.set('view', current);
    if (selected) url.searchParams.set('node', selected.node);
    else url.searchParams.delete('node');
    history.replaceState(null, '', url);
  };

  // ── Views ────────────────────────────────────────────────────
  const showView = (v: string, { focusTab = false, animate = true } = {}) => {
    if (!viewEl(v)) return;
    current = v;
    tabs.forEach((t) => {
      const on = t.dataset.tab === v;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focusTab) t.focus();
      // Keep the selected tab visible when the tab strip scrolls (mobile)
      if (on) {
        const strip = t.parentElement!;
        const left = t.offsetLeft - strip.offsetLeft;
        const target = left - (strip.clientWidth - t.offsetWidth) / 2;
        strip.scrollTo({ left: Math.max(0, target), behavior: reduceMotion.matches || !animate ? 'auto' : 'smooth' });
      }
    });
    views.forEach((el) => (el.hidden = el.dataset.view !== v));
    if (picker) {
      picker.value = v;
      picker.parentElement?.setAttribute('data-layer', v);
    }
    if (selected && selected.view !== v) clearSelection(false);
    const svg = board(v);
    if (svg && animate && !reduceMotion.matches) {
      svg.classList.remove('is-entering');
      void svg.getBoundingClientRect();
      svg.classList.add('is-entering');
    }
    writeUrl();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showView(tab.dataset.tab!));
    tab.addEventListener('keydown', (e) => {
      let next = -1;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next >= 0) {
        e.preventDefault();
        showView(tabs[next].dataset.tab!, { focusTab: true });
      }
    });
  });

  picker?.addEventListener('change', () => showView(picker.value));

  // ── Map / List ───────────────────────────────────────────────
  let userChoseMode = false;
  const setMode = (mode: 'map' | 'list') => {
    root.dataset.mode = mode;
    modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  };
  modeButtons.forEach((b) =>
    b.addEventListener('click', () => {
      userChoseMode = true;
      setMode(b.dataset.mode as 'map' | 'list');
    }),
  );
  setMode(NARROW.matches ? 'list' : 'map');
  NARROW.addEventListener('change', (e) => userChoseMode || setMode(e.matches ? 'list' : 'map'));

  // ── Selection ────────────────────────────────────────────────
  /** Mark a node, the edges it touches, and the nodes at the other end. */
  const highlight = (svg: SVGSVGElement | null | undefined, nodeId: string | null, cls: string) => {
    if (!svg) return;
    svg.querySelectorAll(`.${cls}`).forEach((el) => el.classList.remove(cls));
    svg.classList.toggle(`has-${cls}`, !!nodeId);
    if (!nodeId) return;
    const lit = new Set([nodeId]);
    svg.querySelectorAll(`[data-from="${nodeId}"], [data-to="${nodeId}"]`).forEach((edge) => {
      edge.classList.add(cls);
      lit.add(edge.getAttribute('data-from')!);
      lit.add(edge.getAttribute('data-to')!);
    });
    lit.forEach((id) => svg.querySelector(`[data-node="${id}"]`)?.classList.add(cls));
  };

  const select = (view: string, nodeId: string, { focus = true } = {}) => {
    const source = viewEl(view)?.querySelector<HTMLElement>(`[data-list-node="${nodeId}"] [data-detail]`);
    if (!source) return;
    if (view !== current) showView(view, { animate: false });
    selected = { view, node: nodeId };
    highlight(board(view), nodeId, 'is-lit');
    board(view)?.querySelectorAll('[data-node]').forEach((n) => n.removeAttribute('aria-current'));
    board(view)?.querySelector(`[data-node="${nodeId}"]`)?.setAttribute('aria-current', 'true');

    const clone = source.cloneNode(true) as HTMLElement;
    panelContent.replaceChildren(clone);
    panelContent.hidden = false;
    panelEmpty.hidden = true;
    panelClose.hidden = false;
    panel.classList.remove('is-updated');
    void panel.offsetWidth;
    panel.classList.add('is-updated');

    if (root.dataset.mode === 'list') {
      const details = viewEl(view)?.querySelector<HTMLDetailsElement>(`[data-list-node="${nodeId}"]`);
      if (details) details.open = true;
    }
    if (focus) {
      if (window.matchMedia('(max-width: 1023px)').matches) panel.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      clone.querySelector<HTMLElement>('[data-detail-heading]')?.focus({ preventScroll: true });
    }
    writeUrl();
  };

  function clearSelection(restoreFocus = true) {
    if (!selected) return;
    const prev = selected;
    selected = null;
    highlight(board(prev.view), null, 'is-lit');
    board(prev.view)?.querySelectorAll('[data-node]').forEach((n) => n.removeAttribute('aria-current'));
    panelContent.replaceChildren();
    panelContent.hidden = true;
    panelEmpty.hidden = false;
    panelClose.hidden = true;
    if (restoreFocus) (lastTrigger ?? board(prev.view)?.querySelector<SVGElement>(`[data-node="${prev.node}"]`))?.focus();
    writeUrl();
  }

  root.querySelectorAll<SVGAElement>('[data-board] [data-node]').forEach((a) => {
    const nodeId = a.dataset.node!;
    const view = a.closest<SVGSVGElement>('[data-board]')!.dataset.board!;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      lastTrigger = a as unknown as HTMLElement;
      if (selected?.node === nodeId && selected.view === view) clearSelection();
      else select(view, nodeId);
    });
    const hover = (on: boolean) => highlight(board(view), on ? nodeId : null, 'is-hover');
    a.addEventListener('mouseenter', () => hover(true));
    a.addEventListener('mouseleave', () => hover(false));
    a.addEventListener('focus', () => hover(true));
    a.addEventListener('blur', () => hover(false));
  });

  // Links inside a detail that point at another view of the same node
  root.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-goto-view]');
    if (!link || !root.contains(link)) return;
    e.preventDefault();
    select(link.dataset.gotoView!, link.dataset.gotoNode!);
  });

  panelClose.addEventListener('click', () => clearSelection());
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selected) {
      e.stopPropagation();
      clearSelection();
    }
  });

  // ── Initial state ────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const startView = syncUrl && params.get('view') && viewEl(params.get('view')!) ? params.get('view')! : current;
  showView(startView, { animate: false });
  const startNode = syncUrl ? params.get('node') : null;
  if (startNode) select(startView, startNode, { focus: false });
});
