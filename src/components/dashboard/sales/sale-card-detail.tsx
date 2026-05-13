"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format-price";
import { detailPrice } from "@/lib/price";
import { cn } from "@/lib/utils";
import { useAuthForm } from "@/stores/auth.store";
import { AvaliableProduct, CreateSaleData, CreateSaleDetailData, InventoryType, UserRole } from "@/types";
import { Layers, Trash2, Lock } from "lucide-react";
import { useState } from "react";

interface SaleCardDetailProps {
  availableProducts: AvaliableProduct[];
  sale: Omit<CreateSaleData, "id">
  enableIva: boolean
  updateSaleDetail: (index: number, updates: Partial<CreateSaleDetailData>) => void
  removeSaleDetail: (index: number) => void
}

const SaleCardDetail = ({ availableProducts, sale, enableIva, updateSaleDetail, removeSaleDetail }: SaleCardDetailProps) => {

  const [saleType, setSaleType] = useState<"SALE" | "INTERNAL">("SALE");

  const { user } = useAuthForm();

  const authorizeUser = user ? user.role === UserRole.ADMIN || user.role === UserRole.SUPER || user.role === UserRole.AUXILIAR : false;

  const getQuantity = (detail: CreateSaleDetailData, availableProduct: AvaliableProduct) => {
    return detail.inventaryType === InventoryType.INTERNAL
      ? availableProduct.inventoryItems.reduce((total, inventoryItem) =>
        inventoryItem.inventaryType === InventoryType.INTERNAL
          ? total + (inventoryItem.isInputProduct ? inventoryItem.availableMeasureUnitValue : inventoryItem.availableQuantity)
          : total, 0)
      : availableProduct.inventoryItems.reduce((total, inventoryItem) =>
        inventoryItem.inventaryType === InventoryType.SALE
          ? total + (inventoryItem.isInputProduct ? inventoryItem.availableMeasureUnitValue : inventoryItem.availableQuantity)
          : total, 0);
  };

  const handleQuantityChange = (value: number | '', detail: CreateSaleDetailData, index: number, availableProduct: AvaliableProduct) => {
    if (availableProduct.product.inputProduct) {
      const newValue = value === '' ? 0 : value;
      if (newValue >= 0 && newValue <= getQuantity(detail, availableProduct)) {
        updateSaleDetail(index, { measureUnitValue: newValue });
      }
    } else {
      const newValue = value === '' ? 0 : value;
      if (newValue >= 0 && newValue <= getQuantity(detail, availableProduct)) {
        updateSaleDetail(index, { quantity: newValue });
      }
    }
  };

  const getInventoryType = (product: AvaliableProduct): "SALE" | "INTERNAL" | "ALL" => {
    //Identificar si pertenece a un unico tipo de inventario o si pertenece a ambos (SALE y INTERNAL)
    const saleInventory = product.inventoryItems.find((inventoryItem) => inventoryItem.inventaryType === InventoryType.SALE);
    const internalInventory = product.inventoryItems.find((inventoryItem) => inventoryItem.inventaryType === InventoryType.INTERNAL);

    if (saleInventory && internalInventory) {
      return "ALL"
    } else if (saleInventory) {
      return "SALE"
    } else {
      return "INTERNAL"
    }
  }

  return (
    <div className="divide-y">
      {
        sale && sale.details.map((detail, index) => {
          const avaliableProduct = availableProducts.find((product) => product.product.id === detail.productId);
          if (!avaliableProduct) return null;
          return (
            <div key={index} className="p-4">
              <div className="flex justify-between gap-4">
                <div className="flex flex-col">
                  <span className="font-medium line-clamp-1">{avaliableProduct?.product.name}</span>
                  <span className="text-sm text-muted-foreground">{avaliableProduct?.product.refCode}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold">{getQuantity(detail, avaliableProduct)}</span>
                  <span className="uppercase text-xs text-muted-foreground">{avaliableProduct?.product.inputProduct ? avaliableProduct?.product.inputProduct?.measureUnit : "UND"}</span>
                </div>
              </div>

              {
                avaliableProduct?.product.inputProduct ? (
                  <div className="mt-2 flex gap-4 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{avaliableProduct?.product.inputProduct?.measureUnit || ""}</span>
                      <Input
                        type="number"
                        placeholder="0,00"
                        className="w-full pl-12"
                        value={detail.measureUnitValue === 0 ? 0 : detail.measureUnitValue}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                          if (value === '' || (!isNaN(value) && value >= 0)) {
                            handleQuantityChange(value, detail, index, avaliableProduct);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            updateSaleDetail(index, { measureUnitValue: 0 });
                          } else if (parseFloat(e.target.value) <= 0) {
                            updateSaleDetail(index, { measureUnitValue: 0 });
                          }
                        }}
                        disabled={!avaliableProduct?.product.inputProduct}
                      />
                    </div>
                    <span className="font-bold">{formatPrice({ price: detailPrice(avaliableProduct.product, detail, detail.isRetailPrice), country: { currency: "USD", locale: "en-US" } })}</span>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-4 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">UND</span>
                      <Input
                        type="number"
                        placeholder="0,00"
                        className="w-full pl-12"
                        value={detail.quantity || ''}
                        disabled={!!avaliableProduct.product.inputProduct}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                          if (value === '' || (!isNaN(value) && value >= 0)) {
                            handleQuantityChange(value, detail, index, avaliableProduct);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            updateSaleDetail(index, { quantity: 0 });
                          } else if (parseInt(e.target.value, 10) <= 0) {
                            updateSaleDetail(index, { quantity: 0 });
                          }
                        }}
                      />
                    </div>
                    <span className="font-bold"><span className="font-bold">{formatPrice({ price: detailPrice(avaliableProduct.product, detail, detail.isRetailPrice), country: { currency: "USD", locale: "en-US" } })}</span></span>
                  </div>
                )
              }


              <div className="mt-4 flex gap-2 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    className="active:scale-95 transition-all"
                    onClick={() => updateSaleDetail(index, { isRetailPrice: !detail.isRetailPrice })}
                  >
                    <Layers className={cn("", detail.isRetailPrice ? "text-muted-foreground" : "text-green-500")} />
                    <span className="font-bold">{detail.isRetailPrice ? formatPrice({ price: detail.retailPrice, country: { currency: "USD", locale: "en-US" } }) : formatPrice({ price: detail.wholesalePrice, country: { currency: "USD", locale: "en-US" } })}</span>
                  </Button>
                  {
                    authorizeUser && (
                      <Button
                        disabled={getInventoryType(avaliableProduct) !== "ALL"}
                        className={cn("active:scale-95 transition-all",
                          getInventoryType(avaliableProduct) === "ALL" ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                          detail.inventaryType === InventoryType.INTERNAL ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 border border-blue-500/30" : "bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30"
                        )}
                        onClick={() => {
                          if (getInventoryType(avaliableProduct) === "ALL") {
                            updateSaleDetail(index, { 
                              inventaryType: detail.inventaryType === InventoryType.INTERNAL ? InventoryType.SALE : InventoryType.INTERNAL,
                              measureUnitValue: 0,
                              quantity: 1
                            });
                          }
                        }}
                      >
                        {
                          detail.inventaryType === InventoryType.INTERNAL ? "Interno" : "Venta"
                        }
                        {
                          getInventoryType(avaliableProduct) !== "ALL" && (
                            <Lock className="ml-1 h-3 w-3" />
                          )
                        }
                      </Button>
                    )
                  }
                </div>
                <Button
                  size="icon"
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 active:scale-95 transition-all"
                  onClick={() => removeSaleDetail(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          )
        })
      }
    </div>
  );
};

export default SaleCardDetail;
