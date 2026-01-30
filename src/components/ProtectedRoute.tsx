"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRestaurant, isLoading: restaurantLoading } = useRestaurant();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    } else if (user && !restaurantLoading && !hasRestaurant) {
      router.replace("/setup");
    }
  }, [user, authLoading, restaurantLoading, hasRestaurant, router]);

  if (authLoading || (user && restaurantLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasRestaurant) {
    return null;
  }

  return <>{children}</>;
}

export function AuthRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}

export function SetupRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRestaurant, isLoading: restaurantLoading } = useRestaurant();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    } else if (user && !restaurantLoading && hasRestaurant) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, restaurantLoading, hasRestaurant, router]);

  if (authLoading || (user && restaurantLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || hasRestaurant) {
    return null;
  }

  return <>{children}</>;
}
