(() => {
  const body = document.querySelector('#chart-body');
  const search = document.querySelector('#chart-search');
  const levelFilter = document.querySelector('#level-filter');
  const visibleCount = document.querySelector('#visible-count');
  const errorBox = document.querySelector('#load-error');
  let rows = [];
  let header = {};
  const copy = async (text, button) => {
    await navigator.clipboard.writeText(text);
    const old = button.textContent; button.textContent = 'コピーしました'; setTimeout(() => button.textContent = old, 1200);
  };
  document.querySelector('#copy-page-url').addEventListener('click', e => copy(location.href, e.currentTarget));
  document.querySelector('#copy-header-url').addEventListener('click', e => copy(new URL('./header.json', location.href).href, e.currentTarget));
  const cellText = (value, className='') => { const td = document.createElement('td'); td.className = className; td.textContent = value ?? ''; return td; };
  const render = () => {
    const q = search.value.trim().toLowerCase();
    const lv = levelFilter.value;
    const filtered = rows.filter(row => (!lv || String(row.level ?? '') === lv) && `${row.level ?? ''} ${row.title ?? ''} ${row.artist ?? ''}`.toLowerCase().includes(q));
    visibleCount.textContent = `${filtered.length} / ${rows.length}譜面`;
    body.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (const row of filtered) {
      const tr = document.createElement('tr'); tr.append(cellText(row.level, 'level'));
      const title = document.createElement('td');
      if (row.url) { const a = document.createElement('a'); a.href = row.url; a.textContent = row.title || '(無題)'; a.target = '_blank'; a.rel='noopener'; title.append(a); }
      else title.textContent = row.title || '(無題)';
      tr.append(title, cellText(row.artist));
      const links = document.createElement('td'); links.className='links';
      if (row.url) { const a=document.createElement('a');a.href=row.url;a.textContent='本体';a.target='_blank';a.rel='noopener';links.append(a); }
      if (row.url_diff) { const a=document.createElement('a');a.href=row.url_diff;a.textContent='差分';a.target='_blank';a.rel='noopener';links.append(a); }
      tr.append(links); fragment.append(tr);
    }
    body.append(fragment);
  };
  Promise.all([
    fetch('./header.json', {cache:'no-store'}).then(r => { if(!r.ok) throw new Error(`header.json: ${r.status}`); return r.json(); }),
    fetch('./data.json', {cache:'no-store'}).then(r => { if(!r.ok) throw new Error(`data.json: ${r.status}`); return r.json(); }),
    fetch('./table-meta.json', {cache:'no-store'}).then(r => r.ok ? r.json() : ({})),
  ]).then(([h, data, meta]) => {
    header = h; rows = Array.isArray(data) ? data : [];
    document.querySelector('#chart-count').textContent = `${rows.length}譜面`;
    document.querySelector('#updated-at').textContent = meta.updated_at ? `更新 ${meta.updated_at}` : '';
    const levels = Array.isArray(h.level_order) && h.level_order.length ? h.level_order : [...new Set(rows.map(r => String(r.level ?? '')))];
    for (const level of levels) { const option=document.createElement('option'); option.value=String(level); option.textContent=String(level); levelFilter.append(option); }
    render();
  }).catch(err => { errorBox.hidden=false; errorBox.textContent=`難易度表を読み込めませんでした: ${err.message}`; });
  search.addEventListener('input', render); levelFilter.addEventListener('change', render);
})();
