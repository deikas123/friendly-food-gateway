
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getUserWallet, createWalletIfNotExist } from "@/services/walletService";
import { Wallet } from "@/types/wallet";
import { RefreshCw, Wallet as WalletIcon } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";

interface WalletPaymentOptionProps {
  totalAmount: number;
  onWalletSelect: (selected: boolean) => void;
}

const WalletPaymentOption = ({ totalAmount, onWalletSelect }: WalletPaymentOptionProps) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useWallet, setUseWallet] = useState(false);
  const hasEnoughBalance = wallet ? wallet.balance >= totalAmount : false;

  const fetchWallet = async () => {
    setIsLoading(true);
    try {
      let walletData = await getUserWallet();
      
      // If no wallet exists, create one
      if (!walletData) {
        walletData = await createWalletIfNotExist();
      }
      
      setWallet(walletData);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);
  
  const handleWalletToggle = (value: string) => {
    const selected = value === "wallet";
    setUseWallet(selected);
    onWalletSelect(selected);
  };

  const handleRefresh = () => {
    fetchWallet();
  };

  return (
    <RadioGroup className="space-y-3" onValueChange={handleWalletToggle} value={useWallet ? "wallet" : "regular"}>
      <div
        className={`flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50 ${useWallet ? 'border-primary bg-accent/30' : ''}`}
      >
        <RadioGroupItem value="wallet" id="wallet" className="mt-1" disabled={isLoading || !hasEnoughBalance} />
        <div className="flex-1">
          <Label 
            htmlFor="wallet"
            className="flex items-center cursor-pointer"
          >
            <WalletIcon className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium">Pay with Wallet</span>
          </Label>
          
          {isLoading ? (
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-1 ml-7"></div>
          ) : (
            <div className="text-sm mt-1 ml-7 flex items-center justify-between">
              <p className="text-muted-foreground">
                {hasEnoughBalance 
                  ? `Available balance: ${formatCurrency(wallet?.balance || 0)}`
                  : `Insufficient balance: ${formatCurrency(wallet?.balance || 0)} (Need ${formatCurrency(totalAmount)})`
                }
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                className="text-primary flex items-center text-xs h-auto p-1"
              >
                <RefreshCw size={12} className="mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div
        className={`flex items-start space-x-2 border rounded-lg p-4 transition-colors hover:bg-accent/50 ${!useWallet ? 'border-primary bg-accent/30' : ''}`}
      >
        <RadioGroupItem value="regular" id="regular" className="mt-1" />
        <div className="flex-1">
          <Label 
            htmlFor="regular"
            className="flex items-center cursor-pointer"
          >
            <span className="font-medium">Pay with Other Methods</span>
          </Label>
          <p className="text-sm text-muted-foreground mt-1">Choose from available payment methods</p>
        </div>
      </div>
    </RadioGroup>
  );
};

export default WalletPaymentOption;
