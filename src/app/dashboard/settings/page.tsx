"use client";

import { useState, useEffect } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SecretKeyCard } from "@/components/dashboard/SecretKeyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Phone, MapPin, Navigation, Loader2, Save } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SettingsPage() {
    const { restaurant, isLoading, updateRestaurant, resetSecretKey } = useRestaurant();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
    });

    useEffect(() => {
        if (restaurant) {
            setFormData({
                name: restaurant.name,
                phone: restaurant.phone || "",
                address: restaurant.address || "",
                latitude: restaurant.latitude?.toString() || "",
                longitude: restaurant.longitude?.toString() || "",
            });
        }
    }, [restaurant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateRestaurant.mutateAsync({
            name: formData.name,
            phone: formData.phone || null,
            address: formData.address || null,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        });
    };

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
                <div className="space-y-6 max-w-2xl">
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">Manage your restaurant settings</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Restaurant Information</CardTitle>
                            <CardDescription>Update your restaurant details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Restaurant Name</Label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            className="pl-10"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="address"
                                            className="pl-10 min-h-[80px]"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <div className="relative">
                                            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="any"
                                                className="pl-10"
                                                value={formData.latitude}
                                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <div className="relative">
                                            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="any"
                                                className="pl-10"
                                                value={formData.longitude}
                                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!formData.name.trim() || updateRestaurant.isPending}
                                >
                                    {updateRestaurant.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

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
