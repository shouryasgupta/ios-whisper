export type TaskKind = "action" | "note" | "draft" | "grocery";

export type NudgeType = "sign-in" | "watch-setup" | "watch-usage";

export type ActivationState =
  | "new_no_capture"
  | "anonymous_active"
  | "signed_in_no_watch"
  | "watch_enabled_inactive"
  | "watch_active"
  | "power_user";

export interface NudgeDismissState {
  dismissCount: number;
  lastDismissedAt: number | null;
  lastShownAt: number | null;
}

export type ReminderTime = 
  | { type: "specific"; date: Date }
  | { type: "anytime" }
  | { type: "none" };

export type CaptureStatus = "waiting" | "processing" | "failed" | "zero_tasks" | "done";

export interface Capture {
  id: string;
  capturedAt: Date;
  durationSeconds: number;
  status: CaptureStatus;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity?: number;
  status: "active" | "completed";
  addedAt: Date;
  updatedAt: Date;
}

export interface GroceryList {
  listId: string;
  taskId: string;
  createdAt: Date;
  lastModifiedAt: Date;
  items: GroceryItem[];
}

export interface Task {
  id: string;
  summary: string;
  fullText: string;
  kind: TaskKind;
  reminder: ReminderTime;
  hasAudio: boolean;
  captureId?: string;
  hasChecklist: boolean;
  checklistItems?: string[];
  isBuyIntent: boolean;
  buyLink?: string;
  createdAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  groceryListId?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isSignedIn: boolean;
  watchCaptureEnabled: boolean;
  watchEnabledAt: number | null;
  watchCaptures: number;
}

export interface AppState {
  tasks: Task[];
  captures: Capture[];
  groceryLists: GroceryList[];
  user: User | null;
  captureCount: number;
  showSignInPrompt: boolean;
}

// Known grocery items for implicit detection
const GROCERY_KEYWORDS = new Set([
  "banana", "bananas", "apple", "apples", "carrot", "carrots", "spinach",
  "milk", "bread", "eggs", "egg", "cooking oil", "oil", "rice", "yogurt",
  "cheese", "butter", "chicken", "beef", "pork", "fish", "salmon", "shrimp",
  "tomato", "tomatoes", "potato", "potatoes", "onion", "onions", "garlic",
  "lettuce", "cucumber", "pepper", "peppers", "broccoli", "avocado",
  "strawberry", "strawberries", "blueberry", "blueberries", "grape", "grapes",
  "orange", "oranges", "lemon", "lemons", "lime", "limes", "mango", "mangoes",
  "pineapple", "watermelon", "peach", "peaches", "pear", "pears",
  "celery", "mushroom", "mushrooms", "corn", "beans", "peas",
  "pasta", "noodles", "flour", "sugar", "salt", "cereal", "oats", "oatmeal",
  "juice", "water", "soda", "coffee", "tea", "cream", "sour cream",
  "ketchup", "mustard", "mayo", "mayonnaise", "salsa", "soy sauce",
  "olive oil", "vinegar", "honey", "jam", "jelly", "peanut butter",
  "chips", "crackers", "cookies", "ice cream", "frozen pizza",
  "bacon", "sausage", "ham", "turkey", "deli meat",
  "tofu", "almond milk", "oat milk", "coconut milk",
  "cilantro", "parsley", "basil", "oregano", "thyme",
  "tortillas", "wraps", "buns", "rolls",
]);

export interface GroceryIntentResult {
  type: "add_grocery" | "remove_grocery" | "update_grocery" | "view_grocery" | "not_grocery";
  items: { name: string; quantity?: number }[];
  isExplicit: boolean; // user said "my grocery list"
}

export function detectGroceryIntent(text: string): GroceryIntentResult {
  const lower = text.toLowerCase().trim();
  const notGrocery: GroceryIntentResult = { type: "not_grocery", items: [], isExplicit: false };

  const isExplicit = /\b(my |the )?(grocery list|shopping list)\b/i.test(lower);

  // View grocery list
  if (/\b(what'?s on|show|open|view)\b.*\b(grocery|shopping)\s*list\b/i.test(lower)) {
    return { type: "view_grocery", items: [], isExplicit: true };
  }

  // Remove from grocery list (explicit only)
  const removeMatch = lower.match(/\bremove\s+(.+?)\s+(from)\b/i);
  if (removeMatch && isExplicit) {
    const itemName = removeMatch[1].replace(/\b(my|the)\b/g, "").trim();
    return { type: "remove_grocery", items: [{ name: itemName }], isExplicit: true };
  }

  // Update quantity (explicit only)
  const updateMatch = lower.match(/\bupdate\s+(.+?)\s+to\s+(\d+)\b/i);
  if (updateMatch && isExplicit) {
    return { type: "update_grocery", items: [{ name: updateMatch[1].trim(), quantity: parseInt(updateMatch[2]) }], isExplicit: true };
  }

  // Add to grocery list — explicit
  const addExplicitMatch = lower.match(/\b(?:add)\s+(.+?)\s+(?:to)\s+(?:my |the )?(?:grocery|shopping)\s*list\b/i);
  if (addExplicitMatch) {
    const items = parseItemList(addExplicitMatch[1]);
    return { type: "add_grocery", items, isExplicit: true };
  }

  // Buy/get items — check if grocery
  const buyMatch = lower.match(/\b(?:buy|get|pick up|grab)\s+(.+?)$/i);
  if (buyMatch) {
    const rawItems = buyMatch[1]
      .replace(/\s*(tomorrow|today|tonight|this weekend|after work|on \w+day)\s*/gi, "")
      .trim();
    const items = parseItemList(rawItems);
    
    if (isExplicit) {
      return { type: "add_grocery", items, isExplicit: true };
    }

    // Implicit detection: check if any item is a known grocery item
    const groceryCount = items.filter(item => {
      const words = item.name.toLowerCase().split(/\s+/);
      return words.some(w => GROCERY_KEYWORDS.has(w)) || GROCERY_KEYWORDS.has(item.name.toLowerCase());
    }).length;

    // If majority of items are grocery, treat all as grocery
    if (items.length > 0 && groceryCount >= 1 && (groceryCount / items.length >= 0.5 || items.length >= 2)) {
      return { type: "add_grocery", items, isExplicit: false };
    }

    // Single ambiguous item — not grocery
    if (items.length === 1 && groceryCount === 0) {
      return notGrocery;
    }
  }

  return notGrocery;
}

function parseItemList(raw: string): { name: string; quantity?: number }[] {
  // Split by comma, "and", "&"
  const parts = raw.split(/,\s*|\s+and\s+|\s*&\s*/i).map(s => s.trim()).filter(Boolean);
  return parts.map(part => {
    const qtyMatch = part.match(/^(\d+)\s+(.+)$/);
    if (qtyMatch) {
      return { name: qtyMatch[2].trim(), quantity: parseInt(qtyMatch[1]) };
    }
    return { name: part };
  });
}


// Sample transcriptions for simulated voice capture
export const sampleTranscriptions = [
  "Pick up groceries on the way home - milk, eggs, and bread",
  "Call mom to wish her happy birthday tomorrow at 2pm",
  "Remember to send the quarterly report to Sarah by Friday",
  "Buy birthday present for Jake's party next Saturday",
  "Schedule dentist appointment for next week",
  "Don't forget to water the plants when I get home",
  "Meeting with the design team at 10am tomorrow",
  "Order new running shoes - need them for the marathon",
  "Take the car for oil change on Thursday morning",
  "Remind me to pay the electricity bill by the 15th",
];

export const generateMockTask = (text: string, hasAudio: boolean = true, captureId?: string): Task => {
  const isBuyIntent = text.toLowerCase().includes("buy") || text.toLowerCase().includes("order");
  const hasTime = text.toLowerCase().includes("tomorrow") || 
                  text.toLowerCase().includes("am") || 
                  text.toLowerCase().includes("pm") ||
                  text.match(/\d{1,2}(:\d{2})?/);
  
  const now = new Date();
  let reminder: ReminderTime = { type: "anytime" };
  
  if (hasTime) {
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() + 1);
    reminderDate.setHours(14, 0, 0, 0);
    reminder = { type: "specific", date: reminderDate };
  }

  return {
    id: crypto.randomUUID(),
    summary: text.length > 60 ? text.slice(0, 57) + "..." : text,
    fullText: text,
    kind: "action",
    reminder,
    hasAudio,
    captureId,
    hasChecklist: text.includes(" - ") || text.includes(","),
    checklistItems: text.includes(",") ? text.split(" - ").pop()?.split(",").map(s => s.trim()) : undefined,
    isBuyIntent,
    buyLink: isBuyIntent ? `https://www.amazon.com/s?k=${encodeURIComponent(text.split("buy ")[1] || text)}` : undefined,
    createdAt: now,
    isCompleted: false,
  };
};
