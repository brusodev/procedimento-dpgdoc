import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from PIL import Image
import io
from typing import Optional

router = APIRouter()

# Cloudinary configuration
cloudinary_url = os.getenv("CLOUDINARY_URL")
if cloudinary_url:
    cloudinary.config(cloudinary_url=cloudinary_url)
else:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB for images
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB para vídeos
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".avi"}


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    return os.path.splitext(filename)[1].lower()


def compress_image_in_memory(file_data: bytes, max_width: int = 1920) -> bytes:
    """Compress and resize image in memory"""
    img = Image.open(io.BytesIO(file_data))
    
    # Convert to RGB if necessary
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Resize if too large
    if img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

    # Save with optimization to bytes
    output = io.BytesIO()
    img.save(output, format="JPEG", optimize=True, quality=85)
    return output.getvalue()


@router.post("/screenshot")
async def upload_screenshot(
    file: UploadFile = File(...),
    tutorial_title: Optional[str] = Form(None),
    step_order: Optional[int] = Form(None)
):
    """Upload and process a screenshot to Cloudinary with optional custom naming"""

    # Validate file extension
    file_ext = get_file_extension(file.filename)
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    try:
        # Read file content
        file_content = await file.read()
        original_size = len(file_content)

        if original_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Compress image in memory
        compressed_content = compress_image_in_memory(file_content)
        compressed_size = len(compressed_content)

        # Generate custom public_id based on tutorial and step
        upload_options = {
            "resource_type": "image",
            "folder": "tutorial_system/screenshots",
            "format": "jpg"
        }

        if tutorial_title and step_order is not None:
            # Sanitize tutorial title for use in filename
            safe_title = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in tutorial_title)
            safe_title = safe_title[:50]  # Limit length
            custom_name = f"{safe_title}_step_{step_order}"
            upload_options["public_id"] = f"tutorial_system/screenshots/{custom_name}"

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            io.BytesIO(compressed_content),
            **upload_options
        )

        return JSONResponse(content={
            "success": True,
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "original_size": original_size,
            "compressed_size": compressed_size,
            "compression_ratio": round((1 - compressed_size / original_size) * 100, 2)
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    tutorial_title: Optional[str] = Form(None),
    step_order: Optional[int] = Form(None)
):
    """Upload a video file to Cloudinary with optional custom naming"""

    # Validate file extension
    file_ext = get_file_extension(file.filename)
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )

    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)

        if file_size > MAX_VIDEO_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_VIDEO_SIZE / 1024 / 1024}MB"
            )

        # Generate custom public_id based on tutorial and step
        upload_options = {
            "resource_type": "video",
            "folder": "tutorial_system/videos"
        }

        if tutorial_title and step_order is not None:
            # Sanitize tutorial title for use in filename
            safe_title = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in tutorial_title)
            safe_title = safe_title[:50]  # Limit length
            custom_name = f"{safe_title}_step_{step_order}"
            upload_options["public_id"] = f"tutorial_system/videos/{custom_name}"

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            io.BytesIO(file_content),
            **upload_options
        )

        return JSONResponse(content={
            "success": True,
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "file_size": file_size,
            "duration": result.get("duration"),
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format")
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/screenshot/{public_id:path}")
async def delete_screenshot(public_id: str):
    """Delete a screenshot from Cloudinary"""
    try:
        print(f"[DELETE SCREENSHOT] Attempting to delete: {public_id}")
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image"
        )
        print(f"[DELETE SCREENSHOT] Cloudinary result: {result}")

        result_status = result.get("result")

        if result_status == "ok":
            return {"success": True, "message": "Screenshot deleted successfully"}
        elif result_status == "not found":
            # Screenshot already deleted or never existed - treat as success
            return {"success": True, "message": "Screenshot not found (may have been already deleted)"}
        else:
            print(f"[DELETE SCREENSHOT] Unexpected result: {result_status}")
            return {"success": False, "message": f"Unexpected result: {result_status}"}

    except Exception as e:
        print(f"[DELETE SCREENSHOT] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.delete("/video/{public_id:path}")
async def delete_video(public_id: str):
    """Delete a video from Cloudinary"""
    try:
        print(f"[DELETE VIDEO] Attempting to delete: {public_id}")
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="video"
        )
        print(f"[DELETE VIDEO] Cloudinary result: {result}")

        result_status = result.get("result")

        if result_status == "ok":
            return {"success": True, "message": "Video deleted successfully"}
        elif result_status == "not found":
            # Video already deleted or never existed - treat as success
            return {"success": True, "message": "Video not found (may have been already deleted)"}
        else:
            print(f"[DELETE VIDEO] Unexpected result: {result_status}")
            return {"success": False, "message": f"Unexpected result: {result_status}"}

    except Exception as e:
        print(f"[DELETE VIDEO] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

