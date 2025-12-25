import * as React from "react";

// Card Components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
      className || ""
    }`}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${
      className || ""
    }`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ""}`} {...props} />
));
CardContent.displayName = "CardContent";

// Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        className || ""
      }`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Label Component
const Label = React.forwardRef<
  React.ElementRef<"label">,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
      className || ""
    }`}
    {...props}
  />
));
Label.displayName = "Label";

// Select Components
const Select = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  React.useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            selectedValue,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    selectedValue?: string;
  }
>(
  (
    { className, children, isOpen, setIsOpen, selectedValue, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        className || ""
      }`}
      onClick={() => setIsOpen?.(!isOpen)}
      {...props}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({
  placeholder,
  selectedValue,
}: {
  placeholder?: string;
  selectedValue?: string;
}) => {
  return (
    <span className={selectedValue ? "" : "text-muted-foreground"}>
      {selectedValue || placeholder}
    </span>
  );
};

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean;
    onValueChange?: (value: string) => void;
  }
>(({ className, children, isOpen, onValueChange, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-white text-popover-foreground shadow-md ${
        className || ""
      }`}
      {...props}
    >
      <div className="p-1 max-h-60 overflow-auto">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onValueChange,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, children, value, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-2 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
      className || ""
    }`}
    onClick={() => onValueChange?.(value)}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

// Naira Symbol Component
const NairaIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold ${className || ""}`}>₦</span>
);

interface AuctionSettingsProps {
  formData: {
    startingBid: string;
    reservePrice: string;
    auctionDuration: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function AuctionSettings({
  formData,
  onInputChange,
}: AuctionSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">Auction Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startingBid">Starting Bid *</Label>
            <div className="relative">
              <NairaIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="startingBid"
                type="number"
                placeholder="0.00"
                className="pl-10"
                value={formData.startingBid}
                onChange={(e) => onInputChange("startingBid", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reservePrice">Reserve Price</Label>
            <div className="relative">
              <NairaIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="reservePrice"
                type="number"
                placeholder="0.00"
                className="pl-10"
                value={formData.reservePrice}
                onChange={(e) => onInputChange("reservePrice", e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum price you'll accept
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="auctionDuration">Auction Duration *</Label>
            <Select
              value={formData.auctionDuration}
              onValueChange={(value) => onInputChange("auctionDuration", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Select duration"
                  selectedValue={formData.auctionDuration}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="10">10 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
