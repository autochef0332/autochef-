import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "./useRestaurant";
import { toast } from "sonner";

export interface MenuSection {
  id: string;
  restaurant_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useMenuSections() {
  const { user } = useAuth();
  const { restaurant } = useRestaurant();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading, error } = useQuery({
    queryKey: ["menu-sections", restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const { data, error } = await supabase
        .from("menu_sections")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data as MenuSection[];
    },
    enabled: !!restaurant?.id,
  });

  const createSection = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      if (!user?.id || !restaurant?.id) throw new Error("Not authenticated or no restaurant");
      const maxPosition = sections.length > 0 ? Math.max(...sections.map(s => s.position)) + 1 : 0;
      const { data: section, error } = await supabase
        .from("menu_sections")
        .insert({
          owner_id: user.id,
          restaurant_id: restaurant.id,
          name: data.name,
          description: data.description || null,
          position: maxPosition,
        })
        .select()
        .single();
      if (error) throw error;
      return section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
      toast.success("Section created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create section: " + error.message);
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, ...data }: Partial<MenuSection> & { id: string }) => {
      const { data: section, error } = await supabase
        .from("menu_sections")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
      toast.success("Section updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update section: " + error.message);
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_sections")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Section deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete section: " + error.message);
    },
  });

  const reorderSections = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("menu_sections")
          .update({ position: index })
          .eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-sections"] });
    },
    onError: (error) => {
      toast.error("Failed to reorder sections: " + error.message);
    },
  });

  return {
    sections,
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  };
}
