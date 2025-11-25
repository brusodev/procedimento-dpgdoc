"""
Script to reset the database and create fresh tables
This will DELETE all existing data and create new tables
"""

from app.database import Base, engine
from app.models.user import User, UserRole
from app.models.tutorial import Tutorial, Step, Annotation, user_tutorial_access
from app.models.progress import Progress
from app.services.auth import get_password_hash
from app.database import SessionLocal
import os
import sys


def reset_database():
    print("\n" + "="*60)
    print("DPGDOC ACADEMY - Database Reset")
    print("="*60 + "\n")

    # Confirm action
    confirm = input("WARNING: This will DELETE ALL DATA in the database!\n\nType 'RESET' to confirm: ").strip()

    if confirm != "RESET":
        print("\n[CANCELLED] Database reset cancelled")
        return

    try:
        # Drop all existing tables
        print("\n[INFO] Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("[OK] All tables dropped")

        # Create all tables
        print("\n[INFO] Creating new database tables...")
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created successfully")

        # Create default admin user
        print("\n[INFO] Creating default admin user...")
        db = SessionLocal()

        try:
            admin_user = User(
                email="admin@dpgdoc.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrator",
                role=UserRole.ADMIN,
                is_active=True
            )

            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            print("\n" + "="*60)
            print("[SUCCESS] Database reset completed!")
            print("="*60)
            print("\nNew database structure:")
            print("  - Users table: OK")
            print("  - Tutorials table: OK")
            print("  - Steps table: OK")
            print("  - Annotations table: OK")
            print("  - Progress table: OK")
            print("  - User-Tutorial access table: OK")

            print("\nDefault admin user created:")
            print(f"  Email: {admin_user.email}")
            print(f"  Username: {admin_user.username}")
            print(f"  Password: admin123")
            print(f"  Role: {admin_user.role.value}")

            print("\n" + "="*60)
            print("IMPORTANT: Please change the admin password after first login!")
            print("="*60 + "\n")

        finally:
            db.close()

    except Exception as e:
        print(f"\n[ERROR] Database reset failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    reset_database()
