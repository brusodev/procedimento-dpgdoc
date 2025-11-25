"""
Script to migrate user roles from old system to new system
- instructor -> admin (keep admin capabilities)
- student -> colaborador

This script uses raw SQL to avoid SQLAlchemy enum validation issues
"""

from app.database import engine
from sqlalchemy import text
import sys
import argparse


def migrate_roles(auto_confirm=False):
    print("\n" + "="*60)
    print("DPGDOC ACADEMY - User Roles Migration")
    print("="*60 + "\n")

    try:
        # Use raw SQL connection to bypass SQLAlchemy enum validation
        with engine.connect() as connection:
            # First, check what roles exist
            result = connection.execute(
                text("SELECT username, role FROM users")
            )
            users = result.fetchall()

            if not users:
                print("[INFO] No users found in database")
                return

            print(f"[INFO] Found {len(users)} user(s)\n")

            # Build migration plan
            migrations = []
            for username, role in users:
                # Convert to lowercase for comparison (SQLite may store uppercase)
                role_lower = role.lower()

                if role_lower == "instructor":
                    migrations.append((username, role, "admin"))
                elif role_lower == "student":
                    migrations.append((username, role, "colaborador"))
                elif role_lower == "admin":
                    migrations.append((username, role, "admin (unchanged)"))
                else:
                    print(f"[WARNING] Unknown role '{role}' for user {username}")

            if not migrations:
                print("[INFO] No migrations needed")
                return

            # Show migration plan
            print("Migration plan:")
            print("-" * 60)
            for username, old_role, new_role in migrations:
                print(f"  {username:20} | {old_role:15} -> {new_role}")
            print("-" * 60)

            # Ask for confirmation
            if auto_confirm:
                confirm = "yes"
                print("\nAuto-confirming migration...")
            else:
                confirm = input("\nProceed with migration? (yes/no): ").strip().lower()

            if confirm != "yes":
                print("\n[CANCELLED] Migration cancelled by user")
                return

        # Apply migrations using raw SQL with a new connection
        # We need a separate connection for the transaction
        with engine.begin() as connection:
            try:
                # Update instructor -> admin (case insensitive)
                result = connection.execute(
                    text("UPDATE users SET role = 'admin' WHERE LOWER(role) = 'instructor'")
                )
                instructor_count = result.rowcount

                # Update student -> colaborador (case insensitive)
                result = connection.execute(
                    text("UPDATE users SET role = 'colaborador' WHERE LOWER(role) = 'student'")
                )
                student_count = result.rowcount

                # Update ADMIN -> admin (normalize case)
                result = connection.execute(
                    text("UPDATE users SET role = 'admin' WHERE LOWER(role) = 'admin' AND role != 'admin'")
                )
                admin_normalize_count = result.rowcount

                # Commit happens automatically when exiting the 'with' block

                print("\n" + "="*60)
                print("[SUCCESS] Migration completed successfully!")
                print("="*60)
                print(f"\nUpdated {instructor_count} instructor(s) -> admin")
                print(f"Updated {student_count} student(s) -> colaborador")
                if admin_normalize_count > 0:
                    print(f"Normalized {admin_normalize_count} ADMIN -> admin")
                print("\nNew role structure:")
                print("  - Administrador: Full access to all features")
                print("  - Colaborador: Access to assigned tutorials")
                print("="*60 + "\n")

            except Exception as e:
                # Rollback happens automatically on exception
                raise e

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Migrate user roles from old to new system')
    parser.add_argument('--confirm', action='store_true', help='Auto-confirm migration without prompting')
    args = parser.parse_args()

    migrate_roles(auto_confirm=args.confirm)
