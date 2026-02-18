import React from "react";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "home" | "settings";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors press-effect",
      isActive 
        ? "text-primary" 
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t safe-area-bottom z-40">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        <NavItem
          icon={<Home size={22} />}
          label="Home"
          isActive={activeTab === "home"}
          onClick={() => onTabChange("home")}
        />
        <NavItem
          icon={<Settings size={22} />}
          label="Settings"
          isActive={activeTab === "settings"}
          onClick={() => onTabChange("settings")}
        />
      </div>
    </nav>
  );
};
