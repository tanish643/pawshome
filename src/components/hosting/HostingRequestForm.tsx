import { useState, useEffect } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { uploadFile } from "@/utils/fileUpload";
import { PaymentModal } from "@/components/payment/PaymentModal";
import {
  ImagePlus,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  User,
  Syringe,
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";

// --- Types ---
interface HostingFormData {
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
  numberOfDays: string;
  amountPerDay: string;
}

export const HostingRequestForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [showPayment, setShowPayment] = useState(false);

  // File States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [vaccinationFile, setVaccinationFile] = useState<File | null>(null);
  const [healthReportFile, setHealthReportFile] = useState<File | null>(null);

  // Form Data
  const [formData, setFormData] = useState<HostingFormData>({
    petName: "", petBreed: "", petAge: "", petSpecies: "", healthCondition: "",
    isVaccinated: false, dailyFood: "", walkingFrequency: "", petLocation: "",
    ownerName: "", ownerAge: "", ownerLocation: "", numberOfDays: "", amountPerDay: ""
  });

  // Derived State: Total Cost Calculation
  const totalCost = (parseFloat(formData.amountPerDay) || 0) * (parseInt(formData.numberOfDays) || 0);

  const handleInputChange = (field: keyof HostingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to submit a request");
      return;
    }

    // Basic validation check (though required attributes handle most)
    if (!formData.petName || !formData.amountPerDay || !formData.numberOfDays) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Trigger Payment
    setShowPayment(true);
  };

  const finalizeSubmission = async () => {
    setShowPayment(false);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return; // Should allow as we checked before

      setSubmitStatus("uploading");

      // 1. File Uploads (Parallel Execution for speed)
      let imageUrl = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400";
      let vaccinationUrl = null;
      let healthReportUrl = null;

      const uploadPromises = [];

      if (imageFile) {
        uploadPromises.push(uploadFile(imageFile, "pet-images", user.uid).then(res => { if (res) imageUrl = res.url }));
      }
      if (vaccinationFile) {
        uploadPromises.push(uploadFile(vaccinationFile, "pet-documents", user.uid).then(res => { if (res) vaccinationUrl = res.url }));
      }
      if (healthReportFile) {
        uploadPromises.push(uploadFile(healthReportFile, "pet-documents", user.uid).then(res => { if (res) healthReportUrl = res.url }));
      }

      await Promise.all(uploadPromises);

      // 2. Database Insert
      setSubmitStatus("saving");

      await addDoc(collection(db, "hosting_pets"), {
        owner_id: user.uid,
        owner_email: user.email,
        pet_name: formData.petName,
        pet_breed: formData.petBreed,
        is_approved: false, // Wait for admin
        status: "pending",
        pet_age: parseInt(formData.petAge) || null,
        pet_species: formData.petSpecies,
        health_condition: formData.healthCondition,
        is_vaccinated: formData.isVaccinated,
        vaccination_proof_url: vaccinationUrl,
        health_report_url: healthReportUrl,
        daily_food: formData.dailyFood,
        walking_frequency: formData.walkingFrequency,
        pet_location: formData.petLocation,
        owner_name: formData.ownerName,
        owner_age: parseInt(formData.ownerAge),
        owner_location: formData.ownerLocation,
        number_of_days: parseInt(formData.numberOfDays),
        amount_per_day: parseFloat(formData.amountPerDay),
        main_image_url: imageUrl,
        createdAt: serverTimestamp()
      });

      toast.success("Payment Received & Request Submitted!");

      // Reset Form
      setFormData({
        petName: "", petBreed: "", petAge: "", petSpecies: "", healthCondition: "",
        isVaccinated: false, dailyFood: "", walkingFrequency: "", petLocation: "",
        ownerName: "", ownerAge: "", ownerLocation: "", numberOfDays: "", amountPerDay: ""
      });
      setImageFile(null);
      setImagePreview("");
      setVaccinationFile(null);
      setHealthReportFile(null);

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
      setSubmitStatus("idle");
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto shadow-md border-gray-700 bg-gray-900/40 backdrop-blur-sm">
        <CardHeader className="bg-gray-800/50 border-b border-gray-700 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Request Pet Hosting</CardTitle>
              <CardDescription className="text-gray-300">
                Find a temporary home for your pet while you are away.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleInitSubmit} className="space-y-8">

            {/* --- Section 1: Pet Identity --- */}
            <div className="grid md:grid-cols-[200px_1fr] gap-8">
              {/* Image Upload Column */}
              <div className="flex flex-col gap-2">
                <Label>Pet Photo *</Label>
                <label className="group relative w-full aspect-square md:h-48 md:w-48 flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden text-white/50 border-white/20">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required={!imagePreview} />
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-opacity group-hover:opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary mb-2" />
                      <span className="text-xs text-muted-foreground">Click to upload</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Basic Info Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pet Name *</Label>
                    <Input placeholder="e.g. Max" required value={formData.petName} onChange={e => handleInputChange('petName', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Species *</Label>
                    <Input placeholder="Dog, Cat..." required value={formData.petSpecies} onChange={e => handleInputChange('petSpecies', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Breed *</Label>
                    <Input placeholder="e.g. Labrador" required value={formData.petBreed} onChange={e => handleInputChange('petBreed', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Age (Years)</Label>
                    <Input type="number" placeholder="3" value={formData.petAge} onChange={e => handleInputChange('petAge', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input className="pl-9 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500" placeholder="City, Area" required value={formData.petLocation} onChange={e => handleInputChange('petLocation', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* --- Section 2: Hosting Details (Money & Time) --- */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
                <Clock className="w-5 h-5 text-primary" /> Hosting Logistics
              </h3>
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="space-y-2">
                    <Label>Number of Days *</Label>
                    <div className="relative">
                      <Input
                        required type="number" min="1"
                        value={formData.numberOfDays}
                        onChange={e => handleInputChange('numberOfDays', e.target.value)}
                        className="bg-gray-900/50 border-gray-600 text-white"
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-gray-400">Days</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Per Day *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                      <Input
                        required type="number" step="0.01" className="pl-9 bg-gray-900/50 border-gray-600 text-white"
                        value={formData.amountPerDay}
                        onChange={e => handleInputChange('amountPerDay', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Real-time Calculation Card */}
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 shadow-sm flex flex-col items-center justify-center h-full">
                    <span className="text-sm text-gray-300 uppercase tracking-wider font-semibold">Total Estimated Cost</span>
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalCost)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <Label>Daily Food Requirements *</Label>
                    <Input placeholder="e.g. 2 scoops dry food, twice daily" required value={formData.dailyFood} onChange={e => handleInputChange('dailyFood', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Walking Frequency *</Label>
                    <Input placeholder="e.g. Morning and Evening" required value={formData.walkingFrequency} onChange={e => handleInputChange('walkingFrequency', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* --- Section 3: Health & Docs --- */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-white">
                <Syringe className="w-5 h-5 text-primary" /> Health & Medical
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Health Condition / Special Needs *</Label>
                  <Textarea
                    required
                    placeholder="Any allergies, medications, or behavioral issues?"
                    className="min-h-[80px] bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                    value={formData.healthCondition}
                    onChange={e => handleInputChange('healthCondition', e.target.value)}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-6 pt-2">
                  {/* Vaccination Logic */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2 border border-white/10 p-3 rounded-lg bg-black/20">
                      <Checkbox
                        id="vaccine"
                        checked={formData.isVaccinated}
                        onCheckedChange={(c) => handleInputChange('isVaccinated', c as boolean)}
                        className="border-white/50 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                      />
                      <Label htmlFor="vaccine" className="cursor-pointer font-medium text-white">Pet is fully vaccinated</Label>
                    </div>

                    {formData.isVaccinated && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-xs text-muted-foreground mb-1 block">Proof of Vaccination</Label>
                        <Input type="file" className="text-sm bg-transparent border-white/10 text-white" accept=".pdf,.jpg,.png" onChange={(e) => setVaccinationFile(e.target.files?.[0] || null)} />
                      </div>
                    )}
                  </div>

                  {/* Health Cert Logic */}
                  <div className="flex-1 space-y-1">
                    <Label>General Health Certificate (Optional)</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors bg-black/20">
                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => setHealthReportFile(e.target.files?.[0] || null)} />
                        {healthReportFile ? (
                          <div className="flex items-center gap-2 text-green-500 font-medium">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm truncate max-w-[150px]">{healthReportFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <FileText className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Upload Document</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* --- Section 4: Owner --- */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-300">
                <User className="w-4 h-4" /> Owner Contact Details
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Your Name *</Label><Input required value={formData.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white" /></div>
                <div><Label>Age *</Label><Input required type="number" value={formData.ownerAge} onChange={e => handleInputChange('ownerAge', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white" /></div>
                <div><Label>Location *</Label><Input required value={formData.ownerLocation} onChange={e => handleInputChange('ownerLocation', e.target.value)} className="bg-gray-900/50 border-gray-600 text-white" /></div>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full text-lg shadow-lg bg-primary text-black font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-all">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {submitStatus === "uploading" ? "Uploading files..." : "Processing..."}
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={finalizeSubmission}
        amount={totalCost}
        title="Complete Hosting Payment"
      />
    </>
  );
};