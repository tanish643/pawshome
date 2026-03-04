
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number | string;
    title?: string;
}

export const PaymentModal = ({ isOpen, onClose, onSuccess, amount, title = "Complete Payment" }: PaymentModalProps) => {
    const [step, setStep] = useState<"details" | "payment">("details");
    const [loading, setLoading] = useState(false);

    // User Details
    const [userDetails, setUserDetails] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userDetails.name || !userDetails.email || !userDetails.phone) {
            toast.error("Please fill in all details");
            return;
        }
        setStep("payment");
    };

    const handlePaymentComplete = async () => {
        setLoading(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        toast.success("Payment verified successfully!");
        onSuccess();
        onClose();
        setStep("details"); // Reset for next time
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {step === "details" ? "Please provide your contact details" : `Total Amount: ₹${amount}`}
                    </DialogDescription>
                </DialogHeader>

                {step === "details" ? (
                    <form onSubmit={handleDetailsSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                required
                                placeholder="John Doe"
                                value={userDetails.name}
                                onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                required
                                type="email"
                                placeholder="john@example.com"
                                value={userDetails.email}
                                onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                required
                                type="tel"
                                placeholder="+1 234 567 890"
                                value={userDetails.phone}
                                onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg font-bold uppercase bg-black text-white hover:bg-gray-800">
                            Proceed to Pay
                        </Button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-black shadow-xl">
                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                {/* QR Placeholder */}
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Payment%20Verified"
                                    alt="Payment QR"
                                    className="w-full h-full object-cover mix-blend-multiply"
                                />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="font-bold text-lg">Scan to Pay</p>
                            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                Scan the QR code with your UPI app or Camera to complete the transaction.
                            </p>
                        </div>

                        <Button
                            onClick={handlePaymentComplete}
                            disabled={loading}
                            className="w-full h-12 text-lg font-bold uppercase bg-green-600 hover:bg-green-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-5 w-5" /> I Have Paid
                                </>
                            )}
                        </Button>

                        <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => setStep("details")}>
                            Back to Details
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
