"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from '@/components/shop/ProductCard'
import FilterSection, { FilterValues } from '@/components/shop/filters/FilterSection'
import CategorySelector from '@/components/shop/CategorySelector'
import SortSelector, { SortOption } from '@/components/shop/SortSelector'

import SearchInput from '@/components/shop/SearchInput'
import MobileFilterToggle from '@/components/shop/MobileFilterToggle'
import { AnimatePresence, motion } from 'framer-motion'
import { useProducts } from '@/lib/api/products'
import { useFavoriteIds, useToggleFavorite } from '@/lib/api/favorites'
import { useSession } from '@/lib/auth'
import type { ProductListParams } from '@/lib/api/products'

type PrismaCategory = 'PLATS' | 'BOISSONS' | 'DESSERTS' | 'SNACKS'

type LocalCategory = 'Tous' | 'Plats' | 'Jus' | 'Desserts' | 'Snacks'

const CATEGORY_MAP: Record<LocalCategory, PrismaCategory | undefined> = {
  Tous: undefined,
  Plats: 'PLATS',
  Jus: 'BOISSONS',
  Desserts: 'DESSERTS',
  Snacks: 'SNACKS',
}

const CATEGORIES: LocalCategory[] = ['Tous', 'Plats', 'Jus', 'Desserts', 'Snacks']

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'popular', label: 'Populaire' },
  { value: 'newest', label: 'Plus récent' },
  { value: 'price-low', label: 'Prix: bas à élevé' },
  { value: 'price-high', label: 'Prix: élevé à bas' },
  { value: 'alphabetical', label: 'Alphabétique' },
]

function buildApiParams(
  category: LocalCategory,
  search: string,
  sort: SortOption,
  filters: FilterValues | null,
  page: number,
): ProductListParams {
  const params: ProductListParams = {
    page,
    pageSize: 12,
    sortBy: sort as ProductListParams['sortBy'],
  }
  const prismaCategory = CATEGORY_MAP[category]
  if (prismaCategory) params.category = prismaCategory
  if (search.trim()) params.search = search.trim()
  if (filters) {
    if (filters.price[0] > 0) params.minPrice = filters.price[0]
    if (filters.price[1] < 900) params.maxPrice = filters.price[1]
    if (filters.isOnSale) params.isOnSale = true
    if (filters.isNew) params.isNew = true
    if (filters.isBestSeller) params.isBestSeller = true
    if (filters.rating > 0) params.minRating = filters.rating
    if (filters.mealType?.length) params.mealType = filters.mealType.join(',')
    if (filters.dietaryGoals?.length) params.dietaryGoals = filters.dietaryGoals.join(',')
    if (filters.portionSize?.length) params.portionSize = filters.portionSize.join(',')
    if (filters.specifications?.length) params.specifications = filters.specifications.join(',')
    if (filters.allergies?.length) params.allergies = filters.allergies.join(',')
    const { calories, proteins, carbs, fat, fiber } = filters.nutrition
    if (calories[0] > 0) params.minCalories = calories[0]
    if (calories[1] < 500) params.maxCalories = calories[1]
    if (proteins[0] > 0) params.minProteins = proteins[0]
    if (proteins[1] < 500) params.maxProteins = proteins[1]
    if (carbs[0] > 0) params.minCarbs = carbs[0]
    if (carbs[1] < 1000) params.maxCarbs = carbs[1]
    if (fat[0] > 0) params.minFat = fat[0]
    if (fat[1] < 200) params.maxFat = fat[1]
    if (fiber[0] > 0) params.minFiber = fiber[0]
    if (fiber[1] < 50) params.maxFiber = fiber[1]
  }
  return params
}

function countActiveFilters(filters: FilterValues | null): number {
  if (!filters) return 0
  let count = 0
  if (filters.price[0] > 0 || filters.price[1] < 900) count++
  if (filters.specifications.length > 0) count++
  if (filters.allergies.length > 0) count++
  if (filters.rating > 0) count++
  if (filters.isOnSale) count++
  if (filters.isNew) count++
  if (filters.isBestSeller) count++
  if (filters.mealType?.length) count++
  if (filters.dietaryGoals?.length) count++
  if (filters.portionSize?.length) count++
  const { calories, proteins, carbs, fat, fiber } = filters.nutrition
  if (calories[0] > 0 || calories[1] < 500) count++
  if (proteins[0] > 0 || proteins[1] < 500) count++
  if (carbs[0] > 0 || carbs[1] < 1000) count++
  if (fat[0] > 0 || fat[1] < 200) count++
  if (fiber[0] > 0 || fiber[1] < 50) count++
  return count
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-card border-secondary/5 border-4 rounded-[28px] p-4 gap-3"
          style={{ height: 520 }}
        >
          <Skeleton className="w-full h-60 rounded-[24px]" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <div className="flex justify-between items-center mt-auto gap-3">
            <Skeleton className="h-9 w-10 rounded-full flex-shrink-0" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

const ShopPage = () => {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentSort, setCurrentSort] = useState<SortOption>('popular')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<LocalCategory>('Tous')
  const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCategoryChange = useCallback((cat: LocalCategory) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback((opt: SortOption) => {
    setCurrentSort(opt)
    setCurrentPage(1)
  }, [])

  const handleFilterChange = useCallback((filters: FilterValues) => {
    setActiveFilters(filters)
    setCurrentPage(1)
  }, [])

  const apiParams = buildApiParams(
    selectedCategory,
    debouncedSearch,
    currentSort,
    activeFilters,
    currentPage,
  )

  const { data: productsData, isLoading: productsLoading } = useProducts(apiParams)
  const { data: favoriteIds = [] } = useFavoriteIds(isAuthenticated)
  const toggleFavorite = useToggleFavorite()

  const products = productsData?.data ?? []
  const meta = productsData?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalCount = meta?.total ?? 0

  const handleToggleFavorite = useCallback(
    (productId: string, isFavorite: boolean) => {
      if (!isAuthenticated) return
      toggleFavorite.mutate({ productId, isFavorite })
    },
    [isAuthenticated, toggleFavorite],
  )

  return (
    <div className="min-h-screen pt-36 pb-20 bg-primary-100">
      <div className="mx-8 px-4 pt-8">
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row gap-4 mb-7 items-center">
            <CategorySelector
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-3 w-full sm:w-auto">
              <MobileFilterToggle
                onClick={() => setIsMobileFilterOpen(true)}
                filterCount={countActiveFilters(activeFilters)}
              />
              <SortSelector
                options={SORT_OPTIONS}
                currentSort={currentSort}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          <div className="flex flex-row gap-6 pt-7 border-t-[2.5px] border-secondary/80">
            <div className="hidden lg:block w-1/4">
              <FilterSection
                onFilterChange={handleFilterChange}
                isMobileFilterOpen={false}
                closeMobileFilter={() => {}}
              />
            </div>

            <div className="flex-1">
              {!productsLoading && (
                <p className="text-secondary-850 mb-6 font-sans">
                  {totalCount} résultat{totalCount !== 1 ? 's' : ''}
                </p>
              )}

              {productsLoading ? (
                <ProductGridSkeleton />
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        rating={product.rating}
                        category={product.category}
                        image={product.image}
                        description={product.description}
                        isNew={product.isNew}
                        isOnSale={product.isOnSale}
                        isBestSeller={product.isBestSeller}
                        discount={product.discount ?? 0}
                        dietTypes={product.dietTypes}
                        allergens={product.allergens}
                        mealType={product.mealTypes}
                        portionSize={product.portionSize ?? undefined}
                        dietaryGoals={product.dietaryGoals}
                        prepTime={product.prepTime ?? undefined}
                        nutrition={
                          product.nutrition
                            ? {
                                calories: product.nutrition.calories,
                                proteins: product.nutrition.proteins,
                                carbs: product.nutrition.carbs,
                                fat: product.nutrition.fats,
                                fiber: product.nutrition.fiber,
                              }
                            : undefined
                        }
                        isFavorite={favoriteIds.includes(product.id)}
                        onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                      <Button
                        variant="outline"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Précédent
                      </Button>
                      <span className="text-secondary-850 font-sans text-sm">
                        Page {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-primary-200/50 rounded-lg">
                  <h3 className="text-xl font-sans font-medium text-secondary mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-secondary-850/70">
                    Essayez d'ajuster vos filtres ou votre recherche
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 right-0 z-50 w-full max-w-md">
              <FilterSection
                onFilterChange={handleFilterChange}
                isMobileFilterOpen={true}
                closeMobileFilter={() => setIsMobileFilterOpen(false)}
                className="h-full"
              />
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ShopPage
