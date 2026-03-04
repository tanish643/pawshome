import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GivePetForm } from "@/components/adopt/GivePetForm";
import { AdoptPetList } from "@/components/adopt/AdoptPetList";
import { PawPrint, Heart, Star } from "lucide-react";

const Adopt = () => {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-black">
      <Navigation />

      <div className="pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-16 border-b border-white/10 pb-8 animate-fade-up">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">Our Database</span>
                <h1 className="font-display text-6xl md:text-8xl font-black text-white opacity-90 leading-none">
                  ADOPT <br /> <span className="text-primary text-outline-white opacity-100">NOW</span>
                </h1>
              </div>
              <div className="md:text-right max-w-sm">
                <p className="text-muted-foreground font-medium">
                  Browse verified profiles. Find your companion.
                  <br />
                  <span className="text-primary italic font-script">Save a life today.</span>
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="adopt" className="w-full">
            {/* Tabs List - Editorial style */}
            <div className="mb-12">
              <TabsList className="bg-transparent h-auto p-0 gap-8 w-full flex flex-col md:flex-row justify-start">
                <TabsTrigger
                  value="adopt"
                  className="h-auto p-0 rounded-none border-b-4 border-transparent bg-transparent hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all group w-full md:w-auto justify-start"
                >
                  <div className="flex items-center gap-6 pb-4">
                    <span className="text-4xl md:text-5xl font-black text-white/30 group-data-[state=active]:text-white transition-colors">01</span>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white group-data-[state=active]:text-primary transition-colors">I WANT TO ADOPT</h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest">Browse Pets</p>
                    </div>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="give"
                  className="h-auto p-0 rounded-none border-b-4 border-transparent bg-transparent hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all group w-full md:w-auto justify-start"
                >
                  <div className="flex items-center gap-6 pb-4">
                    <span className="text-4xl md:text-5xl font-black text-white/30 group-data-[state=active]:text-white transition-colors">02</span>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white group-data-[state=active]:text-primary transition-colors">GIVE A PET</h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest">Rehome Request</p>
                    </div>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Areas */}
            <div className="bg-card/5 backdrop-blur-sm rounded-none border border-white/5 p-6 md:p-12 min-h-[500px]">
              <TabsContent value="adopt" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AdoptPetList />
              </TabsContent>

              <TabsContent value="give" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GivePetForm />
              </TabsContent>
            </div>
          </Tabs>

        </div>
      </div>
    </div>
  );
};

export default Adopt;