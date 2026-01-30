import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  unique_key: string;
  created_at: string;
  updated_at: string;
}

export function useRestaurant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ["restaurant", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Restaurant | null;
    },
    enabled: !!user?.id,
  });

  const createRestaurant = useMutation({
    mutationFn: async (data: {
      name: string;
      phone?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data: restaurant, error } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name: data.name,
          phone: data.phone || null,
          address: data.address || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        })
        .select()
        .single();
      if (error) throw error;
      return restaurant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success("Restaurant created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create restaurant: " + error.message);
    },
  });

  const updateRestaurant = useMutation({
    mutationFn: async (data: Partial<Restaurant>) => {
      if (!restaurant?.id) throw new Error("No restaurant found");
      const { data: updated, error } = await supabase
        .from("restaurants")
        .update(data)
        .eq("id", restaurant.id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success("Restaurant updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update restaurant: " + error.message);
    },
  });

  const resetSecretKey = useMutation({
    mutationFn: async () => {
      if (!restaurant?.id) throw new Error("No restaurant found");
      const newKey = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const { data: updated, error } = await supabase
        .from("restaurants")
        .update({ unique_key: newKey.substring(0, 32) })
        .eq("id", restaurant.id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success("Secret key reset successfully!");
    },
    onError: (error) => {
      toast.error("Failed to reset secret key: " + error.message);
    },
  });

  return {
    restaurant,
    isLoading,
    error,
    createRestaurant,
    updateRestaurant,
    resetSecretKey,
    hasRestaurant: !!restaurant,
  };
}
