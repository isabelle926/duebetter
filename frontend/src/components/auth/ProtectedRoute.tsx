import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { ApiError } from "../../api/client";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const currentUserQuery = useCurrentUser();

  if (currentUserQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading DueBetter...
      </div>
    );
  }

  if (
    currentUserQuery.error instanceof ApiError &&
    currentUserQuery.error.status === 401
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (currentUserQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-red-600">
          Unable to load your account.
        </p>
      </div>
    );
  }

  return children;
}