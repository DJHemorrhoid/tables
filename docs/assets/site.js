(() => {
  const list = document.querySelector('#table-list');
  const search = document.querySelector('#table-search');
  const count = document.querySelector('#table-count');
  let tables = [];
  const esc = (value) => String(value ?? '');
  const copy = async (text, button) => {
    await navigator.clipboard.writeText(text);
    const old = button.textContent;
    button.textContent = 'コピーしました';
    setTimeout(() => button.textContent = old, 1200);
  };
  const render = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = tables.filter(t => `${t.name} ${t.description} ${t.symbol}`.toLowerCase().includes(query));
    count.textContent = `${filtered.length} / ${tables.length} 表`;
    list.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = '該当する難易度表はありません。'; list.append(empty); return;
    }
    for (const table of filtered) {
      const card = document.createElement('article'); card.className = 'card';
      const h = document.createElement('h2'); h.textContent = table.name; card.append(h);
      const meta = document.createElement('div'); meta.className = 'meta-row';
      for (const text of [`${table.chart_count}譜面`, `${table.folder_count}レベル`, table.updated_at ? `更新 ${table.updated_at}` : '']) {
        if (!text) continue; const pill = document.createElement('span'); pill.className = 'pill'; pill.textContent = text; meta.append(pill);
      }
      card.append(meta);
      if (table.description) { const p = document.createElement('p'); p.textContent = table.description; card.append(p); }
      const actions = document.createElement('div'); actions.className = 'actions';
      const open = document.createElement('a'); open.className = 'button'; open.href = table.url; open.textContent = '表を見る'; actions.append(open);
      const copyButton = document.createElement('button'); copyButton.type = 'button'; copyButton.textContent = '登録URLをコピー';
      copyButton.addEventListener('click', () => copy(new URL(table.url, location.href).href, copyButton)); actions.append(copyButton);
      card.append(actions); list.append(card);
    }
  };
  fetch('./tables.json', {cache:'no-store'}).then(r => { if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json(); })
    .then(data => { tables = Array.isArray(data.tables) ? data.tables : []; render(); })
    .catch(err => { list.innerHTML = `<p class="error">一覧を読み込めませんでした: ${esc(err.message)}</p>`; });
  search.addEventListener('input', render);
})();
