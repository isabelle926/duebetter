import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useNavigate,
} from "react-router-dom";

import {
  logout,
} from "../../api/auth";
import type {
  User,
} from "../../types/api";

interface HeaderProps {
  user: User;
  onOpenStickers: () => void;
  onEditProfile: () => void;
}

export function Header({
  user,
  onOpenStickers,
  onEditProfile,
}: HeaderProps) {
  const navigate = useNavigate();
  const queryClient =
    useQueryClient();

  const [
    isProfileMenuOpen,
    setIsProfileMenuOpen,
  ] = useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const logoutMutation =
    useMutation({
      mutationFn: logout,

      onSuccess: () => {
        queryClient.clear();
        navigate("/login");
      },
    });

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      const target =
        event.target;

      if (
        target instanceof Node
        && !menuRef.current
          ?.contains(target)
      ) {
        setIsProfileMenuOpen(
          false,
        );
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setIsProfileMenuOpen(
          false,
        );
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isProfileMenuOpen]);

  const initial =
    user.display_name
      .trim()
      .charAt(0)
      .toUpperCase()
    || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
          D
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          DueBetter
        </h1>
      </div>

      <div
        ref={menuRef}
        className="relative flex items-center gap-3"
      >
        <span className="hidden text-sm text-slate-500 sm:block">
          {user.display_name}
        </span>

        <button
          type="button"
          onClick={() =>
            setIsProfileMenuOpen(
              (current) =>
                !current,
            )
          }
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700 transition hover:ring-2 hover:ring-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open profile menu"
          aria-expanded={
            isProfileMenuOpen
          }
          aria-haspopup="menu"
        >
          {user.avatar_url ? (
            <img
              src={
                user.avatar_url
              }
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </button>

        {isProfileMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user.display_name}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {user.email}
              </p>
            </div>

            <div className="p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsProfileMenuOpen(
                    false,
                  );

                  onEditProfile();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Edit profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsProfileMenuOpen(
                    false,
                  );

                  onOpenStickers();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                My stickers
              </button>
            </div>

            <div className="border-t border-slate-100 p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  logoutMutation
                    .mutate()
                }
                disabled={
                  logoutMutation
                    .isPending
                }
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {logoutMutation
                  .isPending
                  ? "Logging out..."
                  : "Log out"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}