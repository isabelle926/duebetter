from io import BytesIO

from fastapi.testclient import (
    TestClient,
)
from PIL import Image


def register(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": (
                "profile@example.com"
            ),
            "password": (
                "testing12345"
            ),
            "display_name": (
                "Original Name"
            ),
        },
    )

    assert (
        response.status_code
        == 201
    )


def create_png() -> bytes:
    buffer = BytesIO()

    image = Image.new(
        "RGBA",
        (64, 64),
        (100, 100, 255, 255),
    )

    image.save(
        buffer,
        format="PNG",
    )

    return buffer.getvalue()


def test_update_profile(
    client: TestClient,
):
    register(client)

    response = client.patch(
        "/api/profile",
        json={
            "display_name": (
                "Updated Name"
            ),
        },
    )

    assert (
        response.status_code
        == 200
    )

    assert (
        response.json()[
            "display_name"
        ]
        == "Updated Name"
    )


def test_profile_requires_authentication(
    client: TestClient,
):
    response = client.patch(
        "/api/profile",
        json={
            "display_name": (
                "Unauthorized"
            ),
        },
    )

    assert (
        response.status_code
        == 401
    )


def test_upload_avatar(
    client: TestClient,
    monkeypatch,
):
    register(client)

    uploaded: dict[
        str,
        object,
    ] = {}

    def fake_upload_object(
        *,
        key: str,
        data: bytes,
        content_type: str,
    ) -> None:
        uploaded["key"] = key
        uploaded["data"] = data
        uploaded[
            "content_type"
        ] = content_type

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "upload_object"
        ),
        fake_upload_object,
    )

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "get_public_url"
        ),
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    response = client.post(
        "/api/profile/avatar",
        files={
            "file": (
                "avatar.png",
                create_png(),
                "image/png",
            ),
        },
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["avatar_url"]
        .startswith(
            "https://example.test/"
        )
    )

    assert (
        uploaded[
            "content_type"
        ]
        == "image/png"
    )

    assert (
        "/avatar/"
        in str(
            uploaded["key"]
        )
    )


def test_invalid_avatar_rejected(
    client: TestClient,
    monkeypatch,
):
    register(client)

    def should_not_upload(
        **_kwargs,
    ) -> None:
        raise AssertionError(
            "Invalid image "
            "reached storage"
        )

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "upload_object"
        ),
        should_not_upload,
    )

    response = client.post(
        "/api/profile/avatar",
        files={
            "file": (
                "fake.png",
                b"not an image",
                "image/png",
            ),
        },
    )

    assert (
        response.status_code
        == 415
    )


def test_delete_avatar(
    client: TestClient,
    monkeypatch,
):
    register(client)

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "upload_object"
        ),
        lambda **_kwargs: None,
    )

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "get_public_url"
        ),
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    deleted_keys: list[str] = []

    def fake_delete_object(
        *,
        key: str,
    ) -> None:
        deleted_keys.append(
            key
        )

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "delete_object"
        ),
        fake_delete_object,
    )

    upload_response = client.post(
        "/api/profile/avatar",
        files={
            "file": (
                "avatar.png",
                create_png(),
                "image/png",
            ),
        },
    )

    assert (
        upload_response.status_code
        == 200
    )

    response = client.delete(
        "/api/profile/avatar"
    )

    assert (
        response.status_code
        == 204
    )

    me_response = client.get(
        "/api/auth/me"
    )

    assert (
        me_response.status_code
        == 200
    )

    assert (
        me_response.json()[
            "avatar_url"
        ]
        is None
    )

    assert len(
        deleted_keys
    ) == 1

def test_replacing_avatar_deletes_old_object(
    client: TestClient,
    monkeypatch,
):
    register(client)

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "upload_object"
        ),
        lambda **_kwargs: None,
    )

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "get_public_url"
        ),
        lambda *, key: (
            f"https://example.test/{key}"
        ),
    )

    deleted_keys: list[str] = []

    def fake_delete_object(
        *,
        key: str,
    ) -> None:
        deleted_keys.append(
            key
        )

    monkeypatch.setattr(
        (
            "app.api.routes.profile."
            "delete_object"
        ),
        fake_delete_object,
    )

    first_response = client.post(
        "/api/profile/avatar",
        files={
            "file": (
                "first.png",
                create_png(),
                "image/png",
            ),
        },
    )

    assert (
        first_response.status_code
        == 200
    )

    second_response = client.post(
        "/api/profile/avatar",
        files={
            "file": (
                "second.png",
                create_png(),
                "image/png",
            ),
        },
    )

    assert (
        second_response.status_code
        == 200
    )

    assert len(
        deleted_keys
    ) == 1

    assert (
        "/avatar/"
        in deleted_keys[0]
    )