import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.task import Task
from app.models.task_list import TaskList
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)


router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)

def get_owned_list(
    list_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session,
) -> TaskList:
    statement = select(TaskList).where(
        TaskList.id == list_id,
        TaskList.user_id == user_id,
    )

    task_list = db.scalar(statement)

    if task_list is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found",
        )

    return task_list

@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    get_owned_list(
        list_id=data.list_id,
        user_id=current_user.id,
        db=db,
    )

    task = Task(
        user_id=current_user.id,
        list_id=data.list_id,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        completed=False,
        position=data.position,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task

@router.get(
    "",
    response_model=list[TaskResponse],
)
def get_tasks(
    start_date: date | None = None,
    end_date: date | None = None,
    list_id: uuid.UUID | None = None,
    completed: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    statement = select(Task).where(
        Task.user_id == current_user.id,
    )

    if (
        start_date is not None
        and end_date is not None
        and start_date > end_date
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date cannot be after end_date",
        )

    if start_date is not None:
        statement = statement.where(
            Task.due_date >= start_date,
        )

    if end_date is not None:
        statement = statement.where(
            Task.due_date <= end_date,
        )

    if list_id is not None:
        statement = statement.where(
            Task.list_id == list_id,
        )

    if completed is not None:
        statement = statement.where(
            Task.completed == completed,
        )

    statement = statement.order_by(
        Task.due_date,
        Task.position,
        Task.created_at,
    )

    return list(db.scalars(statement).all())

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id,
    )

    task = db.scalar(statement)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task

@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: uuid.UUID,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id,
    )

    task = db.scalar(statement)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    updates = data.model_dump(exclude_unset=True)

    if "list_id" in updates:
        get_owned_list(
            list_id=updates["list_id"],
            user_id=current_user.id,
            db=db,
        )

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task

@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id,
    )

    task = db.scalar(statement)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )