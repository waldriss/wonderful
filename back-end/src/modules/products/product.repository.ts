import { Prisma, ProductCategory, ProductStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductsQueryDto,
} from './product.dto';

/**
 * Repository pour les opérations de base de données produits
 */
export class ProductRepository {
  /**
   * Include standard pour les produits
   */
  private readonly productInclude = {
    nutrition: true,
    allergens: true,
    dietTypes: true,
    mealTypes: true,
    dietaryGoals: true,
    supplements: { include: { supplement: true } },
  };

  /**
   * Récupérer un produit par ID
   */
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        ...this.productInclude,
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer un produit par nom
   */
  async findByName(name: string) {
    return prisma.product.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }

  /**
   * Créer un produit
   */
  async create(data: CreateProductDto) {
    const {
      nutrition,
      allergens,
      dietTypes,
      mealTypes,
      dietaryGoals,
      supplements,
      image,
      images,
      ...productData
    } = data;

    return prisma.product.create({
      data: {
        ...productData,
        image: image ?? '',
        images: images ?? [],
        nutrition: nutrition
          ? { create: nutrition }
          : undefined,
        allergens: allergens?.length
          ? { createMany: { data: allergens.map((name) => ({ name })) } }
          : undefined,
        dietTypes: dietTypes?.length
          ? { createMany: { data: dietTypes.map((name) => ({ name })) } }
          : undefined,
        mealTypes: mealTypes?.length
          ? { createMany: { data: mealTypes.map((name) => ({ name })) } }
          : undefined,
        dietaryGoals: dietaryGoals?.length
          ? { createMany: { data: dietaryGoals.map((name) => ({ name })) } }
          : undefined,
        supplements: supplements?.length
          ? { createMany: { data: supplements.map((supplementId) => ({ supplementId })) } }
          : undefined,
      },
      include: this.productInclude,
    });
  }

  /**
   * Mettre à jour un produit
   */
  async update(id: string, data: UpdateProductDto) {
    const {
      nutrition,
      allergens,
      dietTypes,
      mealTypes,
      dietaryGoals,
      supplements,
      removeImages,
      images,
      ...productData
    } = data;

    // Transaction pour garantir la cohérence
    return prisma.$transaction(async (tx) => {
      // Build images update: append new ones, remove specified ones
      let imagesUpdate: string[] | undefined;
      if (images !== undefined || removeImages !== undefined) {
        const existing = await tx.product.findUnique({ where: { id }, select: { images: true } });
        let current = existing?.images ?? [];
        if (removeImages?.length) current = current.filter((u) => !removeImages.includes(u));
        if (images?.length) current = [...current, ...images];
        imagesUpdate = current;
      }

      // Mise à jour des données principales
      const product = await tx.product.update({
        where: { id },
        data: imagesUpdate !== undefined ? { ...productData, images: imagesUpdate } : productData,
      });

      // Mise à jour de la nutrition si fournie
      if (nutrition !== undefined) {
        await tx.productNutrition.upsert({
          where: { productId: id },
          create: { ...nutrition, productId: id },
          update: nutrition,
        });
      }

      // Mise à jour des allergènes si fournis
      if (allergens !== undefined) {
        await tx.productAllergen.deleteMany({ where: { productId: id } });
        if (allergens.length > 0) {
          await tx.productAllergen.createMany({
            data: allergens.map((name) => ({ name, productId: id })),
          });
        }
      }

      // Mise à jour des types de régime si fournis
      if (dietTypes !== undefined) {
        await tx.productDietType.deleteMany({ where: { productId: id } });
        if (dietTypes.length > 0) {
          await tx.productDietType.createMany({
            data: dietTypes.map((name) => ({ name, productId: id })),
          });
        }
      }

      // Mise à jour des types de repas si fournis
      if (mealTypes !== undefined) {
        await tx.productMealType.deleteMany({ where: { productId: id } });
        if (mealTypes.length > 0) {
          await tx.productMealType.createMany({
            data: mealTypes.map((name) => ({ name, productId: id })),
          });
        }
      }

      // Mise à jour des objectifs diététiques si fournis
      if (dietaryGoals !== undefined) {
        await tx.productDietaryGoal.deleteMany({ where: { productId: id } });
        if (dietaryGoals.length > 0) {
          await tx.productDietaryGoal.createMany({
            data: dietaryGoals.map((name) => ({ name, productId: id })),
          });
        }
      }

      // Mise à jour des suppléments associés si fournis
      if (supplements !== undefined) {
        await tx.productSupplement.deleteMany({ where: { productId: id } });
        if (supplements.length > 0) {
          await tx.productSupplement.createMany({
            data: supplements.map((supplementId) => ({ supplementId, productId: id })),
          });
        }
      }

      // Retourner le produit mis à jour avec toutes les relations
      return tx.product.findUnique({
        where: { id },
        include: this.productInclude,
      });
    });
  }

  /**
   * Supprimer un produit
   */
  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Mettre à jour le stock
   */
  async updateStock(
    id: string,
    stock: number,
    operation: 'set' | 'add' | 'subtract'
  ) {
    let updateData: Prisma.ProductUpdateInput;

    switch (operation) {
      case 'add':
        updateData = { stock: { increment: stock } };
        break;
      case 'subtract':
        updateData = { stock: { decrement: stock } };
        break;
      default:
        updateData = { stock };
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Mettre à jour le statut
   */
  async updateStatus(id: string, status: ProductStatus) {
    return prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Incrémenter le compteur de ventes
   */
  async incrementSales(id: string, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: { totalSold: { increment: quantity } },
    });
  }

  /**
   * Mettre à jour la note moyenne
   */
  async updateRating(id: string) {
    const result = await prisma.review.aggregate({
      where: { productId: id, status: 'APPROVED' },
      _avg: { rating: true },
    });

    return prisma.product.update({
      where: { id },
      data: { rating: result._avg.rating || 0 },
    });
  }

  /**
   * Liste des produits avec filtres avancés
   */
  async findMany(query: ListProductsQueryDto) {
    const {
      page,
      pageSize,
      category,
      search,
      status,
      minPrice,
      maxPrice,
      isOnSale,
      isNew,
      isBestSeller,
      minRating,
      minCalories,
      maxCalories,
      minProteins,
      maxProteins,
      minCarbs,
      maxCarbs,
      minFat,
      maxFat,
      minFiber,
      maxFiber,
      portionSize,
      mealType,
      dietaryGoals,
      specifications,
      allergies,
      sortBy,
    } = query;

    const skip = (page - 1) * pageSize;

    // Construction des filtres
    const where: Prisma.ProductWhereInput = {};

    // Filtre de statut par défaut (ACTIVE) pour les routes publiques
    where.status = status || ProductStatus.ACTIVE;

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    if (isOnSale !== undefined) where.isOnSale = isOnSale;
    if (isNew !== undefined) where.isNew = isNew;
    if (isBestSeller !== undefined) where.isBestSeller = isBestSeller;

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Filtres nutritionnels
    const nutritionFilter: Record<string, any> = {};
    if (minCalories !== undefined || maxCalories !== undefined) {
      nutritionFilter.calories = {
        ...(minCalories !== undefined && { gte: minCalories }),
        ...(maxCalories !== undefined && { lte: maxCalories }),
      };
    }
    if (minProteins !== undefined || maxProteins !== undefined) {
      nutritionFilter.proteins = {
        ...(minProteins !== undefined && { gte: minProteins }),
        ...(maxProteins !== undefined && { lte: maxProteins }),
      };
    }
    if (minCarbs !== undefined || maxCarbs !== undefined) {
      nutritionFilter.carbs = {
        ...(minCarbs !== undefined && { gte: minCarbs }),
        ...(maxCarbs !== undefined && { lte: maxCarbs }),
      };
    }
    if (minFat !== undefined || maxFat !== undefined) {
      nutritionFilter.fats = {
        ...(minFat !== undefined && { gte: minFat }),
        ...(maxFat !== undefined && { lte: maxFat }),
      };
    }
    if (minFiber !== undefined || maxFiber !== undefined) {
      nutritionFilter.fiber = {
        ...(minFiber !== undefined && { gte: minFiber }),
        ...(maxFiber !== undefined && { lte: maxFiber }),
      };
    }
    if (Object.keys(nutritionFilter).length > 0) {
      where.nutrition = nutritionFilter as any;
    }

    // Filtre par taille de portion
    if (portionSize) {
      const sizes = portionSize.split(',').map((s) => s.trim());
      where.portionSize = sizes.length === 1 ? sizes[0] : { in: sizes };
    }

    // Filtres par types de repas
    if (mealType) {
      const types = mealType.split(',').map((t) => t.trim());
      where.mealTypes = {
        some: { name: { in: types } },
      };
    }

    // Filtres par objectifs diététiques
    if (dietaryGoals) {
      const goals = dietaryGoals.split(',').map((g) => g.trim());
      where.dietaryGoals = {
        some: { name: { in: goals } },
      };
    }

    // Filtres par spécifications (types de régime)
    if (specifications) {
      const specs = specifications.split(',').map((s) => s.trim());
      where.dietTypes = {
        some: { name: { in: specs } },
      };
    }

    // Exclusion des allergènes
    if (allergies) {
      const allergenList = allergies.split(',').map((a) => a.trim());
      where.allergens = {
        none: { name: { in: allergenList } },
      };
    }

    // Construction du tri
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = { totalSold: 'desc' };
    }

    // Requêtes parallèles
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: this.productInclude,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * Récupérer les catégories avec comptage
   */
  async getCategories() {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { status: ProductStatus.ACTIVE },
      _count: true,
    });

    return categories.map((c) => ({
      value: c.category,
      label: this.getCategoryLabel(c.category),
      count: c._count,
    }));
  }

  /**
   * Récupérer les options de filtres disponibles
   */
  async getFilterOptions() {
    const [
      priceRange,
      caloriesRange,
      mealTypes,
      dietaryGoals,
      dietTypes,
      allergens,
    ] = await Promise.all([
      prisma.product.aggregate({
        where: { status: ProductStatus.ACTIVE },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.productNutrition.aggregate({
        _min: { calories: true },
        _max: { calories: true },
      }),
      prisma.productMealType.groupBy({
        by: ['name'],
        _count: true,
      }),
      prisma.productDietaryGoal.groupBy({
        by: ['name'],
        _count: true,
      }),
      prisma.productDietType.groupBy({
        by: ['name'],
        _count: true,
      }),
      prisma.productAllergen.groupBy({
        by: ['name'],
        _count: true,
      }),
    ]);

    return {
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 10000,
      },
      caloriesRange: {
        min: caloriesRange._min.calories || 0,
        max: caloriesRange._max.calories || 1000,
      },
      mealTypes: mealTypes.map((m) => ({ value: m.name, count: m._count })),
      dietaryGoals: dietaryGoals.map((d) => ({ value: d.name, count: d._count })),
      dietTypes: dietTypes.map((d) => ({ value: d.name, count: d._count })),
      allergens: allergens.map((a) => ({ value: a.name, count: a._count })),
    };
  }

  /**
   * Helper pour les labels de catégories
   */
  private getCategoryLabel(category: ProductCategory): string {
    const labels: Record<ProductCategory, string> = {
      PLATS: 'Plats',
      BOISSONS: 'Boissons',
      DESSERTS: 'Desserts',
      SNACKS: 'Snacks',
    };
    return labels[category];
  }

  /**
   * Liste des produits pour l'admin (tous les statuts)
   */
  async findManyAdmin(query: ListProductsQueryDto & { status?: ProductStatus }) {
    // Retirer le filtre de statut par défaut pour l'admin
    const adminQuery = { ...query };
    
    const { page, pageSize, sortBy } = adminQuery;
    const skip = (page - 1) * pageSize;

    // Construction des filtres (sans forcer le statut ACTIVE)
    const where: Prisma.ProductWhereInput = {};
    
    if (adminQuery.category) where.category = adminQuery.category;
    if (adminQuery.status) where.status = adminQuery.status;
    if (adminQuery.search) {
      where.OR = [
        { name: { contains: adminQuery.search, mode: 'insensitive' } },
        { description: { contains: adminQuery.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          ...this.productInclude,
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * Récupérer les produits suggérés pour un utilisateur
   * Basé sur les catégories des commandes passées, les préférences, ou best-sellers en fallback
   */
  async getSuggestions(userId: string, limit: number = 8) {
    // Récupérer les catégories achetées par l'utilisateur
    const purchasedItems = await prisma.orderItem.findMany({
      where: { order: { userId } },
      select: {
        productId: true,
        product: { select: { category: true } },
      },
    });

    const purchasedProductIds = [...new Set(purchasedItems.map((i) => i.productId))];
    const favoriteCategories = [...new Set(purchasedItems.map((i) => i.product.category))];

    let products: Awaited<ReturnType<typeof prisma.product.findMany>> | undefined;

    if (favoriteCategories.length > 0) {
      // Suggérer des produits des mêmes catégories, non encore achetés
      products = await prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          category: { in: favoriteCategories },
          id: { notIn: purchasedProductIds },
        },
        take: limit,
        orderBy: [{ rating: 'desc' }, { totalSold: 'desc' }],
        include: this.productInclude,
      });
    }

    // Fallback: best-sellers si pas assez de résultats
    if (!products || products.length < limit) {
      const existingIds = products ? products.map((p) => p.id) : [];
      const fallback = await prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          id: { notIn: [...purchasedProductIds, ...existingIds] },
        },
        take: limit - (products?.length || 0),
        orderBy: [{ totalSold: 'desc' }, { rating: 'desc' }],
        include: this.productInclude,
      });
      products = [...(products || []), ...fallback];
    }

    return products;
  }
}

export const productRepository = new ProductRepository();
