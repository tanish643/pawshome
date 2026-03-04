import { useEffect, useState } from "react";
import { db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapViewer } from "@/components/map/MapViewer";
import { MapPin } from "lucide-react";

export const FoundPetsList = () => {
  const [foundPets, setFoundPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoundPets();
  }, []);

  const loadFoundPets = async () => {
    try {
      const q = query(
        collection(db, "found_pets"),
        where("status", "==", "approved"),
        // where("is_claimed", "==", false), // Optional if we sort by status
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFoundPets(data);
    } catch (error) {
      console.error("Error loading found pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapLocations = foundPets
    .filter(pet => pet.found_location_lat && pet.found_location_lng)
    .map(pet => ({
      id: pet.id,
      lat: parseFloat(pet.found_location_lat),
      lng: parseFloat(pet.found_location_lng),
      title: `Found ${pet.pet_species}`,
      description: `Found on: ${pet.createdAt ? new Date(pet.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}`,
      imageUrl: pet.image_url,
    }));

  if (loading) return <Card className="p-6"><p>Loading...</p></Card>;

  return (
    <div className="space-y-6">
      {mapLocations.length > 0 && (
        <MapViewer locations={mapLocations} height="400px" />
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {foundPets.map((pet) => (
          <Card key={pet.id} className="overflow-hidden">
            <img src={pet.image_url} alt={`Found ${pet.pet_species}`} className="w-full h-48 object-cover" />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Found {pet.pet_species}
                <Badge className="bg-green-500">Found</Badge>
              </CardTitle>
              <CardDescription>
                Found on {pet.createdAt ? new Date(pet.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{pet.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span className="text-muted-foreground">{pet.found_location}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Found by: {pet.finder_name || "Unknown"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {foundPets.length === 0 && (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No found pets reported</p>
        </Card>
      )}
    </div>
  );
};
