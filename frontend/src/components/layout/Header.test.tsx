import {
    fireEvent,
    render,
    screen,
  } from "@testing-library/react";
  import {
    QueryClient,
    QueryClientProvider,
  } from "@tanstack/react-query";
  import {
    MemoryRouter,
  } from "react-router-dom";
  import {
    describe,
    expect,
    it,
    vi,
  } from "vitest";
  
  import {
    Header,
  } from "./Header";
  
  
  const user = {
    id: "user-1",
    email: "test@example.com",
    display_name: "Test User",
    avatar_url: null,
    created_at: (
      "2026-10-19T12:00:00Z"
    ),
  };
  
  
  function renderHeader() {
    const queryClient =
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      });
  
    const onEditProfile =
      vi.fn();
  
    const onOpenStickers =
      vi.fn();
  
    render(
      <QueryClientProvider
        client={queryClient}
      >
        <MemoryRouter>
          <Header
            user={user}
            onEditProfile={
              onEditProfile
            }
            onOpenStickers={
              onOpenStickers
            }
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  
    return {
      onEditProfile,
      onOpenStickers,
    };
  }
  
  
  describe("Header", () => {
    it(
      "opens the profile menu",
      () => {
        renderHeader();
  
        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: (
                "Open profile menu"
              ),
            },
          ),
        );
  
        expect(
          screen.getByText(
            "Edit profile",
          ),
        ).toBeInTheDocument();
  
        expect(
          screen.getByText(
            "My stickers",
          ),
        ).toBeInTheDocument();
  
        expect(
          screen.getByText(
            "Log out",
          ),
        ).toBeInTheDocument();
      },
    );
  
    it(
      "opens profile editing",
      () => {
        const {
          onEditProfile,
        } = renderHeader();
  
        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: (
                "Open profile menu"
              ),
            },
          ),
        );
  
        fireEvent.click(
          screen.getByRole(
            "menuitem",
            {
              name: (
                "Edit profile"
              ),
            },
          ),
        );
  
        expect(
          onEditProfile,
        ).toHaveBeenCalledOnce();
      },
    );
  
    it(
      "opens sticker library",
      () => {
        const {
          onOpenStickers,
        } = renderHeader();
  
        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: (
                "Open profile menu"
              ),
            },
          ),
        );
  
        fireEvent.click(
          screen.getByRole(
            "menuitem",
            {
              name: (
                "My stickers"
              ),
            },
          ),
        );
  
        expect(
          onOpenStickers,
        ).toHaveBeenCalledOnce();
      },
    );
  
    it(
      "uses the display name initial when there is no avatar",
      () => {
        renderHeader();
  
        expect(
          screen.getByRole(
            "button",
            {
              name: (
                "Open profile menu"
              ),
            },
          ),
        ).toHaveTextContent(
          "T",
        );
      },
    );
  });