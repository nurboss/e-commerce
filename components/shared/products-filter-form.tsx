type FilterOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductsFilterFormProps = {
  categories: FilterOption[];
  brands: FilterOption[];
  current: {
    q: string;
    category: string;
    brand: string;
    minPrice: string;
    maxPrice: string;
    inStock: boolean;
  };
};

export const ProductsFilterForm = ({
  categories,
  brands,
  current,
}: ProductsFilterFormProps) => {
  return (
    <form className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 md:grid-cols-6">
      <input
        type="text"
        name="q"
        defaultValue={current.q}
        placeholder="Search..."
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <select
        name="category"
        defaultValue={current.category}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        name="brand"
        defaultValue={current.brand}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">All brands</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.slug}>
            {brand.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        name="minPrice"
        defaultValue={current.minPrice}
        placeholder="Min price"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        type="number"
        min={0}
        name="maxPrice"
        defaultValue={current.maxPrice}
        placeholder="Max price"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">
        <input type="checkbox" name="inStock" defaultChecked={current.inStock} />
        In stock only
      </label>
      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Apply filters
      </button>
    </form>
  );
};
