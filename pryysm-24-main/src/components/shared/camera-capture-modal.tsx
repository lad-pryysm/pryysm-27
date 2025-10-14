
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, VideoOff, Check, X, Loader2 } from 'lucide-react';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageDataUrl: string) => void;
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!isOpen) return;
            setIsLoading(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            getCameraPermission();
        } else {
            stopCamera();
        }
        
        return () => {
            stopCamera();
        };

    }, [isOpen, stopCamera, toast]);
    
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onCapture(dataUrl);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera /> Capture Image
                    </DialogTitle>
                    <DialogDescription>
                        Point your camera at the object and capture an image.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative mt-4 flex items-center justify-center bg-black rounded-lg overflow-hidden aspect-video">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 p-4">
                            <Loader2 className="h-12 w-12 animate-spin mb-4" />
                            <p>Requesting camera access...</p>
                        </div>
                    )}
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {hasCameraPermission === false && !isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 p-4">
                            <VideoOff className="h-12 w-12 mb-4" />
                            <h3 className="font-semibold text-lg">Camera Access Denied</h3>
                            <p className="text-center text-sm">Please allow camera access in your browser to use this feature.</p>
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <X className="mr-2 h-4 w-4"/> Cancel
                    </Button>
                    <Button onClick={handleCapture} disabled={!hasCameraPermission || isLoading}>
                        <Check className="mr-2 h-4 w-4" /> Capture Photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
