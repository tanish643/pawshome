import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { mockAdoptionPets } from "@/data/mockData";
import {
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface Pet {
  id: string;
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  pet_location: string;
  amount: number;
  main_image_url: string;
  health_condition: string;
  owner_id: string;
  owner_name?: string; // Stored directly now
}

interface FilterState {
  search: string;
  location: string;
  minPrice: string;
  maxPrice: string;
}

export const AdoptPetList = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Payment State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "pets_for_adoption"),
        where("status", "==", "approved"),
        where("is_adopted", "==", false),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Merge Real Data with Mock Data
      const combinedPets = [...(data || []), ...mockAdoptionPets];
      setPets(combinedPets as Pet[]);
      setFilteredPets(combinedPets as Pet[]);
    } catch (error) {
      console.error("Error loading pets:", error);
      // Fallback to mock data if API fails
      setPets(mockAdoptionPets as Pet[]);
      setFilteredPets(mockAdoptionPets as Pet[]);
      toast.error("Loaded offline mock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...pets];
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (pet) =>
          pet.pet_species.toLowerCase().includes(query) ||
          pet.pet_breed.toLowerCase().includes(query) ||
          pet.pet_name.toLowerCase().includes(query)
      );
    }
    if (filters.location) {
      result = result.filter((pet) =>
        pet.pet_location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.minPrice) {
      result = result.filter((pet) => pet.amount >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((pet) => pet.amount <= parseFloat(filters.maxPrice));
    }
    setFilteredPets(result);
  }, [filters, pets]);

  const handleInterestClick = (pet: Pet) => {
    setSelectedPet(pet);
    setShowPayment(true);
  };

  const processAdoptionInterest = async () => {
    if (!selectedPet) return;

    // Close payment modal
    setShowPayment(false);
    setSubmittingId(selectedPet.id);

    // Check if it's a mock pet
    if (selectedPet.id.startsWith("mock-")) {
      setTimeout(() => {
        toast.success(`Interest sent to ${selectedPet.owner_name || 'the owner'}!`);
        setSubmittingId(null);
        setSelectedPet(null);
      }, 1500);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please log in to contact the owner");
        setSubmittingId(null);
        return;
      }

      await addDoc(collection(db, "adoption_interests"), {
        pet_id: selectedPet.id,
        interested_user_id: user.uid,
        interested_user_email: user.email,
        createdAt: serverTimestamp()
      });

      // TODO: Add notification logic via Cloud Functions
      // await supabase.functions.invoke("send-interest-notification" ...

      toast.success(`Interest sent to ${selectedPet.owner_name || 'the owner'}!`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmittingId(null);
      setSelectedPet(null);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto py-8 px-4">

      {/* --- Floating Glass Filter Bar --- */}
      <div className="sticky top-24 z-30 glass rounded-full p-2 shadow-xl border border-white/20 ring-1 ring-black/5 animate-in slide-in-from-top-4 duration-700 max-w-5xl mx-auto backdrop-blur-md bg-black/40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">

          <div className="md:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Search by name, breed..."
              className="pl-10 bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 h-10 rounded-full"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="md:col-span-3 relative border-l border-white/10">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Location"
              className="pl-10 bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 h-10 rounded-full"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          <div className="md:col-span-3 flex gap-2 border-l border-white/10 px-2">
            <Input
              type="number"
              placeholder="Min ₹"
              className="bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 h-10 px-2"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <span className="self-center text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max ₹"
              className="bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 h-10 px-2"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Button
              className="w-full h-10 rounded-full bg-primary text-black font-bold hover:bg-white transition-colors"
              onClick={() => setFilters({ search: "", location: "", minPrice: "", maxPrice: "" })}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* --- Results --- */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[500px] bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="space-y-2 text-white">
              <h3 className="text-4xl font-black font-display">NO PETS FOUND</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find more friends.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setFilters({ search: "", location: "", minPrice: "", maxPrice: "" })}
              className="rounded-none border-primary text-primary hover:bg-primary hover:text-black uppercase font-bold"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onInterest={handleInterestClick}
                isSubmitting={submittingId === pet.id}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={processAdoptionInterest}
        amount={selectedPet?.amount || 50}
        title={`Adopt ${selectedPet?.pet_name}`}
      />
    </div>
  );
};

// --- Refactored "Editorial" Pet Card ---
const PetCard = ({
  pet,
  onInterest,
  isSubmitting,
  formatPrice
}: {
  pet: Pet;
  onInterest: (p: Pet) => void;
  isSubmitting: boolean;
  formatPrice: (n: number) => string;
}) => {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden border border-white/10 bg-black min-h-[500px]"
      onClick={() => onInterest(pet)}
    >
      {/* Background Image - Grayscale to Color */}
      <img
        src={pet.main_image_url}
        alt={pet.pet_name}
        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out transform group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800";
        }}
      />

      {/* Floating Price Badge */}
      <div className="absolute top-4 right-4 z-30">
        <Badge className="bg-primary text-black font-bold text-lg px-3 py-1 border-0 rounded-none uppercase tracking-wider">
          {formatPrice(pet.amount)}
        </Badge>
      </div>

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500 z-10" />

      {/* Content Content - Bottom Aligned */}
      <div className="absolute bottom-0 left-0 p-8 z-20 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="space-y-2 mb-4">
          <p className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            {pet.pet_species} • {pet.pet_breed}
          </p>
          <h3 className="text-5xl font-black text-white leading-none uppercase">
            {pet.pet_name}
          </h3>
        </div>

        {/* Hover Details */}
        <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto overflow-visible">
          <div className="flex flex-col gap-2 text-gray-300 text-sm font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {pet.pet_location}
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> {pet.health_condition}
            </div>
          </div>

          <Button
            className="w-full bg-white text-black font-black uppercase text-lg h-14 rounded-none border-2 border-white hover:bg-primary hover:border-primary hover:text-black transition-all mt-4 flex items-center justify-between px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Meet " + pet.pet_name}
            {!isSubmitting && <ArrowRight className="w-6 h-6" />}
          </Button>
        </div>

        {/* Hint arrow when not hovering */}
        <div className="group-hover:opacity-0 transition-opacity duration-300 absolute bottom-8 right-8">
          <ArrowRight className="w-8 h-8 text-white/50" />
        </div>
      </div>
    </div>
  );
};