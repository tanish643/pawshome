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

export const ReportLostPet = () => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  // Removed healthReportFile state
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [formData, setFormData] = useState({
    petName: "", petBreed: "", petAge: "", petSpecies: "",
    description: "", rewardAmount: ""
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

    await addDoc(collection(db, "lost_pets"), {
      owner_id: user.uid,
      owner_email: user.email,
      owner_name: user.displayName || "Unknown",
      pet_name: formData.petName,
      pet_breed: formData.petBreed,
      pet_age: parseInt(formData.petAge) || null,
      pet_species: formData.petSpecies,
      description: formData.description,
      lost_location: location.address,
      lost_location_lat: location.lat,
      lost_location_lng: location.lng,
      reward_amount: formData.rewardAmount ? parseFloat(formData.rewardAmount) : null,
      image_url: imageUrl,
      health_report_url: null,
      status: "pending",
      is_approved: false,
      is_found: false,
      createdAt: serverTimestamp()
    });

    toast.success("Lost pet reported successfully! Pending approval.");
    setFormData({ petName: "", petBreed: "", petAge: "", petSpecies: "", description: "", rewardAmount: "" });
    setImageFile(null);
    setImagePreview("");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Lost Pet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Pet Name *</Label>
              <Input required value={formData.petName} onChange={e => setFormData({ ...formData, petName: e.target.value })} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
            </div>
            <div>
              <Label>Species *</Label>
              <Input required value={formData.petSpecies} onChange={e => setFormData({ ...formData, petSpecies: e.target.value })} placeholder="Dog, Cat, etc." className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
            </div>
            <div>
              <Label>Breed *</Label>
              <Input required value={formData.petBreed} onChange={e => setFormData({ ...formData, petBreed: e.target.value })} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" value={formData.petAge} onChange={e => setFormData({ ...formData, petAge: e.target.value })} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
            </div>
            <div>
              <Label>Reward Amount ($)</Label>
              <Input type="number" step="0.01" value={formData.rewardAmount} onChange={e => setFormData({ ...formData, rewardAmount: e.target.value })} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
            </div>
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your pet and when/where it was last seen" rows={4} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
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
            <Label>Last Seen Location *</Label>
            <p className="text-sm text-muted-foreground mb-2">Click on the map to mark where your pet was last seen</p>
            <LocationPicker onLocationSelect={setLocation} />
            {location && (
              <p className="text-sm mt-2 text-muted-foreground">Selected: {location.address}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Report Lost Pet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};