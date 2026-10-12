import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  import { useNavigate } from "react-router-dom";
  
  import { logout } from "../../api/auth";
  import type { User } from "../../types/api";
  
  interface HeaderProps {
    user: User;
  }
  
  export function Header({
    user,
  }: HeaderProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
  
    const logoutMutation = useMutation({
      mutationFn: logout,
  
      onSuccess: () => {
        queryClient.clear();
        navigate("/login");
      },
    });
  
    const initial =
      user.display_name.trim().charAt(0).toUpperCase() ||
      "U";
  
    return (
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
            D
          </div>
  
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            DueBetter
          </h1>
        </div>
  
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:block">
            {user.display_name}
          </span>
  
          <button
            type="button"
            onClick={() =>
              logoutMutation.mutate()
            }
            disabled={logoutMutation.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            aria-label={`Log out ${user.display_name}`}
            title="Log out"
          >
            {initial}
          </button>
        </div>
      </header>
    );
  }