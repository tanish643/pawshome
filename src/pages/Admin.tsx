import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { auth, db } from "@/integrations/firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  getCountFromServer
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle, XCircle, Ban, UserCheck, Activity, Search, MapPin, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data States
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<any[]>([]);
  const [hosting, setHosting] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    adopted: 0,
    lost: 0,
    found: 0,
    hosting: 0
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        navigate("/auth");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          toast.error("User profile not found");
          navigate("/");
          return;
        }

        const userData = userSnap.data();

        // HARDCODED BYPASS for specific owner UID
        const ownerUid = "qqnmbaJgoTX6Arqf6xfEE5lDghm2";

        if (userData.role !== "admin" && user.uid !== ownerUid) {
          toast.error(`Access denied. Role: '${userData.role || 'none'}'`);
          navigate("/");
          return;
        }

        if (user.uid === ownerUid) {
          toast.success("Welcome Owner!");
        }

        setIsAdmin(true);

        // Load data separately so it doesn't fail the auth check
        try {
          await loadAllData();
        } catch (dataErr) {
          console.error("Data load failed", dataErr);
          toast.error("Failed to load dashboard data (Check Console for Indexes)");
        }

      } catch (error) {
        console.error("Admin check failed:", error);
        toast.error("Failed to verify admin privileges");
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Remove the old manual check function since we use the listener now
  // checkAdminAndLoadData removed

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadAdoptions(),
      loadLostFound(),
      loadHosting(),
      loadUsers(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadAdoptions = async () => {
    const q = query(
      collection(db, "pets_for_adoption"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAdoptions(data);
  };

  const loadLostFound = async () => {
    // Both Lost and Found pending
    const lostQ = query(collection(db, "lost_pets"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
    const foundQ = query(collection(db, "found_pets"), where("status", "==", "pending"), orderBy("createdAt", "desc"));

    const [lostSnap, foundSnap] = await Promise.all([getDocs(lostQ), getDocs(foundQ)]);
    const lost = lostSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'lost' }));
    const found = foundSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'found' }));

    setLostFound([...lost, ...found]);
  };

  const loadHosting = async () => {
    const q = query(
      collection(db, "hosting_pets"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    setHosting(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadUsers = async () => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadStats = async () => {
    try {
      const adoptedSnap = await getCountFromServer(query(collection(db, "pets_for_adoption"), where("status", "==", "approved")));
      const lostSnap = await getCountFromServer(query(collection(db, "lost_pets"), where("status", "==", "approved"), where("is_found", "==", false)));
      const foundSnap = await getCountFromServer(query(collection(db, "found_pets"), where("status", "==", "approved"), where("is_claimed", "==", false)));
      const hostingSnap = await getCountFromServer(query(collection(db, "hosting_pets"), where("status", "==", "approved"), where("is_hosted", "==", false)));

      setStats({
        adopted: adoptedSnap.data().count,
        lost: lostSnap.data().count,
        found: foundSnap.data().count,
        hosting: hostingSnap.data().count
      });
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  // ----- Types -----
  type ApproveRejectTable =
    | "pets_for_adoption"
    | "lost_pets"
    | "found_pets"
    | "hosting_pets";

  // --- Actions ---

  const handleApprove = async (table: ApproveRejectTable, id: string) => {
    try {
      const docRef = doc(db, table, id);
      await updateDoc(docRef, { status: "approved" });
      toast.success("Approved successfully");
      loadAllData();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (table: ApproveRejectTable, id: string) => {
    try {
      const docRef = doc(db, table, id);
      // We can either delete or set status to rejected. Let's set to rejected for record keeping
      await updateDoc(docRef, { status: "rejected" });
      toast.success("Rejected successfully");
      loadAllData();
    } catch (error) {
      // If document doesn't exist etc
      console.error("Reject error:", error);
      toast.error("Failed to reject");
    }
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { is_banned: !currentStatus });
      toast.success(`User ${!currentStatus ? 'Banned' : 'Unbanned'}`);
      loadUsers();
    } catch (error) {
      console.error("Ban error:", error);
      toast.error("Could not update user status.");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-2">Manage approvals, users, and view platform activity.</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={loadAllData} variant="outline" className="border-border">Refresh Data</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Pets Adopted" value={stats.adopted} icon={<Home className="text-primary" />} />
          <StatCard title="Lost Reports" value={stats.lost} icon={<Search className="text-red-500" />} />
          <StatCard title="Found Reports" value={stats.found} icon={<MapPin className="text-green-500" />} />
          <StatCard title="Active Hosts" value={hosting.length} icon={<Activity className="text-blue-500" />} />
        </div>

        <Tabs defaultValue="adoption" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border/40 rounded-none h-auto p-0 mb-8 overflow-x-auto">
            <TabTrigger value="adoption" label="Adoption Requests" count={adoptions.length} />
            <TabTrigger value="lostfound" label="Lost & Found" count={lostFound.length} />
            <TabTrigger value="hosting" label="Hosting Requests" count={hosting.length} />
            <TabTrigger value="users" label="User Management" count={users.length} />
          </TabsList>

          <TabsContent value="adoption" className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-bold mb-6">Pending Adoptions</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {adoptions.length === 0 ? <EmptyState /> : adoptions.map(item => (
                <ApprovalCard
                  key={item.id}
                  data={item}
                  type="adoption"
                  onApprove={() => handleApprove('pets_for_adoption', item.id)}
                  onReject={() => handleReject('pets_for_adoption', item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lostfound" className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-bold mb-6">Recent Reports</h2>
            {/* Note: Using delete/reject for moderation */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lostFound.length === 0 ? <EmptyState /> : lostFound.map(item => (
                <ApprovalCard
                  key={item.id}
                  data={item}
                  type="lost_found"
                  // If approvals are needed, enable onApprove. For now just Delete (Reject)
                  onApprove={() => handleApprove(item.type === 'found' ? 'found_pets' : 'lost_pets', item.id)}
                  onReject={() => handleReject(item.type === 'found' ? 'found_pets' : 'lost_pets', item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hosting" className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-bold mb-6">Hosting Requests</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {hosting.length === 0 ? <EmptyState /> : hosting.map(item => (
                <ApprovalCard
                  key={item.id}
                  data={item}
                  type="hosting"
                  onApprove={() => handleApprove('hosting_pets', item.id)}
                  onReject={() => handleReject('hosting_pets', item.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-bold mb-6">All Users</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email / ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-bold">{user.displayName || user.email || "Unnamed"}</td>
                      <td className="p-4 text-muted-foreground">{user.email || user.id}</td>
                      <td className="p-4">
                        {user.is_banned ?
                          <Badge variant="destructive">Banned</Badge> :
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                        }
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={user.is_banned ? "default" : "destructive"}
                          onClick={() => toggleBan(user.id, user.is_banned)}
                        >
                          {user.is_banned ? <UserCheck className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                          {user.is_banned ? "Unban" : "Ban"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// --- Sub-components for Cleaner Code ---

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: any }) => (
  <Card className="bg-card border-border shadow-sm">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-4xl font-black mt-2">{value}</p>
      </div>
      <div className="p-3 bg-muted rounded-full">
        {icon}
      </div>
    </CardContent>
  </Card>
);

const TabTrigger = ({ value, label, count }: { value: string, label: string, count: number }) => (
  <TabsTrigger
    value={value}
    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-8 py-4 font-bold uppercase tracking-wide hover:text-primary transition-all"
  >
    {label}
    <Badge className="ml-3 bg-muted text-foreground hover:bg-muted-foreground/20">{count}</Badge>
  </TabsTrigger>
);

const EmptyState = () => (
  <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
    <p className="text-muted-foreground">No items to review.</p>
  </div>
);

const ApprovalCard = ({ data, type, onApprove, onReject }: { data: any, type: string, onApprove: () => void, onReject: () => void }) => (
  <Card className="overflow-hidden border-border group hover:shadow-lg transition-all">
    <div className="h-48 overflow-hidden bg-muted relative">
      {data.main_image_url || data.image_url ? (
        <img src={data.main_image_url || data.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
      )}
      <div className="absolute top-2 right-2">
        <Badge className="bg-black/50 backdrop-blur text-white border-0">
          {type === 'adoption' ? data.amount ? `$${data.amount}` : 'Free' : ''}
        </Badge>
      </div>
    </div>
    <CardHeader>
      <CardTitle className="truncate">{data.pet_name || "Unknown Pet"}</CardTitle>
      <CardDescription>{data.pet_species} • {data.pet_breed || "Unknown Breed"}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-sm space-y-2 mb-4">
        <p><span className="font-bold">Owner:</span> {data.owner_name || data.fullname || data.displayName || "Unknown"}</p>
        <p><span className="font-bold">Location:</span> {data.pet_location || data.lost_location || data.found_location || "Unknown"}</p>
        {data.health_condition && <p><span className="font-bold">Health:</span> {data.health_condition}</p>}
      </div>
      <div className="flex gap-3">
        <Button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-4 h-4 mr-2" /> Approve</Button>
        <Button onClick={onReject} variant="destructive" className="flex-1"><XCircle className="w-4 h-4 mr-2" /> Reject</Button>
      </div>
    </CardContent>
  </Card>
);

export default Admin;
