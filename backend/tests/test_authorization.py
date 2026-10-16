from collections.abc import Callable

from fastapi.testclient import TestClient

from io import BytesIO

from PIL import Image


ClientFactory = Callable[
    [],
    TestClient,
]


def register(
    client: TestClient,
    email: str,
) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "testing12345",
            "display_name": email,
        },
    )

    assert response.status_code == 201


def create_list(
    client: TestClient,
    name: str,
) -> str:
    response = client.post(
        "/api/lists",
        json={
            "name": name,
            "color": "#6366F1",
            "position": 0,
        },
    )

    assert response.status_code == 201

    return response.json()["id"]


def create_task(
    client: TestClient,
    list_id: str,
    title: str,
) -> str:
    response = client.post(
        "/api/tasks",
        json={
            "list_id": list_id,
            "title": title,
            "due_date": "2026-10-20",
            "position": 0,
        },
    )

    assert response.status_code == 201

    return response.json()["id"]


def test_user_cannot_read_another_users_task(
    client_factory: ClientFactory,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    list_id = create_list(
        alice,
        "Alice List",
    )

    task_id = create_task(
        alice,
        list_id,
        "Alice Secret Task",
    )

    response = bob.get(
        f"/api/tasks/{task_id}"
    )

    assert response.status_code == 404


def test_user_cannot_update_another_users_task(
    client_factory: ClientFactory,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    list_id = create_list(
        alice,
        "Alice List",
    )

    task_id = create_task(
        alice,
        list_id,
        "Alice Task",
    )

    response = bob.patch(
        f"/api/tasks/{task_id}",
        json={
            "title": "Hacked",
        },
    )

    assert response.status_code == 404

    response = alice.get(
        f"/api/tasks/{task_id}"
    )

    assert response.status_code == 200
    assert (
        response.json()["title"]
        == "Alice Task"
    )


def test_user_cannot_delete_another_users_task(
    client_factory: ClientFactory,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    list_id = create_list(
        alice,
        "Alice List",
    )

    task_id = create_task(
        alice,
        list_id,
        "Alice Task",
    )

    response = bob.delete(
        f"/api/tasks/{task_id}"
    )

    assert response.status_code == 404

    response = alice.get(
        f"/api/tasks/{task_id}"
    )

    assert response.status_code == 200


def test_user_cannot_read_another_users_list(
    client_factory: ClientFactory,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    list_id = create_list(
        alice,
        "Alice List",
    )

    response = bob.get(
        f"/api/lists/{list_id}"
    )

    assert response.status_code == 404


def test_user_cannot_create_task_in_another_users_list(
    client_factory: ClientFactory,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    alice_list_id = create_list(
        alice,
        "Alice List",
    )

    response = bob.post(
        "/api/tasks",
        json={
            "list_id": alice_list_id,
            "title": "Unauthorized task",
            "due_date": "2026-10-20",
            "position": 0,
        },
    )

    assert response.status_code == 404


def test_users_only_receive_their_own_lists(
    client_factory: ClientFactory,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    create_list(
        alice,
        "Alice List",
    )

    create_list(
        bob,
        "Bob List",
    )

    alice_response = alice.get(
        "/api/lists"
    )

    bob_response = bob.get(
        "/api/lists"
    )

    assert alice_response.status_code == 200
    assert bob_response.status_code == 200

    assert [
        item["name"]
        for item in alice_response.json()
    ] == ["Alice List"]

    assert [
        item["name"]
        for item in bob_response.json()
    ] == ["Bob List"]


def test_user_cannot_assign_another_users_sticker(
    client_factory: ClientFactory,
    monkeypatch,
):
    alice = client_factory()
    bob = client_factory()

    register(
        alice,
        "alice@example.com",
    )
    register(
        bob,
        "bob@example.com",
    )

    monkeypatch.setattr(
        "app.api.routes.stickers.upload_object",
        lambda **_kwargs: None,
    )

    monkeypatch.setattr(
        "app.api.routes.stickers.get_public_url",
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    image = BytesIO()

    Image.new(
        "RGBA",
        (32, 32),
        (255, 0, 0, 255),
    ).save(
        image,
        format="PNG",
    )

    sticker_response = alice.post(
        "/api/stickers",
        data={
            "name": "Alice Sticker",
        },
        files={
            "file": (
                "sticker.png",
                image.getvalue(),
                "image/png",
            ),
        },
    )

    assert (
        sticker_response.status_code
        == 201
    )

    sticker_id = (
        sticker_response.json()["id"]
    )

    bob_list_id = create_list(
        bob,
        "Bob List",
    )

    bob_task_id = create_task(
        bob,
        bob_list_id,
        "Bob Task",
    )

    response = bob.patch(
        f"/api/tasks/{bob_task_id}",
        json={
            "sticker_id": sticker_id,
        },
    )

    assert response.status_code == 404