// src/components/Filters.jsx
// Reusable search + filter bar for helper list pages.

export default function Filters({ filters, onChange }) {
  const handle = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filters">
      <input
        className="input"
        placeholder="Search name or phone..."
        value={filters.search}
        onChange={handle("search")}
      />
      <select className="input" value={filters.province} onChange={handle("province")}>
        <option value="">All Provinces</option>
        {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select className="input" value={filters.category} onChange={handle("category")}>
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {filters.search || filters.province || filters.category ? (
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onChange({ search: "", province: "", category: "" })}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}

const PROVINCES = [
  "Kabul","Kapisa","Parwan","Wardak","Logar","Nangarhar","Laghman",
  "Panjshir","Baghlan","Bamyan","Ghazni","Paktika","Paktia","Khost",
  "Kunar","Nuristan","Badakhshan","Takhar","Kunduz","Samangan","Balkh",
  "Sar-e-Pol","Ghor","Daykundi","Herat","Badghis","Faryab","Jawzjan",
  "Kandahar","Zabul","Uruzgan","Nimroz","Helmand","Farah",
];

const CATEGORIES = [
  "construction","plumbing","carpenter","electrical","painting",
  "welding","tile","appliance","moving","other",
];
