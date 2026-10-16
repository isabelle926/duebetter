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


def test_create_list(
    client: TestClient,
):
    register(client)

    response = client.post(
        "/api/lists",
        json={
            "name": "School",
            "color": "#6366F1",
            "position": 0,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "School"
    assert data["color"] == "#6366F1"
    assert data["position"] == 0


def test_get_lists(
    client: TestClient,
):
    register(client)

    client.post(
        "/api/lists",
        json={
            "name": "School",
            "color": "#6366F1",
            "position": 0,
        },
    )

    client.post(
        "/api/lists",
        json={
            "name": "Personal",
            "color": "#EC4899",
            "position": 1,
        },
    )

    response = client.get(
        "/api/lists"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["name"] == "School"
    assert data[1]["name"] == "Personal"


def test_update_list(
    client: TestClient,
):
    register(client)

    create_response = client.post(
        "/api/lists",
        json={
            "name": "School",
            "color": "#6366F1",
            "position": 0,
        },
    )

    list_id = (
        create_response.json()["id"]
    )

    response = client.patch(
        f"/api/lists/{list_id}",
        json={
            "name": "University",
            "color": "#22C55E",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "University"
    assert data["color"] == "#22C55E"


def test_delete_list(
    client: TestClient,
):
    register(client)

    create_response = client.post(
        "/api/lists",
        json={
            "name": "School",
            "color": "#6366F1",
            "position": 0,
        },
    )

    list_id = (
        create_response.json()["id"]
    )

    response = client.delete(
        f"/api/lists/{list_id}"
    )

    assert response.status_code == 204

    get_response = client.get(
        f"/api/lists/{list_id}"
    )

    assert get_response.status_code == 404


def test_invalid_list_color_rejected(
    client: TestClient,
):
    register(client)

    response = client.post(
        "/api/lists",
        json={
            "name": "School",
            "color": "purple",
            "position": 0,
        },
    )

    assert response.status_code == 422


def test_lists_require_authentication(
    client: TestClient,
):
    response = client.get(
        "/api/lists"
    )

    assert response.status_code == 401