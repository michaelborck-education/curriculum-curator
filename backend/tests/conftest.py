"""
Pytest configuration for backend tests

Supports two test modes:
1. Unit tests - run without backend (test_services_unit.py)
2. Integration tests - require running backend (test_auth*.py, test_basic.py)
"""

import time

import pytest
import requests

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"


def is_backend_running() -> bool:
    """Check if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=2)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


@pytest.fixture(scope="session")
def base_url():
    """Base URL for the API"""
    return BASE_URL


@pytest.fixture(scope="session")
def api_url():
    """API URL for the backend"""
    return API_URL


@pytest.fixture(scope="session")
def backend_available():
    """Check if backend is available, skip integration tests if not"""
    if not is_backend_running():
        pytest.skip("Backend is not running - skipping integration tests")
    return True


@pytest.fixture
def unique_email():
    """Generate a unique test email"""
    timestamp = int(time.time() * 1000)
    return f"test{timestamp}@example.com"
