from fastapi.testclient import TestClient


def register(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    assert response.status_code == 201


def create_list(
    client: TestClient,
) -> str:
    response = client.post(
        "/api/lists",
        json={
            "name": "School",
            "color": "#6366F1",
            "position": 0,
        },
    )

    assert response.status_code == 201

    return response.json()["id"]


def create_task(
    client: TestClient,
    list_id: str,
    *,
    title: str = "Study",
    due_date: str = "2026-10-20",
) -> dict:
    response = client.post(
        "/api/tasks",
        json={
            "list_id": list_id,
            "title": title,
            "due_date": due_date,
            "position": 0,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_task(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)

    response = client.post(
        "/api/tasks",
        json={
            "list_id": list_id,
            "title": (
                "Finish algorithms homework"
            ),
            "description": (
                "Problems 1 through 6"
            ),
            "due_date": "2026-10-20",
            "position": 0,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["title"]
        == "Finish algorithms homework"
    )
    assert data["completed"] is False
    assert data["list_id"] == list_id


def test_get_task(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)

    task = create_task(
        client,
        list_id,
    )

    response = client.get(
        f"/api/tasks/{task['id']}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == task["id"]


def test_update_task(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)
    task = create_task(client, list_id)

    response = client.patch(
        f"/api/tasks/{task['id']}",
        json={
            "title": "Updated task",
            "due_date": "2026-10-25",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated task"
    assert data["due_date"] == "2026-10-25"


def test_complete_task(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)
    task = create_task(client, list_id)

    response = client.patch(
        f"/api/tasks/{task['id']}",
        json={
            "completed": True,
        },
    )

    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_delete_task(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)
    task = create_task(client, list_id)

    response = client.delete(
        f"/api/tasks/{task['id']}"
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/tasks/{task['id']}"
    )

    assert response.status_code == 404


def test_filter_tasks_by_date(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)

    create_task(
        client,
        list_id,
        title="October",
        due_date="2026-10-20",
    )

    create_task(
        client,
        list_id,
        title="November",
        due_date="2026-11-05",
    )

    response = client.get(
        "/api/tasks",
        params={
            "start_date": "2026-10-01",
            "end_date": "2026-10-31",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["title"] == "October"


def test_filter_tasks_by_completion(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)

    first = create_task(
        client,
        list_id,
        title="Open task",
    )

    second = create_task(
        client,
        list_id,
        title="Completed task",
    )

    response = client.patch(
        f"/api/tasks/{second['id']}",
        json={
            "completed": True,
        },
    )

    assert response.status_code == 200

    response = client.get(
        "/api/tasks",
        params={
            "completed": "false",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["id"] == first["id"]


def test_invalid_date_range_rejected(
    client: TestClient,
):
    register(client)

    response = client.get(
        "/api/tasks",
        params={
            "start_date": "2026-11-01",
            "end_date": "2026-10-01",
        },
    )

    assert response.status_code == 422

    assert (
        response.json()["detail"]
        == "start_date cannot be after end_date"
    )


def test_deleting_list_deletes_tasks(
    client: TestClient,
):
    register(client)

    list_id = create_list(client)
    task = create_task(client, list_id)

    response = client.delete(
        f"/api/lists/{list_id}"
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/tasks/{task['id']}"
    )

    assert response.status_code == 404


def test_tasks_require_authentication(
    client: TestClient,
):
    response = client.get(
        "/api/tasks"
    )

    assert response.status_code == 401