import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.task_list import TaskList
from app.models.user import User
from app.schemas.task_list import (
    TaskListCreate,
    TaskListResponse,
    TaskListUpdate,
)


router = APIRouter(
    prefix="/lists",
    tags=["lists"],
)

@router.post(
    "",
    response_model=TaskListResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_list(
    data: TaskListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskList:
    task_list = TaskList(
        user_id=current_user.id,
        name=data.name,
        color=data.color,
        position=data.position,
    )

    db.add(task_list)
    db.commit()
    db.refresh(task_list)

    return task_list

@router.get(
    "",
    response_model=list[TaskListResponse],
)
def get_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskList]:
    statement = (
        select(TaskList)
        .where(TaskList.user_id == current_user.id)
        .order_by(TaskList.position, TaskList.created_at)
    )

    return list(db.scalars(statement).all())

@router.get(
    "/{list_id}",
    response_model=TaskListResponse,
)
def get_list(
    list_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskList:
    statement = select(TaskList).where(
        TaskList.id == list_id,
        TaskList.user_id == current_user.id,
    )

    task_list = db.scalar(statement)

    if task_list is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found",
        )

    return task_list

@router.patch(
    "/{list_id}",
    response_model=TaskListResponse,
)
def update_list(
    list_id: uuid.UUID,
    data: TaskListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskList:
    statement = select(TaskList).where(
        TaskList.id == list_id,
        TaskList.user_id == current_user.id,
    )

    task_list = db.scalar(statement)

    if task_list is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found",
        )

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(task_list, field, value)

    db.commit()
    db.refresh(task_list)

    return task_list

@router.delete(
    "/{list_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_list(
    list_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    statement = select(TaskList).where(
        TaskList.id == list_id,
        TaskList.user_id == current_user.id,
    )

    task_list = db.scalar(statement)

    if task_list is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found",
        )

    db.delete(task_list)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )

