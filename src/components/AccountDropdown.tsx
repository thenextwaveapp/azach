import { User, LogIn, Heart, Package, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const AccountDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-muted hover:text-foreground">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[160px]">
        {isAuthenticated ? (
          <>
            <DropdownMenuLabel className="px-3 py-2">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="px-3">
              <Link to="/account" className="flex items-center cursor-pointer w-full">
                <User className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-3">
              <Link to="/orders" className="flex items-center cursor-pointer w-full">
                <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-3">
              <Link to="/wishlist" className="flex items-center cursor-pointer w-full">
                <Heart className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Wishlist</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-3">
              <Link to="/settings" className="flex items-center cursor-pointer w-full">
                <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user?.email === "admin@azach.com" || user?.email?.includes("admin") ? (
              <DropdownMenuItem asChild className="px-3">
                <Link to="/admin" className="flex items-center cursor-pointer w-full">
                  <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="text-destructive px-3" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>Logout</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="px-3 py-2">Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="px-3">
              <Link to="/login" className="flex items-center cursor-pointer w-full">
                <LogIn className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Login</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-3">
              <Link to="/register" className="flex items-center cursor-pointer w-full">
                <User className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

