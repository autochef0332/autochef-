import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  section_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useMenuItems(sectionId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["menu-items", sectionId],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from("menu_items")
        .select("*")
        .eq("owner_id", user.id)
        .order("position", { ascending: true });
      
      if (sectionId) {
        query = query.eq("section_id", sectionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!user?.id,
  });

  const createItem = useMutation({
    mutationFn: async (data: {
      section_id: string;
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      is_available?: boolean;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const existingItems = items.filter(i => i.section_id === data.section_id);
      const maxPosition = existingItems.length > 0 ? Math.max(...existingItems.map(i => i.position)) + 1 : 0;
      const { data: item, error } = await supabase
        .from("menu_items")
        .insert({
          owner_id: user.id,
          section_id: data.section_id,
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          is_available: data.is_available ?? true,
          position: maxPosition,
        })
        .select()
        .single();
      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Item created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create item: " + error.message);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...data }: Partial<MenuItem> & { id: string }) => {
      const { data: item, error } = await supabase
        .from("menu_items")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Item updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update item: " + error.message);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Item deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete item: " + error.message);
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { data: item, error } = await supabase
        .from("menu_items")
        .update({ is_available })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: (error) => {
      toast.error("Failed to toggle availability: " + error.message);
    },
  });

  const reorderItems = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("menu_items")
          .update({ position: index })
          .eq("id", id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: (error) => {
      toast.error("Failed to reorder items: " + error.message);
    },
  });

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    reorderItems,
  };
}
