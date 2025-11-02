from fastapi import APIRouter
import base64
from io import BytesIO
from PIL import Image
from apps.calculator.utils import analyze_image
from schema import ImageData

router = APIRouter()


@router.post("")
async def run(data: ImageData):
    """
    FastAPI endpoint for analyzing a base64-encoded image.
    """
    try:
        # Decode base64 -> bytes
        image_data = base64.b64decode(data.image.split(",")[1])
        image = Image.open(BytesIO(image_data))

        # Run analysis
        responses = analyze_image(image, dict_of_vars=data.dict_of_vars)

        return {
            "status": "success",
            "message": "Image processed successfully",
            "data": responses,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Gemini API error: {e}",
        }
