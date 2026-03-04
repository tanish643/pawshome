import { useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "@/components/map/LocationPicker";
import { toast } from "sonner";
import { uploadFile } from "@/utils/fileUpload";
import { ImagePlus } from "lucide-react";

export const ReportFoundPet = () => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [formData, setFormData] = useState({
    petSpecies: "", description: ""
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error("Please select a location on the map");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please log in");
      setLoading(false);
      return;
    }

    let imageUrl = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400";

    if (imageFile) {
      const result = await uploadFile(imageFile, "pet-images", user.uid);
      if (result) imageUrl = result.url;
    }

    // Removed health report upload logic

    await addDoc(collection(db, "found_pets"), {
      finder_id: user.uid,
      finder_email: user.email,
      finder_name: user.displayName || "Unknown",
      pet_species: formData.petSpecies,
      description: formData.description,
      found_location: location.address,
      found_location_lat: location.lat,
      found_location_lng: location.lng,
      image_url: imageUrl,
      health_report_url: null,
      status: "pending", // Moderation required
      is_approved: false,
      createdAt: serverTimestamp()
    });

    toast.success("Report submitted for approval!");
    setFormData({ petSpecies: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Found Pet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Species *</Label>
            <Input required value={formData.petSpecies} onChange={e => setFormData({ ...formData, petSpecies: e.target.value })} placeholder="Dog, Cat, etc." className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the pet you found..." rows={4} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
          </div>

          <div>
            <Label>Pet Image</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Click to upload image</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Health Certificate Section Removed Here */}

          <div>
            <Label>Found Location *</Label>
            <p className="text-sm text-muted-foreground mb-2">Click on the map to mark where you found the pet</p>
            <LocationPicker onLocationSelect={setLocation} />
            {location && (
              <p className="text-sm mt-2 text-muted-foreground">Selected: {location.address}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Report Found Pet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};