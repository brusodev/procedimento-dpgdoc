import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io

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
async def upload_screenshot(file: UploadFile = File(...)):
    """Upload and process a screenshot to Cloudinary"""

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

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            io.BytesIO(compressed_content),
            resource_type="image",
            folder="tutorial_system/screenshots",
            format="jpg"
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
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file to Cloudinary"""

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

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            io.BytesIO(file_content),
            resource_type="video",
            folder="tutorial_system/videos"
        )

        return JSONResponse(content={
            "success": True,
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "file_size": file_size,
            "duration": result.get("duration"),
            "width": result.get("width"),
            "height": result.get("height")
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.delete("/screenshot/{public_id}")
async def delete_screenshot(public_id: str):
    """Delete a screenshot from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image"
        )
        
        if result.get("result") == "ok":
            return {"success": True, "message": "Screenshot deleted"}
        else:
            raise HTTPException(status_code=404, detail="Screenshot not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.delete("/video/{public_id}")
async def delete_video(public_id: str):
    """Delete a video from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="video"
        )
        
        if result.get("result") == "ok":
            return {"success": True, "message": "Video deleted"}
        else:
            raise HTTPException(status_code=404, detail="Video not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

