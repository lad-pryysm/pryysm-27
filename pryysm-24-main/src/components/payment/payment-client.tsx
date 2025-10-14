
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import Image from 'next/image';
import { format } from 'date-fns';

const cardBrands = {
    visa: 'https://placehold.co/40x25/eee/ccc?text=VISA',
    mastercard: 'https://placehold.co/40x25/eee/ccc?text=MC',
    amex: 'https://placehold.co/40x25/eee/ccc?text=AMEX',
    discover: 'https://placehold.co/40x25/eee/ccc?text=DISC',
    unknown: '',
};

export function PaymentClient() {
    const params = useParams();
    const invoiceId = params.invoiceId as string;

    const { toast } = useToast();
    const { documents, customers } = useWorkspace();

    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [invoiceDetails, setInvoiceDetails] = useState<any | null>(null);
    
    const [cardholderName, setCardholderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'>('unknown');


    useEffect(() => {
        if (invoiceId) {
            const doc = documents.find(d => d.orderNumber === invoiceId && d.type === 'Tax Invoice');
            if (doc) {
                const customer = customers.find(c => c.id === doc.customerId);
                setInvoiceDetails({ ...doc, customerName: customer?.name });
            }
        }
    }, [invoiceId, documents, customers]);
    
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        let formattedValue = '';
        for(let i=0; i<value.length; i+=4) {
            formattedValue += value.slice(i, i+4) + ' ';
        }
        setCardNumber(formattedValue.trim());

        if (value.startsWith('4')) setCardBrand('visa');
        else if (value.startsWith('5')) setCardBrand('mastercard');
        else if (value.startsWith('34') || value.startsWith('37')) setCardBrand('amex');
        else if (value.startsWith('6')) setCardBrand('discover');
        else setCardBrand('unknown');
    };
    
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        if (value.length > 2) {
            setExpiryDate(`${value.slice(0,2)} / ${value.slice(2)}`);
        } else {
            setExpiryDate(value);
        }
    }

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cardholderName.trim()) {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Please enter the cardholder name.' });
            return;
        }

        const rawCardNumber = cardNumber.replace(/\s/g, '');
        if (rawCardNumber.length !== 16) {
            toast({ variant: 'destructive', title: 'Invalid Card Number', description: 'Please enter a 16-digit card number.' });
            return;
        }

        const expiryParts = expiryDate.split(' / ');
        if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
            toast({ variant: 'destructive', title: 'Invalid Expiry Date', description: 'Please use MM / YY format.' });
            return;
        }
        
        if (cvc.length < 3 || cvc.length > 4) {
            toast({ variant: 'destructive', title: 'Invalid CVC', description: 'Please enter a valid 3 or 4-digit CVC.' });
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentSuccess(true);
        toast({
            title: "Payment Successful!",
            description: `Thank you for your payment for invoice ${invoiceId}.`,
        });
        
        setIsLoading(false);
    };

    if (!invoiceId) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!invoiceDetails) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                        <CardTitle className="text-2xl mt-4">Invoice Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The invoice with ID <span className="font-mono bg-muted px-2 py-1 rounded">{invoiceId}</span> could not be found.</p>
                        <p className="mt-2 text-sm text-muted-foreground">Please check the link or contact support.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (paymentSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <CardTitle className="text-3xl mt-4">Payment Successful</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">Thank you, {invoiceDetails.customerName}!</p>
                        <p className="text-muted-foreground mt-2">
                            Your payment of <span className="font-semibold text-foreground">${invoiceDetails.amount.toFixed(2)}</span> for invoice
                            <span className="font-semibold text-foreground"> {invoiceId} </span> has been processed.
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">A confirmation email has been sent to your address.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Invoice Summary */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Invoice Summary</CardTitle>
                        <CardDescription>Payment for Invoice #{invoiceId}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">Amount Due</span>
                                <span className="text-3xl font-bold">${invoiceDetails.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Billed to</span>
                                <span className="font-medium">{invoiceDetails.customerName}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Due Date</span>
                                <span className="font-medium">{format(new Date(invoiceDetails.date), 'PPP')}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground justify-center">
                        <Lock className="mr-2 h-3 w-3"/> Secure Payment via Pryysm <span className="text-xs ml-1">by 3D Prodigy</span>
                    </CardFooter>
                </Card>

                {/* Payment Form */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Pay with Card</CardTitle>
                        <CardDescription>Enter your card details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                                <Input id="cardholder-name" placeholder="John Smith" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <div className="relative">
                                    <Input id="card-number" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumberChange} required />
                                     {cardBrand !== 'unknown' && <Image src={cardBrands[cardBrand]} alt={cardBrand} width={40} height={25} className="absolute right-3 top-1/2 -translate-y-1/2" />}
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry-date">Expiry Date</Label>
                                    <Input id="expiry-date" placeholder="MM / YY" value={expiryDate} onChange={handleExpiryChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CreditCard className="mr-2 h-4 w-4" />
                                )}
                                Pay ${invoiceDetails.amount.toFixed(2)}
                            </Button>
                        </form>
                    </CardContent>
                     <CardFooter className="flex items-center justify-center text-xs text-muted-foreground pt-4">
                        <span className="mr-2">Powered by</span>
                        <Image src="https://picsum.photos/seed/stripe/80/30" alt="Stripe Logo" width={60} height={25} data-ai-hint="stripe logo" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
