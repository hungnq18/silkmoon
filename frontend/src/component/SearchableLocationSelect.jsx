import { useEffect, useMemo, useRef, useState } from 'react';

const normalizeSearch = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

export default function SearchableLocationSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  disabled = false,
  loading = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const selected = options.find((item) => String(item.code) === String(value));
  const filteredOptions = useMemo(() => {
    const keyword = normalizeSearch(search.trim());
    return keyword ? options.filter((item) => normalizeSearch(item.name).includes(keyword)) : options;
  }, [options, search]);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else setSearch('');
  }, [open]);

  return (
    <div ref={rootRef} className="location-combobox">
      <button
        type="button"
        className="type-input location-combobox-trigger input-underline font-body-md text-body-md text-slate-deep"
        disabled={disabled || loading}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? '' : 'text-on-surface-variant'}>{loading ? 'Đang tải…' : selected?.name || placeholder}</span>
        <span className="material-symbols-outlined">expand_more</span>
      </button>
      {open && !disabled && !loading && (
        <div className="location-combobox-popover">
          <div className="location-combobox-search">
            <span className="material-symbols-outlined">search</span>
            <input
              ref={inputRef}
              type="search"
              value={search}
              placeholder={searchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
            />
          </div>
          <div className="location-combobox-options" role="listbox">
            {filteredOptions.length ? filteredOptions.map((item) => (
              <button
                type="button"
                role="option"
                aria-selected={String(item.code) === String(value)}
                className={String(item.code) === String(value) ? 'selected' : ''}
                key={item.code}
                onClick={() => { onChange(item); setOpen(false); }}
              >
                <span>{item.name}</span>
                {String(item.code) === String(value) && <span className="material-symbols-outlined">check</span>}
              </button>
            )) : <p>Không tìm thấy địa điểm phù hợp.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
