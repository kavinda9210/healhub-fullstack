import io
import json
from app import create_app


def test_health_check():
    app = create_app()
    client = app.test_client()
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'success'


def test_detect_endpoint_no_image():
    app = create_app()
    client = app.test_client()
    rv = client.post('/api/patient/detect')
    # should be unauthorized (no auth provided)
    assert rv.status_code in (401, 403)
