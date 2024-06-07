import { ChangeEvent, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AppLayout, ProductListLayout } from "@/layout";
import { Filter, Header, ProductList, ProductListTitle } from "@/components";
import type { Category, Sort } from "./types";
import { getProducts } from "@/api/product";
import { useIntersectionObserver } from "@/hooks";
import { CATEGORIES, SORTS } from "./constants/product";

const App = () => {
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<Sort>("price,id,asc");

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (CATEGORIES.includes(event.target.value)) {
      setCategory(event.target.value);
    }
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (SORTS.includes(event.target.value)) {
      setSort(event.target.value);
    }
  };

  const { data, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["products", category, sort],
    queryFn: ({ pageParam }) =>
      getProducts(pageParam.page, pageParam.size, category, sort),
    initialPageParam: { page: 0, size: 20 },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.last) return;
      if (allPages.length === 0) {
        return { page: 0, size: 20 };
      }
      return { page: allPages.length + 4, size: 4 };
    },
  });
  const observerTarget = useIntersectionObserver(fetchNextPage);

  const productList =
    data?.pages.flatMap((page) => {
      return page.content;
    }) || [];

  return (
    <AppLayout>
      <Header />
      <ProductListLayout>
        <ProductListTitle />
        <Filter
          category={category}
          sort={sort}
          handleCategoryChange={handleCategoryChange}
          handleSortChange={handleSortChange}
          style={{ marginTop: "24px", marginBottom: "28px" }}
        />
        <ProductList productList={productList} />
        {!isFetching && <div ref={observerTarget}></div>}
      </ProductListLayout>
    </AppLayout>
  );
};

export default App;
