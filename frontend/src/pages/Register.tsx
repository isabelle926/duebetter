import {
    type FormEvent,
    useState,
  } from "react";
  import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  import { Link, useNavigate } from "react-router-dom";
  
  import { register } from "../api/auth";
  import { ApiError } from "../api/client";
  
  export function Register() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
  
    const [displayName, setDisplayName] =
      useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] =
      useState("");
  
    const registerMutation = useMutation({
      mutationFn: register,
  
      onSuccess: (user) => {
        queryClient.setQueryData(
          ["currentUser"],
          user,
        );
  
        navigate("/");
      },
    });
  
    function handleSubmit(
      event: FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      registerMutation.mutate({
        display_name: displayName,
        email,
        password,
      });
    }
  
    const errorMessage =
      registerMutation.error instanceof ApiError
        ? registerMutation.error.message
        : registerMutation.error
          ? "Unable to create account"
          : null;
  
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              D
            </div>
  
            <h1 className="text-2xl font-semibold text-slate-900">
              Create your account
            </h1>
  
            <p className="mt-2 text-sm text-slate-500">
              Start organizing with DueBetter.
            </p>
          </div>
  
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="display-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Name
              </label>
  
              <input
                id="display-name"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
  
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
  
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
  
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
  
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
  
              <p className="mt-1.5 text-xs text-slate-400">
                At least 8 characters.
              </p>
            </div>
  
            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}
  
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registerMutation.isPending
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>
  
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }