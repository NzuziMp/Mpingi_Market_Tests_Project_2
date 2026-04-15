"""
Shared fixtures and configuration for Selenium functional tests.

Prerequisites:
  pip install selenium pytest pytest-html webdriver-manager
  ChromeDriver matching your Chrome version (auto-managed by webdriver-manager)
"""

import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:5173")
HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"

TEST_USER_EMAIL = os.environ.get("TEST_USER_EMAIL", "testuser@mpingimarket.test")
TEST_USER_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "TestPassword123!")
TEST_USER_NAME = "Test User"


@pytest.fixture(scope="session")
def driver():
    """Create a single browser session shared across all tests in the session."""
    options = Options()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-extensions")

    chromedriver_path = os.environ.get("CHROMEDRIVER_PATH", "")
    if chromedriver_path:
        service = Service(executable_path=chromedriver_path)
    else:
        service = Service(ChromeDriverManager().install())
    browser = webdriver.Chrome(service=service, options=options)
    browser.implicitly_wait(10)

    yield browser

    browser.quit()


@pytest.fixture(autouse=True)
def reset_page(driver):
    """Navigate back to the base URL before each test."""
    driver.get(BASE_URL)
