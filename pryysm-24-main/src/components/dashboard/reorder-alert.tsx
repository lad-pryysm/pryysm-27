"use client"
import { useState, useEffect } from "react"
import { generateReorderAlert, type GenerateReorderAlertOutput } from "@/ai/flows/intelligent-reordering"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Lightbulb } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export interface InventoryItemData {
  name: string
  quantity: number
  unit: string
  status: string
  historicalUsage: string
}

interface ReorderAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemData;
}

export function ReorderAlert({ open, onOpenChange, item }: ReorderAlertProps) {
  const [result, setResult] = useState<GenerateReorderAlertOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (item && open) {
      const fetchReorderAlert = async () => {
        setIsLoading(true)
        setResult(null)
        try {
          const alert = await generateReorderAlert({
            itemName: item.name,
            historicalUsageData: item.historicalUsage,
            leadTimeDays: 7, // Assuming a 7-day lead time
            currentStockLevel: item.quantity,
            reorderThreshold: 5, // Assuming a reorder threshold of 5
          })
          setResult(alert)
        } catch (error) {
          console.error(error)
          toast({
            title: "Error",
            description: "Failed to get reorder recommendation. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchReorderAlert()
    }
  }, [item, open, toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" /> Intelligent Reorder Alert for {item?.name}
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis of your inventory levels and usage patterns.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {result && (
            <Alert variant={result.shouldReorder ? "destructive" : "default"}>
                <AlertTitle className="font-bold">
                    {result.shouldReorder ? `Reorder Recommended: ${result.reorderQuantity} ${item.unit}` : "No Reorder Needed Yet"}
                </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="font-semibold">AI Reasoning:</p>
                {result.reasoning}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {result?.shouldReorder && (
            <Button variant="default">Create Purchase Order</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
