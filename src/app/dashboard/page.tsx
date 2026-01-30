"use client";

import { useRestaurant } from "@/hooks/useRestaurant";
import { useMenuSections } from "@/hooks/useMenuSections";
import { useMenuItems } from "@/hooks/useMenuItems";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SecretKeyCard } from "@/components/dashboard/SecretKeyCard";
import { Store, Layers, UtensilsCrossed, CheckCircle, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardPage() {
    const { restaurant, isLoading, resetSecretKey } = useRestaurant();
    const { sections } = useMenuSections();
    const { items } = useMenuItems();

    const availableItems = items.filter((item) => item.is_available).length;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
                        <p className="text-muted-foreground">Welcome to your restaurant dashboard</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Restaurant"
                            value={restaurant?.name || "—"}
                            icon={<Store className="h-5 w-5" />}
                            description="Your restaurant"
                        />
                        <StatCard
                            title="Total Sections"
                            value={sections.length}
                            icon={<Layers className="h-5 w-5" />}
                            description="Menu categories"
                        />
                        <StatCard
                            title="Total Items"
                            value={items.length}
                            icon={<UtensilsCrossed className="h-5 w-5" />}
                            description="Menu items"
                        />
                        <StatCard
                            title="Available Items"
                            value={availableItems}
                            icon={<CheckCircle className="h-5 w-5" />}
                            description={`${items.length > 0 ? Math.round((availableItems / items.length) * 100) : 0}% available`}
                        />
                    </div>

                    {restaurant?.unique_key && (
                        <SecretKeyCard
                            secretKey={restaurant.unique_key}
                            onReset={() => resetSecretKey.mutate()}
                            isResetting={resetSecretKey.isPending}
                        />
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
