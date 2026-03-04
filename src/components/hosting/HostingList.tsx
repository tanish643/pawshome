import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { mockHostingPets } from "@/data/mockData";
import {
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Calendar,
  Utensils,
  Activity
} from "lucide-react";

interface HostingPet {
  id: string;
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  pet_location: string;
  amount_per_day: number;
  number_of_days: number;
  daily_food: string;
  walking_frequency: string;
  is_vaccinated: boolean;
  main_image_url: string;
  owner_id: string;
  owner_name?: string;
}

interface FilterState {
  search: string;
  location: string;
  minPrice: string;
  maxPrice: string;
}

export const HostingList = () => {
  const [hostingPets, setHostingPets] = useState<HostingPet[]>([]);
  const [filteredPets, setFilteredPets] = useState<HostingPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Payment State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPet, setSelectedPet] = useState<HostingPet | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    loadHostingPets();
  }, []);

  useEffect(() => {
    let result = [...hostingPets];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(pet =>
        pet.pet_species.toLowerCase().includes(q) ||
        pet.pet_breed.toLowerCase().includes(q) ||
        pet.pet_name.toLowerCase().includes(q)
      );
    }

    if (filters.location) {
      result = result.filter(pet =>
        pet.pet_location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      result = result.filter(pet => pet.amount_per_day >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(pet => pet.amount_per_day <= parseFloat(filters.maxPrice));
    }

    setFilteredPets(result);
  }, [filters, hostingPets]);

  const loadHostingPets = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "hosting_pets"),
        where("status", "==", "approved"),
        where("is_hosted", "==", false),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Merge Real Data with Mock Data
      const combined = [...(data || []), ...mockHostingPets];
      setHostingPets(combined as HostingPet[]);
      setFilteredPets(combined as HostingPet[]);
    } catch (error) {
      console.error("Error loading hosting pets:", error);
      setHostingPets(mockHostingPets as HostingPet[]);
      setFilteredPets(mockHostingPets as HostingPet[]);
      toast.error("Loaded offline mock data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInterestClick = (pet: HostingPet) => {
    setSelectedPet(pet);
    setShowPayment(true);
  };

  const processHostingInterest = async () => {
    if (!selectedPet) return;

    // Close payment modal
    setShowPayment(false);
    setSubmittingId(selectedPet.id);

    // Check if it's a mock pet
    if (selectedPet.id.startsWith("mock-")) {
      setTimeout(() => {
        toast.success(`Request sent to ${selectedPet.owner_name || 'the owner'}!`);
        setSubmittingId(null);
        setSelectedPet(null);
      }, 1500);
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("Please log in to express interest");
        setSubmittingId(null);
        return;
      }

      // Save interest to a collection (e.g., 'hosting_interests' or general 'interests')
      await addDoc(collection(db, "adoption_interests"), { // Reusing table or create new
        pet_id: selectedPet.id,
        type: 'hosting',
        interested_user_id: user.uid,
        interested_user_email: user.email,
        createdAt: serverTimestamp()
      });

      // Notification logic would go here
      toast.success(`Request sent to ${selectedPet.pet_name}'s owner!`);

    } catch (error) {
      console.error("Interest Error:", error);
      toast.error("Failed to send request. Try again.");
    } finally {
      setSubmittingId(null);
      setSelectedPet(null);
    }
  };

  // Helper: Currency Formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-8">

      {/* --- Filter Bar --- */}
      <div className="sticky top-24 z-30 glass rounded-full p-2 shadow-xl border border-white/20 ring-1 ring-black/5 animate-in slide-in-from-top-4 duration-700 max-w-5xl mx-auto backdrop-blur-md bg-black/40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Same filter style as Adopt */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Search by breed, name..."
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

      {/* --- Main Grid --- */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skeleton */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[500px] bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="space-y-2 text-white">
              <h3 className="text-4xl font-black font-display">NO HOSTS FOUND</h3>
              <p className="text-muted-foreground">Adjust filters to find available hosts.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPets.map((pet) => (
              <HostingCard
                key={pet.id}
                pet={pet}
                onInterest={handleInterestClick}
                isSubmitting={submittingId === pet.id}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={processHostingInterest}
        amount={(selectedPet?.amount_per_day || 0) * (selectedPet?.number_of_days || 1)}
        title={`Host ${selectedPet?.pet_name}`}
      />
    </div>
  );
};

// --- Refactored "Editorial" Hosting Card ---
const HostingCard = ({
  pet,
  onInterest,
  isSubmitting,
  formatCurrency
}: {
  pet: HostingPet;
  onInterest: (p: HostingPet) => void;
  isSubmitting: boolean;
  formatCurrency: (n: number) => string;
}) => {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden border border-white/10 bg-black min-h-[500px]"
      onClick={() => onInterest(pet)}
    >
      <img
        src={pet.main_image_url}
        alt={pet.pet_name}
        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out transform group-hover:scale-105"
        onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Pet"}
      />

      {/* Floating Price Badge */}
      <div className="absolute top-4 right-4 z-30">
        <Badge className="bg-primary text-black font-bold text-lg px-3 py-1 border-0 rounded-none uppercase tracking-wider">
          {formatCurrency(pet.amount_per_day)} / Day
        </Badge>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500 z-10" />

      <div className="absolute bottom-0 left-0 p-8 z-20 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="space-y-2 mb-4">
          <p className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            HOSTING • {pet.number_of_days} DAYS
          </p>
          <h3 className="text-4xl font-black text-white leading-none uppercase">
            {pet.pet_name}
          </h3>
        </div>

        <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto overflow-visible">
          <div className="flex flex-col gap-2 text-gray-300 text-sm font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {pet.pet_location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> {pet.number_of_days} Days Availability
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" /> {pet.daily_food}
            </div>
          </div>

          <Button
            className="w-full bg-white text-black font-black uppercase text-lg h-14 rounded-none border-2 border-white hover:bg-primary hover:border-primary hover:text-black transition-all mt-4 flex items-center justify-between px-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Apply to Host"}
            {!isSubmitting && <ArrowRight className="w-6 h-6" />}
          </Button>
        </div>

        <div className="group-hover:opacity-0 transition-opacity duration-300 absolute bottom-8 right-8">
          <ArrowRight className="w-8 h-8 text-white/50" />
        </div>
      </div>
    </div>
  );
}