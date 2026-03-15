import React, { useState, useCallback } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { GroceryList, GroceryItem } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface GroceryListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groceryList: GroceryList | null;
  onToggleItem: (listId: string, itemId: string) => void;
  onAddItem: (listId: string, name: string, quantity?: number) => void;
  onRemoveItem: (listId: string, itemId: string) => void;
  onUpdateQuantity: (listId: string, itemId: string, quantity: number | undefined) => void;
}

export const GroceryListSheet: React.FC<GroceryListSheetProps> = ({
  open,
  onOpenChange,
  groceryList,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  const [newItemText, setNewItemText] = useState("");

  const handleAddItem = useCallback(() => {
    const text = newItemText.trim();
    if (!text || !groceryList) return;
    // Parse quantity prefix: "3 bananas"
    const qtyMatch = text.match(/^(\d+)\s+(.+)$/);
    if (qtyMatch) {
      onAddItem(groceryList.listId, qtyMatch[2], parseInt(qtyMatch[1]));
    } else {
      onAddItem(groceryList.listId, text);
    }
    setNewItemText("");
  }, [newItemText, groceryList, onAddItem]);

  if (!groceryList) return null;

  const activeItems = groceryList.items.filter(i => i.status === "active");
  const completedItems = groceryList.items.filter(i => i.status === "completed");
  const remaining = activeItems.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-accent" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold">Buy groceries</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {remaining} item{remaining !== 1 ? "s" : ""} remaining
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Add new item */}
        <div className="flex gap-2 mb-5">
          <Input
            placeholder="Add item (e.g. 3 bananas)"
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
            className="flex-1 text-sm"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={handleAddItem}
            disabled={!newItemText.trim()}
            className="shrink-0"
          >
            <Plus size={18} />
          </Button>
        </div>

        {/* Active items */}
        {activeItems.length > 0 && (
          <div className="space-y-1 mb-4">
            {activeItems.map(item => (
              <GroceryItemRow
                key={item.id}
                item={item}
                listId={groceryList.listId}
                onToggle={onToggleItem}
                onRemove={onRemoveItem}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        )}

        {/* Completed items */}
        {completedItems.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Done ({completedItems.length})
            </p>
            <div className="space-y-1">
              {completedItems.map(item => (
                <GroceryItemRow
                  key={item.id}
                  item={item}
                  listId={groceryList.listId}
                  onToggle={onToggleItem}
                  onRemove={onRemoveItem}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
          </div>
        )}

        {groceryList.items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No items yet</p>
            <p className="text-xs mt-1">Add items above or use voice capture</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const GroceryItemRow: React.FC<{
  item: GroceryItem;
  listId: string;
  onToggle: (listId: string, itemId: string) => void;
  onRemove: (listId: string, itemId: string) => void;
  onUpdateQuantity: (listId: string, itemId: string, quantity: number | undefined) => void;
}> = ({ item, listId, onToggle, onRemove, onUpdateQuantity }) => {
  const isCompleted = item.status === "completed";

  return (
    <div className={cn(
      "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors",
      "hover:bg-secondary/50 group"
    )}>
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(listId, item.id)}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium transition-all",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {item.name}
          {item.quantity && (
            <span className="text-muted-foreground font-normal ml-1.5">× {item.quantity}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isCompleted && item.quantity && item.quantity > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => onUpdateQuantity(listId, item.id, (item.quantity || 1) - 1)}
          >
            <Minus size={14} />
          </Button>
        )}
        {!isCompleted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => onUpdateQuantity(listId, item.id, (item.quantity || 0) + 1)}
          >
            <Plus size={14} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(listId, item.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
