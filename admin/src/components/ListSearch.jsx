import { useMemo, useState } from "react";

const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi");

export function useListSearch(items) {
  const [query, setQuery] = useState("");
  const filteredItems = useMemo(() => {
    const keyword = normalize(query.trim());
    if (!keyword) return items;
    return items.filter((item) => normalize(Object.values(item || {}).filter((value) => typeof value !== "object").join(" ")).includes(keyword));
  }, [items, query]);
  return { query, setQuery, filteredItems };
}

export function useListFilter(items, getValue) {
  const [filter, setFilter] = useState("all");
  const filteredItems = useMemo(() => filter === "all" ? items : items.filter((item) => {
    const value = getValue(item);
    return Array.isArray(value) ? value.some((entry) => String(entry) === filter) : String(value) === filter;
  }), [items, filter, getValue]);
  return { filter, setFilter, filteredItems };
}

export default function ListSearch({ value, onChange, placeholder = "Tìm kiếm…" }) {
  return <label className="list-search"><span className="material-symbols-outlined">search</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><button type="button" className="material-symbols-outlined" onClick={() => onChange("")} aria-label="Xóa tìm kiếm" hidden={!value}>close</button></label>;
}

export function ListFilter({ value, onChange, options, label = "Lọc" }) {
  return <label className="list-filter"><span className="material-symbols-outlined">filter_alt</span><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}><option value="all">Tất cả</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
