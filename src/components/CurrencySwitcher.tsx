import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DollarSign } from 'lucide-react';

export const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 hover:bg-muted hover:text-foreground">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setCurrency('USD')}
          className={currency === 'USD' ? 'bg-muted' : ''}
        >
          <div className="flex flex-col">
            <span className="font-medium">USD - US Dollar</span>
            <span className="text-xs text-muted-foreground">United States</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setCurrency('CAD')}
          className={currency === 'CAD' ? 'bg-muted' : ''}
        >
          <div className="flex flex-col">
            <span className="font-medium">CAD - Canadian Dollar</span>
            <span className="text-xs text-muted-foreground">Canada</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
