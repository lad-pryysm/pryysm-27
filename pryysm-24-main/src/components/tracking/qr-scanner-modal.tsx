
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { QrCode, VideoOff } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (orderNumber: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const getCameraPermission = async () => {
            if (!isOpen) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    tick();
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
            }
        };

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                
                if (context) {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code) {
                        try {
                            const data = code.data;
                            if (data.startsWith('PRYYSM://project/')) {
                                const orderNumber = data.substring('PRYYSM://project/'.length).split('/')[0];
                                onScanSuccess(orderNumber);
                            } else {
                                toast({ variant: "destructive", title: "Invalid QR Code", description: "Scanned QR code is not a valid project code." });
                            }
                        } catch (e) {
                             toast({ variant: "destructive", title: "Invalid QR Code", description: "The scanned code is not a valid Pryysm QR code." });
                        }
                        return; // Stop ticking once a code is found
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        if (isOpen) {
            getCameraPermission();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isOpen, onScanSuccess, stopCamera, toast]);
    
     const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode /> Scan Project QR Code
                    </DialogTitle>
                    <DialogDescription>
                        Point your camera at a project's QR code to instantly locate it on the board.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative mt-4 flex items-center justify-center bg-black rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 p-4">
                            <VideoOff className="h-12 w-12 mb-4" />
                            <h3 className="font-semibold text-lg">Camera Access Denied</h3>
                            <p className="text-center text-sm">Please allow camera access in your browser to use the scanner.</p>
                        </div>
                    )}
                     {hasCameraPermission === true && (
                        <div className="absolute inset-0 border-4 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                           <div className="w-64 h-32 border-2 border-white rounded-lg"/>
                        </div>
                     )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
