import { useState, useRef } from "react";
import { useMenuSections } from "@/hooks/useMenuSections";
import { useMenuItems, MenuItem } from "@/hooks/useMenuItems";
import { useImageUpload } from "@/hooks/useImageUpload";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  UtensilsCrossed,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";

interface ItemFormData {
  section_id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  is_available: boolean;
}

const initialFormData: ItemFormData = {
  section_id: "",
  name: "",
  description: "",
  price: "",
  image_url: "",
  is_available: true,
};

export default function MenuItemsPage() {
  const { sections } = useMenuSections();
  const { items, isLoading, createItem, updateItem, deleteItem, toggleAvailability, reorderItems } = useMenuItems();
  const { uploadImage, uploading, progress } = useImageUpload();
  
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = selectedSection === "all" 
    ? items 
    : items.filter((item) => item.section_id === selectedSection);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const url = await uploadImage(file);
    if (url) {
      setFormData({ ...formData, image_url: url });
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, image_url: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    await createItem.mutateAsync({
      section_id: formData.section_id,
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price) || 0,
      image_url: formData.image_url || undefined,
      is_available: formData.is_available,
    });
    setFormData(initialFormData);
    setImagePreview(null);
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    await updateItem.mutateAsync({
      id: editingItem.id,
      section_id: formData.section_id,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price) || 0,
      image_url: formData.image_url || null,
      is_available: formData.is_available,
    });
    setEditingItem(null);
    setFormData(initialFormData);
    setImagePreview(null);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      section_id: item.section_id,
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
    setImagePreview(item.image_url || null);
  };

  const openCreateDialog = () => {
    setFormData({
      ...initialFormData,
      section_id: selectedSection !== "all" ? selectedSection : sections[0]?.id || "",
    });
    setIsCreateOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const sectionItems = filteredItems;
    const draggedIndex = sectionItems.findIndex((i) => i.id === draggedItem);
    const targetIndex = sectionItems.findIndex((i) => i.id === targetId);
    
    const newOrder = [...sectionItems];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    reorderItems.mutate(newOrder.map((i) => i.id));
    setDraggedItem(null);
  };

  const getSectionName = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.name || "Unknown";
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section</Label>
        <Select
          value={formData.section_id}
          onValueChange={(value) => setFormData({ ...formData, section_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-name">Item Name</Label>
        <Input
          id="item-name"
          placeholder="e.g., Margherita Pizza"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-description">Description (optional)</Label>
        <Textarea
          id="item-description"
          placeholder="Brief description of this item"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-price">Price</Label>
        <Input
          id="item-price"
          type="number"
          step="0.01"
          min="0"
          placeholder="9.99"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Image (optional)</Label>
        <div className="space-y-3">
          {(imagePreview || formData.image_url) ? (
            <div className="relative">
              <img
                src={imagePreview || formData.image_url}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload image</p>
              <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
            </div>
          )}
          {uploading && (
            <Progress value={progress} className="h-2" />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="item-available">Available</Label>
        <Switch
          id="item-available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Menu Items</h1>
            <p className="text-muted-foreground">Manage your menu items</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} disabled={sections.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                  <DialogDescription>Add a new item to your menu</DialogDescription>
                </DialogHeader>
                {renderForm()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate} 
                    disabled={!formData.name.trim() || !formData.section_id || uploading || createItem.isPending}
                  >
                    {createItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {sections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sections available</h3>
              <p className="text-muted-foreground text-center">
                Create a menu section first before adding items
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first menu item to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`cursor-move transition-opacity ${draggedItem === item.id ? "opacity-50" : ""}`}
              >
                {item.image_url && (
                  <div className="relative h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getSectionName(item.section_id)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={item.is_available ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {item.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-lg">
                      ${Number(item.price).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(checked) => 
                          toggleAvailability.mutate({ id: item.id, is_available: checked })
                        }
                        className="mr-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{item.name}".
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteItem.mutate(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>Update item details</DialogDescription>
            </DialogHeader>
            {renderForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={!formData.name.trim() || !formData.section_id || uploading || updateItem.isPending}
              >
                {updateItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
