"""Idempotent demo-data seed. Run with: python -m app.db.seed

Safe to re-run - looks up existing rows by a natural key (name/email) before
inserting, so it never duplicates data.
"""

from datetime import date, datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.active_service import ActiveService
from app.models.business_application import BusinessApplication
from app.models.employee import Employee
from app.models.provider import Provider
from app.models.quest import Quest
from app.models.service import Service
from app.models.team import Team

import secrets


def get_or_create(db, model, lookup: dict, defaults: dict | None = None):
    instance = db.query(model).filter_by(**lookup).first()
    if instance:
        return instance, False
    instance = model(**lookup, **(defaults or {}))
    db.add(instance)
    db.flush()
    return instance, True


def seed():
    db = SessionLocal()
    created = []
    try:
        business, was_created = get_or_create(
            db,
            BusinessApplication,
            {"email": "hello@pulse-demo.com"},
            {
                "business_name": "Pulse Demo Co",
                "nipt": "K12345678A",
                "employee_count": 25,
                "contact_number": "+355691234567",
            },
        )
        if was_created:
            created.append("business_application: Pulse Demo Co")

        teams = {}
        for name in ["Engineering", "Sales", "Design"]:
            team, was_created = get_or_create(db, Team, {"name": name})
            teams[name] = team
            if was_created:
                created.append(f"team: {name}")

        providers_data = [
            ("Zen Spa", "wellness", "Tirana"),
            ("Bistro Roma", "food", "Tirana"),
            ("CineMax", "fun", "Tirana"),
            ("FitClub", "wellness", "Durres"),
            ("SkyTrips", "travel", "Tirana"),
            ("TeleConnect", "telecom", "Tirana"),
        ]
        providers = {}
        for name, category, city in providers_data:
            provider, was_created = get_or_create(db, Provider, {"name": name}, {"category": category, "city": city})
            providers[name] = provider
            if was_created:
                created.append(f"provider: {name}")

        services_data = [
            ("Deep Tissue Massage", "Zen Spa", "wellness", 6000, "A 60-minute deep tissue massage to melt away stress."),
            ("Spa Day Pass", "Zen Spa", "wellness", 9000, "Full-day access to sauna, pool, and relaxation lounge."),
            ("3-Course Dinner", "Bistro Roma", "food", 4500, "A three-course Italian dinner for one."),
            ("Lunch Voucher", "Bistro Roma", "food", 1500, "A voucher for any lunch menu item."),
            ("Movie Night for Two", "CineMax", "fun", 3000, "Two tickets plus popcorn for any showing."),
            ("VIP Recliner Seats", "CineMax", "fun", 4000, "Premium recliner seating for one screening."),
            ("Monthly Gym Pass", "FitClub", "wellness", 5000, "Unlimited gym access for one month."),
            ("Personal Training Session", "FitClub", "wellness", 3500, "One 45-minute session with a trainer."),
            ("Weekend City Break", "SkyTrips", "travel", 15000, "Two-night stay in a partner city, flights not included."),
            ("Airport Lounge Pass", "SkyTrips", "travel", 2500, "Single-use lounge access pass."),
            ("Mobile Data Top-Up", "TeleConnect", "telecom", 1000, "10GB of extra mobile data."),
            ("Unlimited Calls Plan", "TeleConnect", "telecom", 2000, "One month of unlimited local calls."),
        ]
        services = {}
        for title, provider_name, category, price_all, description in services_data:
            service, was_created = get_or_create(
                db,
                Service,
                {"title": title, "provider_id": providers[provider_name].id},
                {
                    "category": category,
                    "price_all": price_all,
                    "description": description,
                    "image_uri": f"https://picsum.photos/seed/{title.replace(' ', '-').lower()}/400/300",
                    "active": True,
                },
            )
            services[title] = service
            if was_created:
                created.append(f"service: {title}")

        manager, was_created = get_or_create(
            db,
            Employee,
            {"email": "manager@demo.com"},
            {
                "name": "Mona Manager",
                "hashed_password": hash_password("password123"),
                "role": "manager",
                "business_id": business.id,
                "team_id": teams["Engineering"].id,
            },
        )
        if was_created:
            created.append("employee (manager): manager@demo.com / password123")

        employees_data = [
            ("Alice Employee", "alice@demo.com", "Engineering", 30000),
            ("Bob Employee", "bob@demo.com", "Engineering", 20000),
            ("Carla Employee", "carla@demo.com", "Sales", 25000),
            ("Dorian Employee", "dorian@demo.com", "Sales", 15000),
            ("Elsa Employee", "elsa@demo.com", "Design", 40000),
        ]
        employees = {}
        for name, email, team_name, budget in employees_data:
            employee, was_created = get_or_create(
                db,
                Employee,
                {"email": email},
                {
                    "name": name,
                    "hashed_password": hash_password("password123"),
                    "role": "employee",
                    "business_id": business.id,
                    "team_id": teams[team_name].id,
                    "monthly_budget_all": budget,
                },
            )
            employees[email] = employee
            if was_created:
                created.append(f"employee: {email} / password123")

        # A few demo claim rows so manager history/invoice screens aren't empty on first run.
        demo_claims = [
            ("alice@demo.com", "Deep Tissue Massage", 5),
            ("bob@demo.com", "Lunch Voucher", 2),
            ("carla@demo.com", "Monthly Gym Pass", 10),
        ]
        for email, title, days_ago in demo_claims:
            existing = (
                db.query(ActiveService)
                .filter(ActiveService.employee_id == employees[email].id, ActiveService.title_snapshot == title)
                .first()
            )
            if existing:
                continue
            service = services[title]
            claimed_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
            db.add(
                ActiveService(
                    employee_id=employees[email].id,
                    service_id=service.id,
                    token=secrets.token_urlsafe(32),
                    status="claimed",
                    title_snapshot=service.title,
                    provider_name_snapshot=service.provider_name,
                    price_all_snapshot=service.price_all,
                    taken_at=claimed_at,
                    claimed_at=claimed_at,
                )
            )
            created.append(f"active_service (claimed): {email} -> {title}")

        # One unclaimed perk so the QR-display flow has something to demo immediately.
        if not db.query(ActiveService).filter(ActiveService.employee_id == employees["dorian@demo.com"].id).first():
            service = services["Mobile Data Top-Up"]
            db.add(
                ActiveService(
                    employee_id=employees["dorian@demo.com"].id,
                    service_id=service.id,
                    token=secrets.token_urlsafe(32),
                    status="active",
                    title_snapshot=service.title,
                    provider_name_snapshot=service.provider_name,
                    price_all_snapshot=service.price_all,
                )
            )
            created.append("active_service (active): dorian@demo.com -> Mobile Data Top-Up")

        quests_data = [
            ("Top Seller of the Month", "Close the most deals this month.", "$200 bonus", "individual", 30),
            ("Team Step Challenge", "Most combined steps wins.", "Team lunch on the house", "team", 14),
        ]
        for title, description, reward, qtype, days_ahead in quests_data:
            quest, was_created = get_or_create(
                db,
                Quest,
                {"title": title},
                {
                    "description": description,
                    "reward": reward,
                    "type": qtype,
                    "deadline": date.today() + timedelta(days=days_ahead),
                    "status": "active",
                },
            )
            if was_created:
                created.append(f"quest: {title}")

        db.commit()
    finally:
        db.close()

    if created:
        print(f"Seeded {len(created)} new row(s):")
        for line in created:
            print(f"  - {line}")
    else:
        print("Nothing to seed - all demo data already present.")


if __name__ == "__main__":
    seed()
