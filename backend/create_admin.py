"""
Script to create an initial admin user
Usage: python create_admin.py
"""

from app.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.tutorial import Tutorial, Step, Annotation, user_tutorial_access
from app.models.progress import Progress
from app.services.auth import get_password_hash
import sys


def create_admin_user():
    # Create all database tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created\n")

    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()

        if existing_admin:
            print(f"[OK] Admin user already exists: {existing_admin.email}")
            return

        # Create admin user
        admin_email = input("Enter admin email (default: admin@dpgdoc.com): ").strip()
        if not admin_email:
            admin_email = "admin@dpgdoc.com"

        admin_username = input("Enter admin username (default: admin): ").strip()
        if not admin_username:
            admin_username = "admin"

        admin_password = input("Enter admin password (default: admin123): ").strip()
        if not admin_password:
            admin_password = "admin123"

        admin_name = input("Enter admin full name (default: Administrator): ").strip()
        if not admin_name:
            admin_name = "Administrator"

        # Check if email or username already exists
        if db.query(User).filter(User.email == admin_email).first():
            print(f"[ERROR] Email {admin_email} already exists!")
            return

        if db.query(User).filter(User.username == admin_username).first():
            print(f"[ERROR] Username {admin_username} already exists!")
            return

        # Create the admin user
        admin_user = User(
            email=admin_email,
            username=admin_username,
            hashed_password=get_password_hash(admin_password),
            full_name=admin_name,
            role=UserRole.ADMIN,
            is_active=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("\n" + "="*50)
        print("[SUCCESS] Admin user created successfully!")
        print("="*50)
        print(f"Email: {admin_email}")
        print(f"Username: {admin_username}")
        print(f"Password: {admin_password}")
        print(f"Role: {admin_user.role}")
        print("="*50)
        print("\nIMPORTANT: Please change the password after first login!")
        print("="*50 + "\n")

    except Exception as e:
        print(f"[ERROR] Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*50)
    print("DPGDOC ACADEMY - Admin User Creation")
    print("="*50 + "\n")
    create_admin_user()
