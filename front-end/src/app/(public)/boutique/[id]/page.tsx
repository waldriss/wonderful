"use client"

import React, { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StarIcon } from '@/components/icons/StarIcon'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Minus, Heart, Share2, ShoppingCart,
  Clock, Dumbbell, Target, ChefHat, Leaf, Award, Check, Star
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useProduct } from '@/lib/api/products'
import { useFavoriteIds, useToggleFavorite } from '@/lib/api/favorites'
import { useProductReviews, useCreateReview } from '@/lib/api/reviews'
import { useSession } from '@/lib/auth'
import { resolveAppImage } from '@/lib/resolve-image'
import { formatCategoryLabel, formatDietTypeLabel } from '@/lib/product-labels'

type TabKey = 'description' | 'nutrition' | 'allergenes' | 'reviews'

// ─── Skeleton chargement ─────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-primary-100 pt-40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 rounded" />
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-8 w-1/3 rounded" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

const ProductDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<TabKey>('description')
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Suppléments sélectionnés : supplementId → quantité (0 = non sélectionné)
  const [selectedSupplements, setSelectedSupplements] = useState<Record<string, number>>({})

  const { addItem, openCart, getItemQuantity } = useCart()

  // ── API hooks ───────────────────────────────────────────────────────────────
  const { data: productData, isLoading: productLoading, isError } = useProduct(productId, !!productId)
  const { data: favoriteIds = [] } = useFavoriteIds(isAuthenticated)
  const toggleFavorite = useToggleFavorite()
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(
    productId,
    { page: 1, limit: 10 },
    !!productId,
  )
  const createReview = useCreateReview()

  const product = productData
  const isFavorite = product ? favoriteIds.includes(product.id) : false
  const itemInCart = product ? getItemQuantity(product.id) : 0
  const reviews = reviewsData?.data ?? []
  const reviewStats = reviewsData?.stats

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleToggleFavorite = useCallback(() => {
    if (!product || !isAuthenticated) return
    toggleFavorite.mutate({ productId: product.id, isFavorite })
  }, [product, isAuthenticated, isFavorite, toggleFavorite])

  const handleAddToCart = useCallback(() => {
    if (!product) return

    // Suppléments sélectionnés (quantité > 0)
    const supplements = (product.supplements ?? [])
      .filter((s) => (selectedSupplements[s.id] ?? 0) > 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        quantity: selectedSupplements[s.id],
      }))

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      discount: product.discount ?? undefined,
      isOnSale: product.isOnSale,
      description: product.description,
      rating: product.rating,
      nutrition: product.nutrition
        ? {
            calories: product.nutrition.calories,
            proteins: product.nutrition.proteins,
            carbs: product.nutrition.carbs,
            fat: product.nutrition.fats,
            fiber: product.nutrition.fiber,
          }
        : undefined,
      supplements,
    })

    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
      setQuantity(1)
      setSelectedSupplements({})
      openCart()
    }, 500)
  }, [product, quantity, selectedSupplements, addItem, openCart])

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
  }, [])

  const handleSubmitReview = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!product) return
      createReview.mutate(
        {
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title || undefined,
          comment: reviewForm.comment,
        },
        {
          onSuccess: () => {
            setReviewForm({ rating: 5, title: '', comment: '' })
            setReviewSubmitted(true)
          },
        },
      )
    },
    [product, reviewForm, createReview],
  )

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (productLoading) return <ProductDetailSkeleton />

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-secondary-850 font-sans text-lg">Produit introuvable</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </div>
      </div>
    )
  }

  const finalPrice = product.isOnSale && product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price

  // Prix des suppléments sélectionnés (par unité de produit)
  const supplementsTotal = (product.supplements ?? []).reduce(
    (sum, s) => sum + (selectedSupplements[s.id] ?? 0) * s.price,
    0
  )
  const totalWithSupplements = (finalPrice + supplementsTotal) * quantity

  // Build full image list: primary first, then secondary carousel images
  const allImages = [product.image, ...(product.images ?? [])].filter(Boolean)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'allergenes', label: 'Allergènes' },
    { key: 'reviews', label: `Avis (${reviewStats?.totalReviews ?? '—'})` },
  ]

  return (
    <div className="min-h-screen bg-primary-100 pt-40">
      {/* Barre haute */}
      <div className="sticky top-0 z-50 bg-primary-100/95 backdrop-blur-sm border-b border-secondary/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-secondary hover:bg-secondary/10 p-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleToggleFavorite}
                disabled={!isAuthenticated || toggleFavorite.isPending}
                className={`p-2 ${isFavorite ? 'text-red-500' : 'text-secondary'} hover:bg-secondary/10`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-secondary hover:bg-secondary/10 p-2"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                src={resolveAppImage(allImages[selectedImageIndex])}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <Badge className="bg-primary-400 text-white px-3 py-1 rounded-full font-sans font-medium">
                    Nouveau
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-yellow-500 text-white px-3 py-1 rounded-full font-sans font-medium">
                    <Award className="w-3 h-3 mr-1" />
                    Best Seller
                  </Badge>
                )}
                {product.isOnSale && product.discount && (
                  <Badge className="bg-red-500 text-white px-3 py-1 rounded-full font-sans font-medium">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnails — only render if there are multiple images */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 aspect-square w-20 rounded-xl overflow-hidden border-2 transition-colors duration-200 ${
                      selectedImageIndex === index
                        ? 'border-secondary'
                        : 'border-secondary/20 hover:border-secondary/40'
                    }`}
                  >
                    <Image
                      src={resolveAppImage(img)}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Infos produit */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold font-sans text-secondary-850 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-primary-400 fill-primary-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-secondary-850/70 font-sans ml-2">
                    {product.rating.toFixed(1)}
                    {reviewStats && ` (${reviewStats.totalReviews} avis)`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary-850/70 mb-4">
                <span className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                    {formatCategoryLabel(product.category)}
                </span>
                {product.prepTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Préparation :</span>
                    <span className="font-medium text-secondary-850">{product.prepTime}</span>
                  </span>
                )}
                {product.portionSize && (
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>Portion :</span>
                    <span className="font-medium text-secondary-850">{product.portionSize}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Meal types */}
            <div className="flex flex-wrap gap-2">
              {product.mealTypes.map((type, i) => (
                <Badge
                  key={`meal-${i}`}
                  className="bg-primary-200/50 text-secondary-850 border-primary-200 border px-3 py-1 rounded-full font-sans font-medium text-sm flex items-center gap-1"
                >
                  <Dumbbell className="w-3 h-3" />
                  {type}
                </Badge>
              ))}
            </div>

            {/* Prix */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl lg:text-4xl font-bold font-sans text-secondary">
                {finalPrice.toFixed(2)} DA
              </span>
              {product.isOnSale && product.discount && (
                <span className="text-xl text-secondary-850/50 line-through font-sans">
                  {product.price.toFixed(2)} DA
                </span>
              )}
            </div>

            {/* Suppléments */}
            {product.supplements && product.supplements.length > 0 && (
              <div className="bg-white/50 rounded-2xl p-4 border-2 border-secondary/10">
                <h3 className="font-sans font-semibold text-secondary-850 mb-1 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Suppléments
                </h3>
                <p className="text-xs text-secondary-850/60 font-sans mb-3">
                  Ajoutez des options à votre {product.name.toLowerCase()}
                </p>
                <div className="space-y-2">
                  {product.supplements.map((supplement) => {
                    const selectedQty = selectedSupplements[supplement.id] ?? 0
                    return (
                      <div
                        key={supplement.id}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors duration-150 ${
                          selectedQty > 0
                            ? 'bg-secondary/10 border-secondary/40'
                            : 'bg-white/60 border-secondary/10 hover:border-secondary/30'
                        }`}
                      >
                        <div>
                          <p className="font-sans font-medium text-secondary-850 text-sm">
                            {supplement.name}
                          </p>
                          <p className="text-xs font-sans text-secondary">
                            +{supplement.price} DA
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedSupplements((prev) => ({
                                ...prev,
                                [supplement.id]: Math.max(0, (prev[supplement.id] ?? 0) - 1),
                              }))
                            }
                            disabled={selectedQty === 0}
                            className="p-1 h-8 w-8 hover:bg-secondary/10 text-secondary rounded-full"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-6 text-center font-sans font-bold text-secondary-850 text-sm">
                            {selectedQty}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedSupplements((prev) => ({
                                ...prev,
                                [supplement.id]: (prev[supplement.id] ?? 0) + 1,
                              }))
                            }
                            className="p-1 h-8 w-8 hover:bg-secondary/10 text-secondary rounded-full"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Résumé nutrition */}
            {product.nutrition && (
              <div className="bg-white/50 rounded-2xl p-4 border-2 border-secondary/10">
                <h3 className="font-sans font-semibold text-secondary-850 mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Informations nutritionnelles
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Calories', value: `${product.nutrition.calories}` },
                    { label: 'Protéines', value: `${product.nutrition.proteins}g` },
                    { label: 'Glucides', value: `${product.nutrition.carbs}g` },
                    { label: 'Lipides', value: `${product.nutrition.fats}g` },
                    { label: 'Fibres', value: `${product.nutrition.fiber}g` },
                  ].map((n) => (
                    <div key={n.label} className="text-center">
                      <div className="text-lg font-bold text-secondary">{n.value}</div>
                      <div className="text-xs text-secondary-850/70 font-sans">{n.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité + panier */}
            <div className="space-y-4">
              {itemInCart > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-sans font-semibold text-green-600">
                      {itemInCart} article{itemInCart > 1 ? 's' : ''} dans le panier
                    </span>
                  </div>
                  <Button
                    onClick={openCart}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Voir le panier
                  </Button>
                </motion.div>
              )}

              <div className="flex items-center gap-4">
                <span className="font-sans font-medium text-secondary-850">Quantité:</span>
                <div className="flex items-center border-2 border-secondary/20 rounded-full overflow-hidden">
                  <Button
                    variant="ghost"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 hover:bg-secondary/10 text-secondary rounded-none"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-6 py-2 bg-white text-secondary-850 font-sans font-medium min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 hover:bg-secondary/10 text-secondary rounded-none"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 px-6 rounded-full font-sans font-semibold text-lg"
                disabled={isAddedToCart || product.stock === 0}
              >
                <motion.span
                  className="flex items-center justify-center"
                  animate={isAddedToCart ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Ajouté au panier !
                    </>
                  ) : product.stock === 0 ? (
                    'Rupture de stock'
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Ajouter au panier — {totalWithSupplements.toFixed(2)} DA
                    </>
                  )}
                </motion.span>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Onglets détail */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex gap-1 mb-6 bg-white/50 p-2 rounded-2xl border-2 border-secondary/10 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-xl font-sans font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-secondary text-white shadow-md'
                    : 'text-secondary-850 hover:bg-secondary/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white/50 rounded-2xl p-6 border-2 border-secondary/10"
            >
              {/* ── Description ─────────────────────────────── */}
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-sans text-secondary-850">Description</h3>
                  <p className="text-secondary-850/80 font-sans leading-relaxed">{product.description}</p>
                  {product.dietaryGoals.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-secondary-850 font-sans mb-2">Objectifs nutritionnels:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.dietaryGoals.map((goal, i) => (
                          <Badge key={i} className="bg-secondary/10 text-secondary border-secondary/20 border">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.dietTypes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-secondary-850 font-sans mb-2">Types de régime:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.dietTypes.map((d, i) => (
                          <Badge key={i} className="bg-green-50 text-green-700 border-green-200 border">
                            {formatDietTypeLabel(d)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Nutrition ───────────────────────────────── */}
              {activeTab === 'nutrition' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold font-sans text-secondary-850">Valeurs nutritionnelles</h3>
                  {product.nutrition ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Calories', value: `${product.nutrition.calories}` },
                        { label: 'Protéines', value: `${product.nutrition.proteins}g` },
                        { label: 'Glucides', value: `${product.nutrition.carbs}g` },
                        { label: 'Lipides', value: `${product.nutrition.fats}g` },
                        { label: 'Fibres', value: `${product.nutrition.fiber}g` },
                      ].map((n) => (
                        <div key={n.label} className="bg-white rounded-xl p-4 border-2 border-secondary/10">
                          <div className="text-2xl font-bold text-secondary">{n.value}</div>
                          <div className="text-secondary-850/70 font-sans">{n.label}</div>
                          <div className="text-xs text-secondary-850/50">par portion</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-850/60 font-sans">Informations non disponibles</p>
                  )}
                </div>
              )}

              {/* ── Allergènes ──────────────────────────────── */}
              {activeTab === 'allergenes' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-sans text-secondary-850">Allergènes & restrictions</h3>
                  {product.allergens.length > 0 ? (
                    <ul className="space-y-2">
                      {product.allergens.map((a, i) => (
                        <li key={i} className="flex items-center gap-2 text-secondary-850/80 font-sans">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary-850/60 font-sans">Aucun allergène déclaré</p>
                  )}
                </div>
              )}

              {/* ── Avis ────────────────────────────────────── */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-sans text-secondary-850">Avis clients</h3>
                    {reviewStats && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(reviewStats.averageRating)
                                  ? 'text-primary-400 fill-primary-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-secondary-850 font-sans font-medium">
                          {reviewStats.averageRating.toFixed(1)}/5
                        </span>
                        <span className="text-secondary-850/60 font-sans">
                          ({reviewStats.totalReviews} avis)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Formulaire si authentifié */}
                  {isAuthenticated && (
                    reviewSubmitted ? (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-green-800 font-sans text-sm">Avis envoyé avec succès !</p>
                          <p className="text-green-700 font-sans text-sm mt-0.5">Il sera visible après validation par notre équipe.</p>
                          <button
                            onClick={() => setReviewSubmitted(false)}
                            className="text-xs text-green-600 underline font-sans mt-1"
                          >
                            Laisser un autre avis
                          </button>
                        </div>
                      </div>
                    ) : (
                    <form onSubmit={handleSubmitReview} className="bg-white/50 rounded-xl p-4 border-2 border-secondary/10 space-y-3">
                      <h4 className="font-semibold text-secondary-850 font-sans">Laisser un avis</h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <input
                        className="w-full border-2 border-secondary/20 rounded-xl px-3 py-2 bg-white/50 font-sans text-sm text-secondary-850 placeholder:text-secondary-850/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
                        placeholder="Titre (optionnel)"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                      />
                      <textarea
                        className="w-full border-2 border-secondary/20 rounded-xl px-3 py-2 bg-white/50 font-sans text-sm text-secondary-850 placeholder:text-secondary-850/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
                        rows={3}
                        placeholder="Votre commentaire… (10 caractères minimum)"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      />
                      {createReview.isError && (
                        <p className="text-red-500 text-xs font-sans">{(createReview.error as Error)?.message || "Une erreur est survenue"}</p>
                      )}
                      <Button
                        type="submit"
                        disabled={createReview.isPending || reviewForm.comment.trim().length < 10}
                        className="bg-secondary text-white hover:bg-secondary/90"
                      >
                        {createReview.isPending ? 'Envoi…' : 'Publier'}
                      </Button>
                      {reviewForm.comment.trim().length > 0 && reviewForm.comment.trim().length < 10 && (
                        <p className="text-orange-500 text-xs font-sans">Commentaire trop court ({reviewForm.comment.trim().length}/10 caractères minimum)</p>
                      )}
                    </form>
                    )
                  )}

                  {/* Liste d'avis */}
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-xl p-4 border-2 border-secondary/10">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-secondary-850 font-sans">
                                {review.user.name ?? 'Anonyme'}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating
                                        ? 'text-primary-400 fill-primary-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-secondary-850/60 font-sans">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {review.title && (
                            <p className="font-semibold text-secondary-850 font-sans text-sm mb-1">
                              {review.title}
                            </p>
                          )}
                          <p className="text-secondary-850/80 font-sans">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-850/60 font-sans text-center py-6">
                      Aucun avis pour l'instant. Soyez le premier !
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductDetailPage
