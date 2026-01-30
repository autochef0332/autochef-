import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Eye, EyeOff, RefreshCw, Key } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SecretKeyCardProps {
  secretKey: string;
  onReset: () => void;
  isResetting?: boolean;
}

export function SecretKeyCard({ secretKey, onReset, isResetting }: SecretKeyCardProps) {
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      toast.success("Secret key copied to clipboard!");
    } catch {
      toast.error("Failed to copy secret key");
    }
  };

  const maskedKey = showKey ? secretKey : secretKey.replace(/./g, "•");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Restaurant Secret Key
        </CardTitle>
        <CardDescription>
          Use this key to connect your kitchen and delivery systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={maskedKey}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowKey(!showKey)}
            title={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            title="Copy key"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isResetting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? "animate-spin" : ""}`} />
              Reset Secret Key
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Secret Key?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All connected systems (kitchen, delivery) 
                will be disconnected and will need to be reconfigured with the new key.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onReset}>
                Reset Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
