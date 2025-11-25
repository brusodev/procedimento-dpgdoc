"""
Test Cloudinary delete functionality
"""
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# Test delete
public_id = "tutorial_system/videos/e6oxlbh2n96ecawjkwzj"

print(f"Attempting to delete: {public_id}")
print(f"Cloud name: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
print(f"API Key: {os.getenv('CLOUDINARY_API_KEY')[:10]}...")

try:
    result = cloudinary.uploader.destroy(
        public_id,
        resource_type="video"
    )
    print(f"\nResult: {result}")
    print(f"Status: {result.get('result')}")

    if result.get('result') == 'ok':
        print("\n[SUCCESS] Video deleted successfully!")
    elif result.get('result') == 'not found':
        print("\n[WARNING] Video not found (may already be deleted)")
    else:
        print(f"\n[ERROR] Unexpected result: {result.get('result')}")

except Exception as e:
    print(f"\n[ERROR] Exception: {str(e)}")
    import traceback
    traceback.print_exc()
