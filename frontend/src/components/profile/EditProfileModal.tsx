import {
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useState,
  } from "react";
  import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    ApiError,
  } from "../../api/client";
  import {
    deleteAvatar,
    updateProfile,
    uploadAvatar,
  } from "../../api/profile";
  import type {
    User,
  } from "../../types/api";
  import {
    Modal,
  } from "../ui/Modal";
  
  interface EditProfileModalProps {
    user: User;
    onClose: () => void;
  }
  
  export function EditProfileModal({
    user,
    onClose,
  }: EditProfileModalProps) {
    const queryClient =
      useQueryClient();
  
    const [
      displayName,
      setDisplayName,
    ] = useState(
      user.display_name,
    );
  
    const [
      avatarFile,
      setAvatarFile,
    ] = useState<File | null>(
      null,
    );
  
    const [
      previewUrl,
      setPreviewUrl,
    ] = useState<string | null>(
      null,
    );
  
    useEffect(() => {
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl,
          );
        }
      };
    }, [previewUrl]);
  
    const profileMutation =
      useMutation({
        mutationFn: updateProfile,
      });
  
    const avatarMutation =
      useMutation({
        mutationFn: uploadAvatar,
      });
  
    const deleteAvatarMutation =
      useMutation({
        mutationFn: deleteAvatar,
      });
  
    function handleFileChange(
      event:
        ChangeEvent<HTMLInputElement>,
    ) {
      const selectedFile =
        event.target.files?.[0]
        ?? null;
  
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
  
      setAvatarFile(
        selectedFile,
      );
  
      setPreviewUrl(
        selectedFile
          ? URL.createObjectURL(
              selectedFile,
            )
          : null,
      );
    }
  
    async function handleSubmit(
      event:
        FormEvent<HTMLFormElement>,
    ) {
      event.preventDefault();
  
      const trimmedName =
        displayName.trim();
  
      if (!trimmedName) {
        return;
      }
  
      try {
        await profileMutation.mutateAsync({
          display_name:
            trimmedName,
        });
  
        if (avatarFile) {
          await avatarMutation.mutateAsync(
            avatarFile,
          );
        }
  
        await queryClient.invalidateQueries({
          queryKey: [
            "currentUser",
          ],
        });
  
        onClose();
      } catch {
        // Mutation state displays the
        // relevant error below.
      }
    }
  
    async function handleDeleteAvatar() {
      try {
        await deleteAvatarMutation
          .mutateAsync();
  
        setAvatarFile(null);
  
        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl,
          );
  
          setPreviewUrl(null);
        }
  
        await queryClient.invalidateQueries({
          queryKey: [
            "currentUser",
          ],
        });
      } catch {
        // Mutation state displays the
        // relevant error below.
      }
    }
  
    const mutationError =
      profileMutation.error
      ?? avatarMutation.error
      ?? deleteAvatarMutation.error;
  
    const errorMessage =
      mutationError
        instanceof ApiError
        ? mutationError.message
        : mutationError
          ? (
              "Unable to update "
              + "your profile."
            )
          : null;
  
    const displayedAvatar =
      previewUrl
      ?? user.avatar_url;
  
    const initial =
      user.display_name
        .trim()
        .charAt(0)
        .toUpperCase()
      || "U";
  
    const isPending =
      profileMutation.isPending
      || avatarMutation.isPending
      || deleteAvatarMutation
        .isPending;
  
    return (
      <Modal
        title="Edit profile"
        onClose={onClose}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="flex flex-col items-center">
            {displayedAvatar ? (
              <img
                src={
                  displayedAvatar
                }
                alt="Profile preview"
                className="h-24 w-24 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
                {initial}
              </div>
            )}
  
            <label
              htmlFor="profile-avatar"
              className="mt-3 cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Choose image
            </label>
  
            <input
              id="profile-avatar"
              type="file"
              accept="image/png,image/webp"
              onChange={
                handleFileChange
              }
              className="sr-only"
            />
  
            <p className="mt-2 text-xs text-slate-400">
              PNG or WebP, up to
              2 MB.
            </p>
  
            {user.avatar_url
              && !avatarFile && (
                <button
                  type="button"
                  onClick={() => {
                    void handleDeleteAvatar();
                  }}
                  disabled={
                    isPending
                  }
                  className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Remove profile picture
                </button>
              )}
          </div>
  
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Display name
            </label>
  
            <input
              id="profile-name"
              type="text"
              required
              maxLength={100}
              value={
                displayName
              }
              onChange={(event) =>
                setDisplayName(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
  
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </span>
  
            <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
              {user.email}
            </p>
  
            <p className="mt-1 text-xs text-slate-400">
              Email changes are not
              currently supported.
            </p>
          </div>
  
          {errorMessage && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {errorMessage}
            </p>
          )}
  
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={
                isPending
              }
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
  
            <button
              type="submit"
              disabled={
                isPending
                || !displayName.trim()
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </Modal>
    );
  }