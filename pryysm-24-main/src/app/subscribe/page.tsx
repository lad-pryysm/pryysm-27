
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock, Loader2, CheckCircle, AlertCircle, Layers, User, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspace } from '@/hooks/use-workspace';
import { PryysmLogo } from '@/components/PryysmLogo';

type Plan = 'Free' | 'Basic' | 'Pro' | 'Enterprise';

const planDetails = {
    Free: { name: 'Free Plan', price: 0 },
    Basic: { name: 'Basic Plan', price: 0 },
    Pro: { name: 'Pro Plan', price: 0 },
    Enterprise: { name: 'Enterprise Plan', price: 0 },
};


function SubscribePageClient() {
    const { user } = useAuth();
    const { currentPlan } = useWorkspace();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialPlanParam = searchParams.get('plan');

    // Safely determine the initial plan
    const getInitialPlan = (): Plan => {
        if (initialPlanParam && ['Free', 'Basic', 'Pro', 'Enterprise'].includes(initialPlanParam)) {
            return initialPlanParam as Plan;
        }
        return 'Pro'; // Default to 'Pro' if param is missing or invalid
    };

    const [selectedPlan, setSelectedPlan] = useState<Plan>(getInitialPlan());
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    const [cardholderName, setCardholderName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        // Simulate API call 
        await new Promise(resolve => setTimeout(resolve, 1000));

        setPaymentSuccess(true);
        toast({
            title: "Subscription Activated!",
            description: `You are now on the ${planDetails[selectedPlan].name}.`,
        });
        setTimeout(() => router.push('/dashboard'), 3000);
    };
    
    if (paymentSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <CardTitle className="text-3xl mt-4">Subscription Activated!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">Welcome to Pryysm <span className="text-sm">by 3D Prodigy</span>!</p>
                        <p className="text-muted-foreground mt-2">
                           Your subscription to the <span className="font-semibold text-foreground">{planDetails[selectedPlan].name}</span> is now active.
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">Redirecting you to your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const currentPlanPrice = currentPlan ? planDetails[currentPlan]?.price ?? 0 : 0;

    const renderPaymentForm = () => {
        if (selectedPlan === 'Enterprise') {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <PartyPopper className="h-16 w-16 text-primary mb-4"/>
                    <h3 className="text-xl font-semibold">Contacting Sales</h3>
                    <p className="text-muted-foreground mt-2 mb-6">You've selected the Enterprise plan. Please fill out your details and our sales team will be in touch shortly.</p>
                    <form onSubmit={handlePaymentSubmit} className="space-y-4 w-full">
                         <div className="space-y-2 text-left">
                            <Label htmlFor="cardholder-name">Full Name</Label>
                            <Input id="cardholder-name" placeholder="John Smith" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} required />
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="john.smith@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Submit Inquiry
                        </Button>
                    </form>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <PartyPopper className="h-16 w-16 text-primary mb-4"/>
                <h3 className="text-xl font-semibold">You've selected the {planDetails[selectedPlan].name}!</h3>
                <p className="text-muted-foreground mt-2 mb-6">No payment information is required during our testing phase. Click the button below to get started.</p>
                <Button onClick={handlePaymentSubmit} className="w-full" disabled={isLoading || selectedPlan === currentPlan}>
                     {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : null }
                     {selectedPlan === currentPlan ? "This is Your Current Plan" : `Switch to ${planDetails[selectedPlan].name}`}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Plan Selection */}
                <Card className="flex flex-col">
                    <CardHeader>
                         <div className="flex items-center gap-3 mb-4">
                            <PryysmLogo className="h-10 w-10" />
                            <h1 className="text-2xl font-bold">
                                Pryysm <span className="text-sm font-medium text-muted-foreground">by 3D Prodigy</span>
                            </h1>
                        </div>
                        <CardTitle>Manage Your Subscription</CardTitle>
                        <CardDescription>Select a new plan to upgrade or downgrade. All plans are free during testing.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                         <div className="p-4 border rounded-lg bg-muted/50 mb-6">
                            <p className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4"/>Subscribing as:</p>
                            <p className="font-semibold">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                         <div className="grid grid-cols-1 gap-4">
                            {(Object.keys(planDetails) as Plan[]).map(plan => {
                                const isCurrentPlan = plan === currentPlan;
                                const isSelected = plan === selectedPlan;

                                return (
                                <button key={plan} onClick={() => setSelectedPlan(plan)} className={cn("p-4 border rounded-lg text-left transition-all relative", isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50", isCurrentPlan ? "bg-muted/60" : "")}>
                                    {isCurrentPlan && <div className="absolute top-2 right-2 text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Current Plan</div>}
                                    <h3 className="font-semibold">{planDetails[plan].name}</h3>
                                    {plan !== 'Enterprise' ? (
                                        <p className="text-2xl font-bold">Free <span className="text-sm font-normal text-muted-foreground">during testing</span></p>
                                    ) : (
                                         <p className="text-lg font-bold">Custom Pricing</p>
                                    )}
                                </button>
                            )})}
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground justify-center">
                        <Lock className="mr-2 h-3 w-3"/> Secure Activation
                    </CardFooter>
                </Card>

                {/* Payment Form */}
                <Card className="flex flex-col">
                    {renderPaymentForm()}
                </Card>
            </div>
        </div>
    );
}


export default function SubscribePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubscribePageClient />
        </Suspense>
    );
}
