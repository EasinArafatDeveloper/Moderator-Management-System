"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { createOrder } from "@/actions/order-actions";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const orderSchema = z.object({
  customerName: z.string().min(2, "Customer Name must be at least 2 characters."),
  customerPhone: z.string().min(10, "Customer Phone must be at least 10 digits."),
  alternativePhone: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters."),
  productName: z.string().min(2, "Product Name must be at least 2 characters."),
  category: z.string().min(2, "Please enter a product category."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unitPrice: z.coerce.number().min(0, "Unit Price must be at least 0."),
  deliveryCharge: z.coerce.number().min(0, "Delivery Charge must be at least 0."),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      customerName: "",
      customerPhone: "",
      alternativePhone: "",
      address: "",
      productName: "",
      category: "",
      quantity: 1,
      unitPrice: 0,
      deliveryCharge: 60, // Standard delivery charge default
      notes: "",
    },
  });

  // Watch inputs for live calculation
  const watchQuantity = watch("quantity");
  const watchUnitPrice = watch("unitPrice");
  const watchDeliveryCharge = watch("deliveryCharge");

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const qty = Number(watchQuantity) || 0;
    const price = Number(watchUnitPrice) || 0;
    const charge = Number(watchDeliveryCharge) || 0;
    setTotalAmount(qty * price + charge);
  }, [watchQuantity, watchUnitPrice, watchDeliveryCharge]);

  const onSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await createOrder(values);
      if (res.success) {
        toast("Order submitted successfully!", "success", "Order Created");
        reset();
        if (onSuccess) onSuccess();
      } else {
        toast(res.error || "Failed to create order.", "error", "Submission Error");
      }
    } catch (err) {
      toast("Something went wrong.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productCategories = [
    "Electronics",
    "Mobile Phones",
    "Laptops & Computers",
    "Clothing & Fashion",
    "Home & Living",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Groceries & Food",
    "Others",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
      {/* Customer Info Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Customer Name *</label>
            <input
              type="text"
              {...register("customerName")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              placeholder="e.g. Shakil Ahmed"
            />
            {errors.customerName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.customerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Phone Number *</label>
            <input
              type="text"
              {...register("customerPhone")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              placeholder="e.g. 01712345678"
            />
            {errors.customerPhone && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.customerPhone.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Alternative Phone (Optional)</label>
            <input
              type="text"
              {...register("alternativePhone")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              placeholder="e.g. 01812345678"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Full Delivery Address *</label>
            <input
              type="text"
              {...register("address")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              placeholder="e.g. House 45, Road 12, Banani, Dhaka"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Product Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Product Name *</label>
            <input
              type="text"
              {...register("productName")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              placeholder="e.g. Bluetooth Headphones"
            />
            {errors.productName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.productName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Product Category *</label>
            <select
              {...register("category")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
            >
              <option value="">Select Category</option>
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Quantity *</label>
            <input
              type="number"
              {...register("quantity")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              min="1"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Unit Price (BDT) *</label>
            <input
              type="number"
              {...register("unitPrice")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              min="0"
              step="any"
            />
            {errors.unitPrice && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.unitPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Delivery Charge (BDT) *</label>
            <input
              type="number"
              {...register("deliveryCharge")}
              className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              min="0"
              step="any"
            />
            {errors.deliveryCharge && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.deliveryCharge.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes & Calculations */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Additional Notes (Optional)</label>
          <textarea
            {...register("notes")}
            className="w-full px-4 py-2.5 bg-secondary/20 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 h-20 resize-none"
            placeholder="e.g. Call before delivery, red color preference, etc."
          />
        </div>

        {/* Live Calculation Panel */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs font-bold text-foreground">Total Bill Amount</p>
              <p className="text-[10px] text-muted-foreground font-semibold">
                ({watchQuantity || 0} × {watchUnitPrice || 0}) + {watchDeliveryCharge || 0} Delivery
              </p>
            </div>
          </div>
          <span className="text-lg font-black text-primary">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Order...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Submit Order (+1 Point)</span>
          </>
        )}
      </button>
    </form>
  );
}
