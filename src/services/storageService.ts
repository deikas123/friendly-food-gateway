
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return null;
    }
    
    // Generate a unique file name with original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;
    
    console.log("Uploading to storage bucket with path:", filePath);
    
    // First, check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError);
      toast.error("Storage system error");
      return null;
    }
    
    // Check if 'products' bucket exists, create if not
    const productsBucketExists = buckets.some(bucket => bucket.name === 'products');
    if (!productsBucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket('products', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError);
        toast.error("Failed to create storage bucket");
        return null;
      }
      console.log("Created new 'products' bucket");
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
    
    console.log("Upload successful:", data?.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    console.log("Generated public URL:", publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error("Error in image upload:", error);
    toast.error("An error occurred while uploading the image");
    return null;
  }
};

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadProductImage(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucket = pathParts[1]; // Should be 'products'
    const filePath = pathParts.slice(2).join('/');
    
    if (bucket !== 'products') {
      console.warn("Not a product image URL:", imageUrl);
      return false;
    }
    
    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in image deletion:", error);
    return false;
  }
};
