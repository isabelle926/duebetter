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
  
  import type { Task } from "../../types/task";
  import { TaskItem } from "./TaskItem";
  
  
  const task: Task = {
    id: "task-1",
    title: "Finish homework",
    description: null,
    due_date: "2026-10-20",
    completed: false,
    list_id: "list-1",
    sticker_id: null,
    position: 0,
  };
  
  
  describe("TaskItem", () => {
    it("renders the task title", () => {
      render(
        <TaskItem
          task={task}
          onToggle={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
  
      expect(
        screen.getByText(
          "Finish homework",
        ),
      ).toBeInTheDocument();
    });
  
  
    it("toggles the task", () => {
      const onToggle = vi.fn();
  
      render(
        <TaskItem
          task={task}
          onToggle={onToggle}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
  
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: (
              "Mark Finish homework complete"
            ),
          },
        ),
      );
  
      expect(
        onToggle,
      ).toHaveBeenCalledWith(
        "task-1",
      );
    });
  
  
    it("opens editing when task is clicked", () => {
      const onEdit = vi.fn();
    
      render(
        <TaskItem
          task={task}
          onToggle={vi.fn()}
          onEdit={onEdit}
          onDelete={vi.fn()}
        />,
      );
    
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: "Edit Finish homework",
          },
        ),
      );
    
      expect(
        onEdit,
      ).toHaveBeenCalledWith(
        task,
      );
    });
  
  
    it("requests deletion", () => {
      const onDelete = vi.fn();
  
      render(
        <TaskItem
          task={task}
          onToggle={vi.fn()}
          onEdit={vi.fn()}
          onDelete={onDelete}
        />,
      );
  
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: (
              "Delete Finish homework"
            ),
          },
        ),
      );
  
      expect(
        onDelete,
      ).toHaveBeenCalledWith(
        "task-1",
      );
    });
  });