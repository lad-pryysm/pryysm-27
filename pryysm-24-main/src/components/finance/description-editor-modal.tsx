
"use client"

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2 } from 'lucide-react';
import { enhanceText } from '@/ai/flows/enhance-text';

interface DescriptionEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDescription: string;
    onSave: (newDescription: string) => void;
}

export function DescriptionEditorModal({ isOpen, onClose, initialDescription, onSave }: DescriptionEditorModalProps) {
    const { toast } = useToast();
    const [description, setDescription] = useState(initialDescription);
    const [isEnhancing, setIsEnhancing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDescription(initialDescription);
        }
    }, [isOpen, initialDescription]);

    const handleEnhance = async () => {
        if (!description) {
            toast({ variant: 'destructive', title: 'Nothing to enhance', description: 'Please enter a description first.' });
            return;
        }
        setIsEnhancing(true);
        try {
            const result = await enhanceText({ text: description });
            if (result.enhancedText) {
                setDescription(result.enhancedText);
                toast({ title: 'Description Enhanced!', description: 'The AI has improved your description.' });
            }
        } catch (error) {
            console.error("Failed to enhance text:", error);
            toast({ variant: 'destructive', title: 'Enhancement Failed', description: 'Could not connect to the AI service.' });
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSave = () => {
        onSave(description);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Description</DialogTitle>
                    <DialogDescription>
                        Provide a detailed description for the item. You can use the AI assistant to help you write a better one.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter item description..."
                        rows={8}
                    />
                    <Button onClick={handleEnhance} disabled={isEnhancing} variant="outline" className="w-full">
                        {isEnhancing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Enhance with AI
                    </Button>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSave}>Save Description</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
