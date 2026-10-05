import { useCurrency, isNaijaSite, type CurrencyCode } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DollarSign } from 'lucide-react';

const OPTIONS: { code: CurrencyCode; label: string; country: string }[] = [
  { code: 'USD', label: 'USD - US Dollar', country: 'United States' },
  { code: 'CAD', label: 'CAD - Canadian Dollar', country: 'Canada' },
  { code: 'GBP', label: 'GBP - British Pound', country: 'United Kingdom' },
  { code: 'EUR', label: 'EUR - Euro', country: 'Europe' },
  { code: 'AUD', label: 'AUD - Australian Dollar', country: 'Australia' },
];

export const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();

  // azach.ng browses NGN-only — no other currency is offered there.
  if (isNaijaSite()) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 hover:bg-muted hover:text-foreground">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm font-medium">{currency}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setCurrency(option.code)}
            className={currency === option.code ? 'bg-muted' : ''}
          >
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.country}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
