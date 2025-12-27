import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

// Product identifiers - must match App Store Connect
export const IAP_PRODUCTS = {
  PREMIUM_MONTHLY: "blossom_premium_monthly",
  PREMIUM_YEARLY: "blossom_premium_yearly",
  SUPER_LIKES_PACK: "blossom_super_likes_5",
} as const;

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

interface Purchase {
  productId: string;
  transactionId: string;
  purchaseDate: string;
}

interface UseNativePurchasesResult {
  isNative: boolean;
  products: Product[];
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  hasActivePremium: boolean;
}

// This hook provides a unified interface for native in-app purchases
// It uses cordova-plugin-purchase when running on iOS/Android
export const useNativePurchases = (): UseNativePurchasesResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActivePremium, setHasActivePremium] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  // Initialize the store when on native platform
  useEffect(() => {
    if (!isNative) return;

    const initializeStore = async () => {
      try {
        // Check if CdvPurchase is available (from cordova-plugin-purchase)
        const CdvPurchase = (window as any).CdvPurchase;
        if (!CdvPurchase) {
          return;
        }

        const { store, ProductType, Platform } = CdvPurchase;

        // Register products
        store.register([
          {
            id: IAP_PRODUCTS.PREMIUM_MONTHLY,
            type: ProductType.PAID_SUBSCRIPTION,
            platform: Platform.APPLE_APPSTORE,
          },
          {
            id: IAP_PRODUCTS.PREMIUM_YEARLY,
            type: ProductType.PAID_SUBSCRIPTION,
            platform: Platform.APPLE_APPSTORE,
          },
          {
            id: IAP_PRODUCTS.SUPER_LIKES_PACK,
            type: ProductType.CONSUMABLE,
            platform: Platform.APPLE_APPSTORE,
          },
        ]);

        // Handle approved purchases
        store
          .when()
          .approved((transaction: any) => {
            transaction.verify();
          })
          .verified((receipt: any) => {
            receipt.finish();
            checkPremiumStatus();
          })
          .finished((_transaction: any) => {
            // Purchase flow completed
          });

        // Initialize the store
        await store.initialize([Platform.APPLE_APPSTORE]);
        await store.update();

        // Load products
        await loadProducts();
      } catch (err) {
        console.error("Error initializing store:", err);
        setError("Failed to initialize store");
      }
    };

    initializeStore();
  }, [isNative]);

  const loadProducts = useCallback(async () => {
    if (!isNative) return;

    setLoading(true);
    setError(null);

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) {
        setLoading(false);
        return;
      }

      const { store } = CdvPurchase;
      const loadedProducts: Product[] = [];

      Object.values(IAP_PRODUCTS).forEach((productId) => {
        const product = store.get(productId);
        if (product) {
          loadedProducts.push({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.pricing?.price || "N/A",
            priceAmount: product.pricing?.priceMicros
              ? product.pricing.priceMicros / 1000000
              : 0,
            currency: product.pricing?.currency || "USD",
          });
        }
      });

      setProducts(loadedProducts);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  const purchaseProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!isNative) {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const CdvPurchase = (window as any).CdvPurchase;
        if (!CdvPurchase) {
          throw new Error("Store not available");
        }

        const { store } = CdvPurchase;
        const product = store.get(productId);

        if (!product) {
          throw new Error("Product not found");
        }

        const offer = product.getOffer();
        if (!offer) {
          throw new Error("No offer available for product");
        }

        await offer.order();
        return true;
      } catch (err: any) {
        console.error("Error purchasing product:", err);
        setError(err.message || "Failed to complete purchase");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isNative],
  );

  const restorePurchases = useCallback(async () => {
    if (!isNative) return;

    setLoading(true);
    setError(null);

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) {
        throw new Error("Store not available");
      }

      const { store } = CdvPurchase;
      await store.restorePurchases();
      await checkPremiumStatus();
    } catch (err: any) {
      console.error("Error restoring purchases:", err);
      setError(err.message || "Failed to restore purchases");
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  const checkPremiumStatus = useCallback(async () => {
    if (!isNative) return;

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase) return;

      const { store } = CdvPurchase;

      // Check if user has active premium subscription
      const premiumMonthly = store.get(IAP_PRODUCTS.PREMIUM_MONTHLY);
      const premiumYearly = store.get(IAP_PRODUCTS.PREMIUM_YEARLY);

      const hasMonthly = premiumMonthly?.owned === true;
      const hasYearly = premiumYearly?.owned === true;

      setHasActivePremium(hasMonthly || hasYearly);
    } catch (err) {
      console.error("Error checking premium status:", err);
    }
  }, [isNative]);

  return {
    isNative,
    products,
    purchases,
    loading,
    error,
    loadProducts,
    purchaseProduct,
    restorePurchases,
    hasActivePremium,
  };
};
