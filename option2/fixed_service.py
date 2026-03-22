from datetime import datetime


def get_contacts_to_reach_out(contacts, threshold_days=30):
    """
    Returns contacts whose last_contacted date exceeds the threshold.

    Bugs fixed:
    1. contact["last_contacted"] was a raw string — must parse it with strptime before subtracting
    2. datetime subtraction returns a timedelta, not an int — must use .days to compare to 30
    3. No handling of missing/empty last_contacted values — would crash on None or empty string
    """
    result = []

    for contact in contacts:
        raw_date = contact.get("last_contacted")

        # Bug 3 fix: skip contacts with missing or empty dates
        if not raw_date:
            continue

        try:
            # Bug 1 fix: parse the string into a datetime object
            last_contacted = datetime.strptime(raw_date.strip(), "%Y-%m-%d")
        except ValueError:
            # Handle malformed dates gracefully
            continue

        # Bug 2 fix: use .days to get an integer from the timedelta
        days_since = (datetime.now() - last_contacted).days

        if days_since > threshold_days:
            result.append(contact)

    return result


# --- Unit Test ---
import unittest

class TestGetContactsToReachOut(unittest.TestCase):

    def test_basic_overdue(self):
        contacts = [
            {"name": "Alice", "last_contacted": "2020-01-01"},  # way overdue
            {"name": "Bob", "last_contacted": "2099-01-01"},    # in the future
        ]
        result = get_contacts_to_reach_out(contacts)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "Alice")

    def test_missing_date_skipped(self):
        contacts = [
            {"name": "Chris", "last_contacted": ""},
            {"name": "Dana", "last_contacted": None},
        ]
        result = get_contacts_to_reach_out(contacts)
        self.assertEqual(result, [])

    def test_malformed_date_skipped(self):
        contacts = [
            {"name": "Eve", "last_contacted": "not-a-date"},
        ]
        result = get_contacts_to_reach_out(contacts)
        self.assertEqual(result, [])

    def test_empty_input(self):
        self.assertEqual(get_contacts_to_reach_out([]), [])


if __name__ == "__main__":
    unittest.main()