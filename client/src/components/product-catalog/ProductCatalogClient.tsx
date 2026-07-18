"use client";

import { Check, ChevronDown, RotateCcw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProductCatalogFilters, getProductCatalogProducts, getProductCatalogRecommended, getProductCatalogStylistPicks } from "@/api/product-catalog.api";
import ProductCard from "@/components/products/ProductCard";
import { useBrand } from "@/providers/BrandProvider";

type FilterState = { search: string; category: string; size: string; color: string; priceMin: string; priceMax: string; occasion: string; style: string; sustainability: string; sort: string };
const initialFilters: FilterState = { search: "", category: "", size: "", color: "", priceMin: "", priceMax: "", occasion: "", style: "", sustainability: "", sort: "latest" };

function cx(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }
function queryOf(filters: FilterState) { return Object.fromEntries(Object.entries(filters).filter(([, value]) => Boolean(value))); }

export default function ProductCatalogClient() {
  const { brand } = useBrand();
  const [filtersData, setFiltersData] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [stylistPicks, setStylistPicks] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const requestId = useRef(0);

  const activeFilterCount = useMemo(() => Object.entries(filters).filter(([key, value]) => key !== "sort" && Boolean(value)).length, [filters]);

  async function loadProducts(next: FilterState) {
    const id = ++requestId.current; setLoading(true);
    try { const response = await getProductCatalogProducts(queryOf(next)); if (id === requestId.current) setProducts(Array.isArray(response?.items) ? response.items : []); }
    catch { if (id === requestId.current) setProducts([]); }
    finally { if (id === requestId.current) setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    Promise.allSettled([getProductCatalogFilters(), getProductCatalogStylistPicks(), getProductCatalogRecommended()]).then(([filterResult, picksResult, recommendedResult]) => {
      if (!active) return;
      if (filterResult.status === "fulfilled") setFiltersData(filterResult.value || {});
      if (picksResult.status === "fulfilled") setStylistPicks(Array.isArray(picksResult.value) ? picksResult.value : []);
      if (recommendedResult.status === "fulfilled") setRecommended(Array.isArray(recommendedResult.value) ? recommendedResult.value : []);
    });
    void loadProducts(initialFilters);
    return () => { active = false; requestId.current += 1; };
  }, []);

  function apply(next: FilterState, closeDrawer = false) { setFilters(next); void loadProducts(next); if (closeDrawer) setFilterOpen(false); }
  function update(key: keyof FilterState, value: string) { apply({ ...filters, [key]: value }); }
  function submitSearch(event: FormEvent) { event.preventDefault(); void loadProducts(filters); }
  function clearFilters() { apply(initialFilters); }
  function setPriceRange(range: any) { apply({ ...filters, priceMin: String(range.min ?? ""), priceMax: range.max == null ? "" : String(range.max) }); }

  const derivedCategories = Array.from(new Map(products.map((product:any)=>[product.category?.slug,product.category]).filter(([key])=>key)).values());
  const derivedSizes = Array.from(new Set(products.flatMap((product:any)=>(product.variants||[]).map((variant:any)=>variant.size)).filter(Boolean)));
  const derivedColors = Array.from(new Set(products.flatMap((product:any)=>(product.variants||[]).map((variant:any)=>variant.color).filter(Boolean))));
  const filterProps = { filters, activeFilterCount, clearFilters, updateFilter: update, setPriceRange, categories: filtersData.categories?.length ? filtersData.categories : derivedCategories, sizes: filtersData.sizes?.length ? filtersData.sizes : derivedSizes, colors: filtersData.colors?.length ? filtersData.colors : derivedColors, priceRanges: filtersData.priceRanges || [], occasions: filtersData.occasions || [], styles: filtersData.styles || [], sustainability: filtersData.sustainability || [] };

  return <main className="min-h-screen overflow-x-hidden bg-zinc-50 pt-[var(--ai-header-h-mobile)] text-zinc-950 dark:bg-black dark:text-white sm:pt-[var(--ai-header-h-tablet)] lg:pt-[var(--ai-header-h-desktop)]">
    <header className="border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">{brand.storeName} collection</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Find something that feels right</h1><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Browse live products, compare variants and use AI styling tools without leaving the catalog.</p></div>
          <form onSubmit={submitSearch} className="flex w-full max-w-xl items-center gap-2">
            <label className="relative min-w-0 flex-1"><span className="sr-only">Search products</span><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/><input value={filters.search} onChange={(event)=>setFilters((current)=>({...current,search:event.target.value}))} placeholder="Search products, SKU or style" className="min-h-12 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-white/15 dark:bg-black dark:focus:border-white"/></label>
            <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-bold text-white dark:bg-white dark:text-black">Search</button>
          </form>
        </div>
      </div>
    </header>

    <section className="mx-auto grid max-w-[1500px] gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 lg:py-8">
      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start"><FilterPanel {...filterProps}/></aside>
      <div className="min-w-0">
        <div className="sticky top-[var(--ai-header-h-mobile)] z-30 -mx-4 border-y border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/90 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded-lg lg:border lg:bg-white lg:px-4 lg:dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-base font-black sm:text-lg">All products</h2><p className="text-xs text-zinc-500">{loading ? "Updating catalog..." : `${products.length} items found`}</p></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={()=>setFilterOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-xs font-bold dark:border-white/15 dark:bg-zinc-950 lg:hidden"><SlidersHorizontal size={16}/> Filters{activeFilterCount ? <span className="grid h-5 min-w-5 place-items-center rounded bg-zinc-950 px-1 text-[10px] text-white dark:bg-white dark:text-black">{activeFilterCount}</span> : null}</button><label className="relative"><span className="sr-only">Sort products</span><select value={filters.sort} onChange={(event)=>update("sort",event.target.value)} className="min-h-11 appearance-none rounded-md border border-zinc-300 bg-white py-2 pl-3 pr-8 text-xs font-bold dark:border-white/15 dark:bg-zinc-950"><option value="latest">Latest</option><option value="trending">Trending</option><option value="price-low">Price: Low</option><option value="price-high">Price: High</option></select><ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"/></label></div></div>
          {activeFilterCount ? <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1"><button type="button" onClick={clearFilters} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border px-3 text-xs font-bold"><RotateCcw size={14}/> Clear {activeFilterCount}</button>{Object.entries(filters).filter(([key,value])=>key!=="sort"&&value).map(([key,value])=><button key={key} type="button" onClick={()=>update(key as keyof FilterState,"")} className="min-h-9 shrink-0 rounded-md bg-zinc-200 px-3 text-xs font-semibold dark:bg-zinc-800">{String(value)} ×</button>)}</div> : null}
        </div>

        <div className="mt-4">
          {loading ? <ProductSkeleton/> : products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-5">{products.map((product)=><ProductCard key={product.id} product={product}/>)}</div> : <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-white/15 dark:bg-zinc-950"><div><Search className="mx-auto text-zinc-400" size={30}/><h3 className="mt-3 text-lg font-black">No matching products</h3><p className="mt-1 text-sm text-zinc-500">Change the search or clear filters to see the full catalog.</p><button type="button" onClick={clearFilters} className="mt-5 min-h-11 rounded-md bg-zinc-950 px-5 text-sm font-bold text-white dark:bg-white dark:text-black">Reset catalog</button></div></div>}
        </div>

        {stylistPicks.length ? <CatalogSection title="Stylist edits" subtitle="Curated looks"><div className="grid gap-3 sm:grid-cols-2">{stylistPicks.slice(0,4).map((item:any)=><Link key={item.id} href={item.slug?`/lookbook/${item.slug}`:"/lookbook"} className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-950"><h3 className="font-bold">{item.title||item.name||"Lookbook edit"}</h3><p className="mt-1 line-clamp-2 text-sm text-zinc-500">{item.description||"Explore a curated styling story."}</p></Link>)}</div></CatalogSection> : null}
        {recommended.length ? <div id="recommended-for-you" className="scroll-mt-28"><CatalogSection title="Recommended for you" subtitle="AI-assisted selection"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-5">{recommended.slice(0,10).map((product:any)=><ProductCard key={product.id} product={product}/>)}</div></CatalogSection></div> : null}
      </div>
    </section>

    {filterOpen ? <div className="fixed inset-0 z-[100] lg:hidden"><button type="button" aria-label="Close filters" onClick={()=>setFilterOpen(false)} className="absolute inset-0 bg-black/55"/><aside role="dialog" aria-label="Product filters" className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-lg bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-zinc-950 shadow-2xl dark:bg-zinc-950 dark:text-white"><div className="sticky top-0 z-10 -mx-4 -mt-4 mb-3 flex items-center justify-between border-b bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950"><div><h2 className="font-black">Filters</h2><p className="text-xs text-zinc-500">{activeFilterCount} active</p></div><button type="button" onClick={()=>setFilterOpen(false)} aria-label="Close filters" className="grid h-11 w-11 place-items-center rounded-md border dark:border-white/15"><X size={18}/></button></div><FilterPanel {...filterProps}/><button type="button" onClick={()=>setFilterOpen(false)} className="sticky bottom-0 mt-4 min-h-12 w-full rounded-md bg-zinc-950 text-sm font-bold text-white dark:bg-white dark:text-black">Show {products.length} products</button></aside></div> : null}
  </main>;
}

function FilterPanel({ activeFilterCount, clearFilters, categories, sizes, colors, priceRanges, occasions, styles, sustainability, filters, updateFilter, setPriceRange }: any) {
  return <div data-saqso-catalog-filter className="h-auto self-start rounded-lg border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-950"><div className="flex items-center justify-between px-1 py-2"><h2 className="font-black">Filter products</h2>{activeFilterCount?<button type="button" onClick={clearFilters} className="text-xs font-bold text-rose-600 dark:text-rose-400">Clear all</button>:null}</div><div className="mt-2 space-y-2">
    <FilterGroup title="Category" defaultOpen><OptionList items={categories} value={filters.category} label={(item:any)=>item.name} optionValue={(item:any)=>item.slug} onChange={(value)=>updateFilter("category",value)}/></FilterGroup>
    <FilterGroup title="Size"><ChipGrid items={sizes} value={filters.size} onChange={(value)=>updateFilter("size",value)}/></FilterGroup>
    <FilterGroup title="Color"><ColorSwatches items={colors} value={filters.color} onChange={(value)=>updateFilter("color",value)}/></FilterGroup>
    <FilterGroup title="Price"><OptionList items={priceRanges} value={`${filters.priceMin}-${filters.priceMax}`} label={(item:any)=>item.label} optionValue={(item:any)=>`${item.min??""}-${item.max??""}`} onChange={(_,item)=>setPriceRange(item)}/></FilterGroup>
    <FilterGroup title="Occasion"><ChipGrid items={occasions} value={filters.occasion} onChange={(value)=>updateFilter("occasion",value)}/></FilterGroup>
    <FilterGroup title="Style"><ChipGrid items={styles} value={filters.style} onChange={(value)=>updateFilter("style",value)}/></FilterGroup>
    <FilterGroup title="Sustainability"><ChipGrid items={sustainability} value={filters.sustainability} onChange={(value)=>updateFilter("sustainability",value)}/></FilterGroup>
  </div></div>;
}

function FilterGroup({ title, children, defaultOpen=false }: { title:string; children:ReactNode; defaultOpen?:boolean }) { const [open,setOpen]=useState(defaultOpen); return <section data-saqso-filter-group className="h-auto border-b border-zinc-200 last:border-0 dark:border-white/10"><button type="button" onClick={()=>setOpen(!open)} aria-expanded={open} className="flex min-h-11 w-full items-center justify-between px-2 text-left text-sm font-bold"><span>{title}</span><ChevronDown size={16} className={cx("transition",open&&"rotate-180")}/></button>{open?<div data-saqso-filter-options className="h-auto px-2 pb-3">{children}</div>:null}</section>; }
function OptionList({items,value,label,optionValue,onChange}:{items:any[];value:string;label:(item:any)=>string;optionValue:(item:any)=>string;onChange:(value:string,item:any)=>void}) { if(!items?.length)return <p className="text-xs text-zinc-500">No options available</p>; return <div className="grid h-auto auto-rows-max content-start gap-1">{items.map((item,index)=>{const next=optionValue(item);const active=value===next;return <button key={item.id||next||index} type="button" onClick={()=>onChange(active?"":next,item)} className={cx("min-h-10 rounded-md px-3 text-left text-sm",active?"bg-zinc-950 font-bold text-white dark:bg-white dark:text-black":"hover:bg-zinc-100 dark:hover:bg-white/10")}>{label(item)}</button>})}</div>; }
function ChipGrid({items,value,onChange}:{items:string[];value:string;onChange:(value:string)=>void}) { if(!items?.length)return <p className="text-xs text-zinc-500">No options available</p>; return <div className="flex flex-wrap gap-2">{items.map((item)=><button key={item} type="button" onClick={()=>onChange(value===item?"":item)} className={cx("min-h-9 rounded-md border px-3 text-xs font-bold",value===item?"border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black":"border-zinc-300 dark:border-white/15")}>{item}</button>)}</div>; }
const COLOR_MAP:Record<string,string>={black:"#111111",white:"#ffffff",red:"#ef4444",blue:"#2563eb",navy:"#172554",green:"#16a34a",yellow:"#facc15",orange:"#f97316",pink:"#ec4899",purple:"#9333ea",brown:"#7c4a2d",beige:"#e8dcc4",cream:"#fffdd0",grey:"#9ca3af",gray:"#9ca3af",maroon:"#7f1d1d",gold:"#d4a017",silver:"#c0c0c0","off white":"#f8f3e7"};
function ColorSwatches({items,value,onChange}:{items:Array<string|{name?:string;value?:string;hex?:string}>;value:string;onChange:(value:string)=>void}) { if(!items?.length)return <p className="text-xs text-zinc-500">No colors available</p>; return <div className="flex flex-wrap gap-3">{items.map((raw,index)=>{const name=typeof raw==="string"?raw:(raw.name||raw.value||`Color ${index+1}`);const color=typeof raw==="string"?(COLOR_MAP[raw.toLowerCase()]||raw):(raw.hex||COLOR_MAP[name.toLowerCase()]||raw.value||"#d4d4d8");const active=value===name;return <button key={`${name}-${index}`} type="button" title={name} aria-label={`Filter by ${name}`} aria-pressed={active} onClick={()=>onChange(active?"":name)} className={cx("relative grid h-9 w-9 place-items-center rounded-full border-2 shadow-sm transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:ring-offset-black",active?"border-rose-500":"border-white ring-1 ring-zinc-300 dark:border-zinc-950 dark:ring-white/30")} style={{backgroundColor:color}}>{active?<Check size={16} className="rounded-full bg-black/60 p-0.5 text-white"/>:null}</button>})}</div>; }
function ProductSkeleton(){return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-5">{Array.from({length:10}).map((_,index)=><div key={index} className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950"><div className="aspect-[4/5] animate-pulse bg-zinc-200 dark:bg-zinc-800"/><div className="space-y-2 p-3"><div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/><div className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/><div className="h-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"/></div></div>)}</div>}
function CatalogSection({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}) { return <section className="mt-10 border-t border-zinc-200 pt-7 dark:border-white/10"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">{subtitle}</p><h2 className="mt-1 text-xl font-black sm:text-2xl">{title}</h2></div><Sparkles size={20} className="text-zinc-400"/></div>{children}</section>; }
