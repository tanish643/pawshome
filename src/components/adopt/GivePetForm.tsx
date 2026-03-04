import { useState, useRef } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { uploadFile } from "@/utils/fileUpload";
import {
  ImagePlus,
  Upload,
  MapPin,
  User,
  PawPrint,
  Activity,
  FileText,
  X,
  Loader2,
  Utensils,
  Footprints
} from "lucide-react";

// --- Types ---
interface FormData {
  petName: string;
  petBreed: string;
  petAge: string;
  petSpecies: string;
  healthCondition: string;
  isVaccinated: boolean;
  dailyFood: string;
  walkingFrequency: string;
  petLocation: string;
  ownerName: string;
  ownerAge: string;
  ownerLocation: string;
  amount: string;
}

export const GivePetForm = () => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // File States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [vaccinationFile, setVaccinationFile] = useState<File | null>(null);
  const [healthReportFile, setHealthReportFile] = useState<File | null>(null);

  // Form Data State
  const [formData, setFormData] = useState<FormData>({
    petName: "", petBreed: "", petAge: "", petSpecies: "", healthCondition: "",
    isVaccinated: false, dailyFood: "", walkingFrequency: "", petLocation: "",
    ownerName: "", ownerAge: "", ownerLocation: "", amount: ""
  });

  // Helpers
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please log in to submit");
        return;
      }

      // 1. SKIP Upload Files (Local Dev Mode)
      setLoadingText("Saving pet details...");

      // Random Unsplash Image for realistic testing
      const randomId = Math.floor(Math.random() * 1000);
      const imageUrl = `https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&random=${randomId}`;
      const vaccinationUrl = null;
      const healthReportUrl = null;

      // NOTE: We are skipping actual file upload to avoid CORS/Storage issues during dev.
      // logic: const url = await uploadWithFallback(...) is removed.

      // 2. Insert Data
      setLoadingText("Saving pet details...");

      await addDoc(collection(db, "pets_for_adoption"), {
        owner_id: user.uid,
        owner_email: user.email,
        pet_name: formData.petName,
        pet_breed: formData.petBreed,
        pet_age: formData.petAge ? parseInt(formData.petAge) : null,
        pet_species: formData.petSpecies,
        health_condition: formData.healthCondition,
        is_vaccinated: !!vaccinationFile,
        vaccination_proof_url: vaccinationUrl,
        health_report_url: healthReportUrl,
        daily_food: formData.dailyFood,
        walking_frequency: formData.walkingFrequency,
        pet_location: formData.petLocation,
        owner_name: formData.ownerName,
        owner_age: formData.ownerAge ? parseInt(formData.ownerAge) : null,
        owner_location: formData.ownerLocation,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        main_image_url: imageUrl,
        status: "pending", // Pending admin approval
        is_approved: false, // Legacy field for compatibility if needed
        is_adopted: false,
        createdAt: serverTimestamp()
      });

      toast.success("Pet submitted for approval successfully!");

      // Reset Form
      setFormData({
        petName: "", petBreed: "", petAge: "", petSpecies: "", healthCondition: "",
        isVaccinated: false, dailyFood: "", walkingFrequency: "", petLocation: "",
        ownerName: "", ownerAge: "", ownerLocation: "", amount: ""
      });
      clearImage();
      setVaccinationFile(null);
      setHealthReportFile(null);

    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-muted/60">
      <CardHeader className="text-center border-b bg-muted/20 pb-8">
        <CardTitle className="text-2xl font-bold text-primary">Rehome a Pet</CardTitle>
        <CardDescription>
          Provide details about the pet to help them find a loving new home.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* --- Section 1: The Visual (Image Upload) --- */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Pet Preview"
                    className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Label className="cursor-pointer">
                  <div className="w-48 h-48 bg-muted/40 hover:bg-muted/60 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 transition-all duration-200 group-hover:border-primary/50">
                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                      <ImagePlus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Upload Photo</span>
                    <span className="text-xs text-muted-foreground/60 mt-1">Max 5MB</span>
                  </div>
                  <Input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </Label>
              )}
            </div>
          </div>

          {/* --- Section 2: Pet Details --- */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <PawPrint className="w-5 h-5 text-primary" /> Pet Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Pet Name *</Label>
                <Input placeholder="e.g. Bella" required value={formData.petName} onChange={e => handleInputChange('petName', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Species *</Label>
                  <Input placeholder="Dog, Cat..." required value={formData.petSpecies} onChange={e => handleInputChange('petSpecies', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label>Age (Years)</Label>
                  <Input type="number" placeholder="2" value={formData.petAge} onChange={e => handleInputChange('petAge', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Breed *</Label>
                <Input placeholder="e.g. Golden Retriever" required value={formData.petBreed} onChange={e => handleInputChange('petBreed', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" placeholder="City, State" required value={formData.petLocation} onChange={e => handleInputChange('petLocation', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Daily Food Needs *</Label>
                <div className="relative">
                  <Utensils className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" placeholder="e.g. 2 cups dry food" required value={formData.dailyFood} onChange={e => handleInputChange('dailyFood', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Activity Level *</Label>
                <div className="relative">
                  <Footprints className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" placeholder="e.g. 2 walks per day" required value={formData.walkingFrequency} onChange={e => handleInputChange('walkingFrequency', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* --- Section 3: Health & Docs --- */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-200">
              <Activity className="w-5 h-5 text-green-600" /> Health & Documents
            </h3>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Health Condition / Medical History *</Label>
                <Textarea
                  placeholder="Please describe any allergies, medications, or past surgeries..."
                  className="min-h-[100px] resize-y bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                  required
                  value={formData.healthCondition}
                  onChange={e => handleInputChange('healthCondition', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Vaccine Upload */}
                <div className="border border-dashed border-white/20 rounded-lg p-4 bg-black/20 hover:bg-black/40 transition-colors group">
                  <Label className="flex items-center gap-2 mb-2 font-medium text-sm text-gray-300 cursor-pointer group-hover:text-primary transition-colors">
                    <FileText className="w-4 h-4 text-primary" /> Vaccine Certificate
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      className="text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer bg-transparent border-white/10 text-gray-400"
                      accept=".pdf,image/*"
                      onChange={(e) => setVaccinationFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {vaccinationFile && <p className="text-xs text-green-500 mt-2 font-medium">✓ Selected: {vaccinationFile.name}</p>}
                </div>

                {/* Health Report Upload */}
                <div className="border border-dashed border-white/20 rounded-lg p-4 bg-black/20 hover:bg-black/40 transition-colors group">
                  <Label className="flex items-center gap-2 mb-2 font-medium text-sm text-gray-300 cursor-pointer group-hover:text-primary transition-colors">
                    <FileText className="w-4 h-4 text-primary" /> Medical Report (Optional)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      className="text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer bg-transparent border-white/10 text-gray-400"
                      accept=".pdf,image/*"
                      onChange={(e) => setHealthReportFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {healthReportFile && <p className="text-xs text-green-500 mt-2 font-medium">✓ Selected: {healthReportFile.name}</p>}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* --- Section 4: Owner Info --- */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <User className="w-5 h-5 text-gray-600" /> Owner Details
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input required value={formData.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input type="number" required value={formData.ownerAge} onChange={e => handleInputChange('ownerAge', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <Label>Current Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input className="pl-9 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" required value={formData.ownerLocation} onChange={e => handleInputChange('ownerLocation', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Adoption Fee (Optional)</Label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <Input className="pl-7 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" type="number" placeholder="0.00" value={formData.amount} onChange={e => handleInputChange('amount', e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">Leave blank if this is a free adoption.</p>
              </div>
            </div>
          </div>

          {/* --- Submit Action --- */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  Submit Pet for Approval <Upload className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};