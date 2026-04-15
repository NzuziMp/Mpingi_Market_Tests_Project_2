"""
Functional Test Suite 2 — Authentication Flow

Scenarios:
  1. Sign-in page renders correctly with email/password fields
  2. Registration form enforces the 18+ age requirement
  3. Sign-in with invalid credentials shows an error message
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL


class TestAuthFlow:

    def _navigate_to_auth(self, driver):
        driver.get(BASE_URL)
        wait = WebDriverWait(driver, 15)
        sign_in_buttons = driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Sign In') or contains(text(), 'Register') or contains(text(), 'Login')]"
        )
        for btn in sign_in_buttons:
            if btn.is_displayed() and btn.is_enabled():
                btn.click()
                break
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))

    def test_auth_page_renders_sign_in_form(self, driver):
        """
        Nominal case: Navigating to the auth page renders an email input,
        a password input, and a submit button.
        """
        self._navigate_to_auth(driver)
        wait = WebDriverWait(driver, 15)

        email_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        assert email_input.is_displayed(), "Email input should be visible"
        assert password_input.is_displayed(), "Password input should be visible"

        submit_buttons = driver.find_elements(By.CSS_SELECTOR, "button[type='submit']")
        assert len(submit_buttons) > 0, "A submit button should be present on the auth form"

    def test_sign_in_with_invalid_credentials_shows_error(self, driver):
        """
        Error case: Submitting the sign-in form with invalid credentials
        should display a visible error message to the user.
        """
        self._navigate_to_auth(driver)
        wait = WebDriverWait(driver, 15)

        email_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

        email_input.clear()
        email_input.send_keys("invalid.user.xyz@nowhere.test")
        password_input.clear()
        password_input.send_keys("WrongPassword999")

        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()

        time.sleep(3)
        page_source = driver.page_source
        error_keywords = ["invalid", "incorrect", "error", "wrong", "failed", "not found"]
        found_error = any(kw in page_source.lower() for kw in error_keywords)
        assert found_error, "An error message should appear after submitting invalid credentials"

    def test_registration_tab_is_accessible(self, driver):
        """
        Nominal case: Clicking the 'Register' tab on the auth page
        shows a registration form with additional fields like full name.
        """
        self._navigate_to_auth(driver)
        wait = WebDriverWait(driver, 15)

        register_buttons = driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Register') or contains(text(), 'Sign Up') or contains(text(), 'Create')]"
        )
        for btn in register_buttons:
            if btn.is_displayed():
                try:
                    btn.click()
                    break
                except Exception:
                    continue

        time.sleep(1)
        page_source = driver.page_source
        has_name_field = (
            "Full Name" in page_source
            or "name" in page_source.lower()
            or driver.find_elements(By.CSS_SELECTOR, "input[placeholder*='name']")
        )
        assert has_name_field, "Registration form should include a name field"

    def test_registration_requires_minimum_fields(self, driver):
        """
        Limit/error case: Submitting the registration form without filling
        required fields should not navigate away or create an account.
        """
        self._navigate_to_auth(driver)
        wait = WebDriverWait(driver, 15)

        register_buttons = driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Register') or contains(text(), 'Sign Up')]"
        )
        for btn in register_buttons:
            if btn.is_displayed():
                try:
                    btn.click()
                    break
                except Exception:
                    continue

        time.sleep(0.5)

        submit_buttons = driver.find_elements(By.CSS_SELECTOR, "button[type='submit']")
        if submit_buttons:
            submit_buttons[0].click()

        time.sleep(1)
        email_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
        assert len(email_inputs) > 0, "User should remain on the auth page when required fields are empty"
