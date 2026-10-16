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
  import type { TaskList } from "../../types/taskList";
  import { DayModal } from "./DayModal";
  
  
  const lists: TaskList[] = [
    {
      id: "school",
      name: "School",
      color: "#6366F1",
      position: 0,
    },
  ];
  
  
  const tasks: Task[] = [
    {
      id: "task-1",
      title: "Algorithms homework",
      description: null,
      due_date: "2026-10-20",
      completed: false,
      list_id: "school",
      sticker_id: null,
      position: 0,
    },
    {
      id: "task-2",
      title: "Different day",
      description: null,
      due_date: "2026-10-21",
      completed: false,
      list_id: "school",
      sticker_id: null,
      position: 0,
    },
  ];
  
  
  describe("DayModal", () => {
    it("only shows tasks for the selected date", () => {
      render(
        <DayModal
          date={
            new Date(
              2026,
              9,
              20,
            )
          }
          tasks={tasks}
          lists={lists}
          stickers={[]}
          onAddTask={vi.fn()}
          onEditTask={vi.fn()}
          onToggleTask={vi.fn()}
          onClose={vi.fn()}
        />,
      );
  
      expect(
        screen.getByText(
          "Algorithms homework",
        ),
      ).toBeInTheDocument();
  
      expect(
        screen.queryByText(
          "Different day",
        ),
      ).not.toBeInTheDocument();
    });
  
  
    it("allows adding a task", () => {
      const onAddTask = vi.fn();
  
      render(
        <DayModal
          date={
            new Date(
              2026,
              9,
              20,
            )
          }
          tasks={tasks}
          lists={lists}
          stickers={[]}
          onAddTask={onAddTask}
          onEditTask={vi.fn()}
          onToggleTask={vi.fn()}
          onClose={vi.fn()}
        />,
      );
  
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: "+ Add task",
          },
        ),
      );
  
      expect(
        onAddTask,
      ).toHaveBeenCalledOnce();
    });
  });