import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronLeft, FiChevronRight, FiFilter, FiSearch, FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/empty-state";
import ProductCard, { ProductCardSkeleton } from "../components/product-card";
import { useCategoriesQuery, useSearchProductsQuery } from "../redux/api/productAPI";
import { CustomError } from "../types/api-types";
import { formatPrice, titleCase } from "../utils/features";
import { useAddToCart } from "../utils/useAddToCart";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const PRICE_STEPS = [2000, 5000, 10000, 25000, 50000, 100000, 0]; // 0 = any price
const SORTS = [
  { value: "", label: "Newest" },
  { value: "asc", label: "Price: low to high" },
  { value: "dsc", label: "Price: high to low" },
];

const Search = () => {
  // All filters live in the URL, so links like /search?category=laptops work
  // and the back button restores the previous filters
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "";
  const maxPrice = Number(params.get("price")) || 0;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useDocumentTitle(category ? titleCase(category) : search ? `Results for "${search}"` : "Shop all");

  const addToCart = useAddToCart();
  const categories = useCategoriesQuery("");
  const results = useSearchProductsQuery({ search, sort, category, page, price: maxPrice });

  useEffect(() => {
    if (results.isError)
      toast.error((results.error as CustomError)?.data?.message || "Could not load products");
  }, [results.isError, results.error]);

  // Any filter change goes back to page 1; changing the page keeps the filters
  const update = (changes: Record<string, string | number>, keepPage = false) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, String(value)) : next.delete(key)
    );
    if (!keepPage) next.delete("page");
    setParams(next);
  };

  // Debounced search box
  useEffect(() => {
    if (searchInput.trim() === search) return;
    const t = setTimeout(() => update({ search: searchInput.trim() }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const goToPage = (p: number) => {
    update({ page: p > 1 ? p : "" }, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const products = results.data?.products || [];
  const totalPage = results.data?.totalPage || 0;
  const total = results.data?.total;
  const hasFilters = Boolean(search || category || maxPrice || sort);

  return (
    <div className="page shop">
      <div className="shop-head">
        <div>
          <h1 className="page-title">{category ? titleCase(category) : "All products"}</h1>
          <p className="text-muted">
            {results.isFetching
              ? "Loading products…"
              : total !== undefined
              ? `${total} product${total === 1 ? "" : "s"}${search ? ` matching "${search}"` : ""}`
              : ""}
          </p>
        </div>

        <div className="shop-toolbar">
          <button className="btn btn-outline shop-filter-toggle" onClick={() => setFiltersOpen(true)}>
            <FiFilter /> Filters
          </button>
          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select id="sort" className="input" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={`filters card ${filtersOpen ? "open" : ""}`} aria-label="Filters">
          <div className="filters-head">
            <h2>Filters</h2>
            <button className="icon-btn filters-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <FiX />
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="search-box">Search</label>
            <div className="input-icon">
              <FiSearch />
              <input
                id="search-box"
                className="input"
                type="search"
                placeholder="Product name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Category</span>
            <div className="filter-options">
              {["", ...(categories.data?.categories || [])].map((c) => (
                <label key={c || "all"} className={`chip ${category === c ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={category === c}
                    onChange={() => update({ category: c })}
                  />
                  {c ? titleCase(c) : "All"}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Max price</span>
            <div className="filter-options">
              {PRICE_STEPS.map((p) => (
                <label key={p} className={`chip ${maxPrice === p ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="price"
                    value={p}
                    checked={maxPrice === p}
                    onChange={() => update({ price: p })}
                  />
                  {p ? `Under ${formatPrice(p)}` : "Any price"}
                </label>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-block" onClick={() => setParams(new URLSearchParams())}>
              Clear all filters
            </button>
          )}
          <button className="btn btn-primary btn-block filters-apply" onClick={() => setFiltersOpen(false)}>
            Show results
          </button>
        </aside>
        {filtersOpen && <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />}

        <section>
          {results.isLoading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<FiSearch />}
              title="No products found"
              text="Try a different search term, another category or a higher price limit."
              action={hasFilters ? { label: "Clear filters", to: "/search" } : undefined}
            />
          ) : (
            <div className={`product-grid ${results.isFetching ? "is-fetching" : ""}`}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          )}

          {totalPage > 1 && (
            <nav className="pagination" aria-label="Pages">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                <FiChevronLeft /> Previous
              </button>
              <span>
                Page {page} of {totalPage}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPage}
                onClick={() => goToPage(page + 1)}
              >
                Next <FiChevronRight />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
};

export default Search;
