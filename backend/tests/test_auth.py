from fastapi.testclient import TestClient


def test_register_user(
    client: TestClient,
):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert (
        data["email"]
        == "alice@example.com"
    )

    assert (
        data["display_name"]
        == "Alice"
    )

    assert "password" not in data
    assert "password_hash" not in data


def test_duplicate_email_rejected(
    client: TestClient,
):
    payload = {
        "email": "alice@example.com",
        "password": "testing12345",
        "display_name": "Alice",
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert (
        first_response.status_code
        == 201
    )

    second_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert (
        second_response.status_code
        == 409
    )


def test_login_success(
    client: TestClient,
):
    client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    client.post(
        "/api/auth/logout",
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()["email"]
        == "alice@example.com"
    )


def test_login_wrong_password(
    client: TestClient,
):
    client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    client.post(
        "/api/auth/logout",
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "alice@example.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401

    assert (
        response.json()["detail"]
        == "Invalid email or password"
    )


def test_get_current_user(
    client: TestClient,
):
    client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    response = client.get(
        "/api/auth/me"
    )

    assert response.status_code == 200

    assert (
        response.json()["email"]
        == "alice@example.com"
    )


def test_me_requires_authentication(
    client: TestClient,
):
    response = client.get(
        "/api/auth/me"
    )

    assert response.status_code == 401


def test_logout_invalidates_session(
    client: TestClient,
):
    client.post(
        "/api/auth/register",
        json={
            "email": "alice@example.com",
            "password": "testing12345",
            "display_name": "Alice",
        },
    )

    before_logout = client.get(
        "/api/auth/me"
    )

    assert (
        before_logout.status_code
        == 200
    )

    logout_response = client.post(
        "/api/auth/logout"
    )

    assert (
        logout_response.status_code
        == 204
    )

    after_logout = client.get(
        "/api/auth/me"
    )

    assert (
        after_logout.status_code
        == 401
    )


