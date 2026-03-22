import csv
from datetime import datetime


PRIORITY = {
    "investor": 1,
    "mentor": 2,
    "advisor": 3,
    "friend": 4,
}

THRESHOLD_DAYS = 30


def load_contacts(filepath):
    contacts = []
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            contacts.append({
                "name": row["name"].strip(),
                "email": row["email"].strip(),
                "last_contacted": row["last_contacted"].strip(),
                "notes": row["notes"].strip().lower() if row["notes"] else "",
            })
    return contacts


def get_days_since(date_str):
    if not date_str:
        return -1
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return (datetime.now() - d).days
    except ValueError:
        return -1


def get_priority(notes):
    for label, rank in PRIORITY.items():
        if label in notes:
            return rank, label.capitalize()
    return 5, "Other"


def get_top_contacts(filepath, top_n=2):
    contacts = load_contacts(filepath)
    candidates = []

    for contact in contacts:
        days = get_days_since(contact["last_contacted"])
        priority, label = get_priority(contact["notes"])

        # Include if overdue OR has a priority relationship type
        if days >= THRESHOLD_DAYS or priority < 5:
            candidates.append({
                "name": contact["name"],
                "label": label,
                "days": days,
                "priority": priority,
            })

    # Sort by priority rank first, then by days since contact (descending)
    candidates.sort(key=lambda x: (x["priority"], -x["days"] if x["days"] != -1 else 0))

    return candidates[:top_n]


if __name__ == "__main__":
    results = get_top_contacts("contacts.csv")
    for i, contact in enumerate(results, 1):
        days_str = f"{contact['days']} days" if contact['days'] != -1 else "no date on record"
        print(f"{i}. {contact['name']} — {contact['label']} — {days_str}")