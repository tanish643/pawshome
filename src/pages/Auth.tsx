import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { auth, googleProvider, db } from "@/integrations/firebase/client";
import {
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { PawPrint, ArrowLeft, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Phone Auth State
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.is_banned) {
          await auth.signOut();
          toast.error("Your account has been suspended. Please contact support.");
          navigate("/auth");
          return;
        }

        if (userData.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking role:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    // Firebase Auth Check
    const unsubscribeFirebase = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Firebase User:", user);
        // We are already redirected inside handleAuth usually, but if session persists:
        // We avoid auto-redirect here to prevent fighting with other logic or causing loops
        // unless we are on the auth page specifically trying to act as gatekeeper.
        // For now, let's just log. Naviagtion.tsx handles UI.
      }
    });

    return () => {
      unsubscribeFirebase();
    };
  }, [navigate]);

  useEffect(() => {
    // Initialize RecaptchaVerifier
    if (isPhoneAuthOpen && !recaptchaVerifier) {
      // Small delay to allow Dialog to mount the DOM element
      const timer = setTimeout(() => {
        const container = document.getElementById('recaptcha-container');
        if (container) {
          try {
            // Clear any existing instance just in case
            container.innerHTML = '';

            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible', // Use 'normal' if you want to show the checkbox
              'callback': () => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
              }
            });
            setRecaptchaVerifier(verifier);
          } catch (e) {
            console.error("Recaptcha init error:", e);
          }
        }
      }, 500); // 500ms delay for Dialog animation

      return () => clearTimeout(timer);
    }
  }, [isPhoneAuthOpen, recaptchaVerifier]);

  const handleAuth = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'signup') {
        authSchema.parse({ email, password, fullName });
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: fullName
        });

        await saveUserToFirestore(user, { fullName });
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        authSchema.omit({ fullName: true }).parse({ email, password });

        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await saveUserToFirestore(user); // Update last login

          toast.success("Welcome back!");
          checkUserRoleAndRedirect(user.uid);
        } catch (error: any) {
          // Fallback for demo: If user wants to be admin, they must update Firestore.
          // We removed the hardcoded bypass because it doesn't set actual DB permissions.
          if (email === "rahul1172005@gmail.com" && password === "rahul1172005") {
            toast.info("Dev Note: Please sign in normally. To be admin, update 'role: admin' in Firestore.");
            // navigate("/admin"); // Removed partial bypass
          }
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const msg = error instanceof z.ZodError ? error.errors[0].message : error.message;
      toast.error(msg || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const saveUserToFirestore = async (user: User, additionalData: any = {}) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || additionalData.fullName || "",
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          role: "user",
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          ...additionalData
        });
      } else {
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          ...additionalData // Update any new info if needed
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google User Data:", user);
      await saveUserToFirestore(user);
      toast.success("Welcome with Google!");
      checkUserRoleAndRedirect(user.uid);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast.error(error.message || "Google sign-in failed");
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Ensure phone number has country code if missing
    // Default to +91 if no '+' is present, but allow user to type their own code
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    console.log("Sending OTP to:", formattedNumber);

    setLoading(true);
    try {
      if (!recaptchaVerifier) {
        // Recaptcha should be init by useEffect, but double check
        throw new Error("Recaptcha not initialized. Please try again.");
      }

      const appVerifier = recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      toast.success("OTP sent! Check your phone (or enter test code).");
    } catch (error: any) {
      console.error("Phone Auth Error:", error);

      let message = error.message || "Failed to send OTP";
      if (error.code === 'auth/quota-exceeded') {
        message = "SMS Verification quota exceeded. Please use a Test Phone Number.";
      } else if (error.code === 'auth/billing-not-enabled') {
        message = "Billing not enabled. Please use a Test Phone Number registered in Firebase Console.";
      } else if (error.code === 'auth/invalid-phone-number') {
        message = "Invalid phone number format. Did you include the country code (e.g., +1)?";
      }

      toast.error(message);

      // Reset captcha if needed
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null); // Will trigger useEffect to re-init
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log("Phone User Data:", user);
      await saveUserToFirestore(user);
      toast.success("Phone verified successfully!");
      checkUserRoleAndRedirect(user.uid);
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    toast.info("Phone authentication coming soon!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground selection:bg-primary selection:text-black">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-in zoom-in duration-500">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-black rotate-3 hover:rotate-0 transition-transform duration-300 shadow-lg shadow-primary/20">
              <PawPrint className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Welcome <span className="text-primary">Back</span>
            </h1>
            <p className="text-muted-foreground mt-2">Enter your details to access your account</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 p-1 rounded-xl border border-white/5">
              <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-wide transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-wide transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={(e) => handleAuth(e, 'signin')} className="space-y-5">
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-black/40 border-white/10 focus:border-primary text-white placeholder:text-muted-foreground/50 h-12 rounded-xl transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-black/40 border-white/10 focus:border-primary text-white placeholder:text-muted-foreground/50 h-12 rounded-xl transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wide shadow-lg shadow-primary/20 rounded-xl transition-all hover:-translate-y-0.5" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                    <span className="bg-black/40 backdrop-blur-xl px-4 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="h-12 border-white/10 bg-black/20 hover:bg-white/10 hover:text-white text-muted-foreground border-dashed">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>

                  <Dialog open={isPhoneAuthOpen} onOpenChange={setIsPhoneAuthOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="h-12 border-white/10 bg-black/20 hover:bg-white/10 hover:text-white text-muted-foreground border-dashed">
                        <Phone className="mr-2 h-4 w-4" />
                        Phone
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle>Sign in with Phone</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Enter your phone number (with country code, e.g., +1) to receive a verification code.
                          <br /><span className="text-xs text-primary/80">Tip: For testing, ensure your number is added in Firebase Console.</span>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {!showOtpInput ? (
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                              placeholder="+1 555 555 5555"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <div id="recaptcha-container"></div>
                            <Button onClick={handleSendOtp} disabled={loading} className="w-full bg-primary text-black hover:bg-primary/90">
                              {loading ? "Sending..." : "Send OTP"}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Enter OTP</Label>
                            <Input
                              placeholder="123456"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="bg-black/40 border-white/10"
                            />
                            <Button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-primary text-black hover:bg-primary/90">
                              {loading ? "Verifying..." : "Verify"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuth(e, 'signup')} className="space-y-5">
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    className="bg-black/40 border-white/10 focus:border-primary text-white placeholder:text-muted-foreground/50 h-12 rounded-xl transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="bg-black/40 border-white/10 focus:border-primary text-white placeholder:text-muted-foreground/50 h-12 rounded-xl transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-black/40 border-white/10 focus:border-primary text-white placeholder:text-muted-foreground/50 h-12 rounded-xl transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wide shadow-lg shadow-primary/20 rounded-xl transition-all hover:-translate-y-0.5" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;