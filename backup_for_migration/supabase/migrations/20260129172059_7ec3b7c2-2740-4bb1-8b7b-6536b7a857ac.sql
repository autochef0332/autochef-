-- Create restaurants table
CREATE TABLE public.restaurants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    unique_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_sections table
CREATE TABLE public.menu_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_menu_sections_restaurant ON public.menu_sections(restaurant_id);
CREATE INDEX idx_menu_sections_owner ON public.menu_sections(owner_id);
CREATE INDEX idx_menu_items_section ON public.menu_items(section_id);
CREATE INDEX idx_menu_items_owner ON public.menu_items(owner_id);
CREATE INDEX idx_restaurants_owner ON public.restaurants(owner_id);

-- Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Users can view their own restaurant"
ON public.restaurants FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own restaurant"
ON public.restaurants FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own restaurant"
ON public.restaurants FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own restaurant"
ON public.restaurants FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for menu_sections
CREATE POLICY "Users can view their own sections"
ON public.menu_sections FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own sections"
ON public.menu_sections FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own sections"
ON public.menu_sections FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own sections"
ON public.menu_sections FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for menu_items
CREATE POLICY "Users can view their own items"
ON public.menu_items FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own items"
ON public.menu_items FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own items"
ON public.menu_items FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own items"
ON public.menu_items FOR DELETE
USING (auth.uid() = owner_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_sections_updated_at
BEFORE UPDATE ON public.menu_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

-- Storage policies for menu-images bucket
CREATE POLICY "Users can upload their own menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Menu images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');