import {
    fireEvent,
    render,
    screen,
  } from "@testing-library/react";
  import {
    describe,
    expect,
    it,
    vi,
  } from "vitest";
  
  import { ConfirmModal } from "./ConfirmModal";
  
  
  describe("ConfirmModal", () => {
    it("shows the confirmation message", () => {
      render(
        <ConfirmModal
          title="Delete task?"
          message="This task will be deleted."
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />,
      );
  
      expect(
        screen.getByText(
          "This task will be deleted.",
        ),
      ).toBeInTheDocument();
    });
  
  
    it("calls onConfirm", () => {
      const onConfirm = vi.fn();
  
      render(
        <ConfirmModal
          title="Delete task?"
          message="Delete it?"
          onConfirm={onConfirm}
          onClose={vi.fn()}
        />,
      );
  
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: "Delete",
          },
        ),
      );
  
      expect(
        onConfirm,
      ).toHaveBeenCalledOnce();
    });
  
  
    it("calls onClose when cancelled", () => {
      const onClose = vi.fn();
  
      render(
        <ConfirmModal
          title="Delete task?"
          message="Delete it?"
          onConfirm={vi.fn()}
          onClose={onClose}
        />,
      );
  
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: "Cancel",
          },
        ),
      );
  
      expect(
        onClose,
      ).toHaveBeenCalledOnce();
    });
  });