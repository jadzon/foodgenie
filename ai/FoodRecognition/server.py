from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import httpx
import asyncio
from food_recognition import recognize_food
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Food Recognition API",
    description="API for recognizing food items from images",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Food Recognition API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/recognize")
async def recognize_food_from_image(file: UploadFile = File(...)):
    """
    Upload an image and get the recognized food type and estimated volume.
    
    - **file**: Image file (JPEG, PNG, etc.)
    
    Returns the name of the recognized food item and estimated volume in ml.
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image bytes
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Process the image for food recognition
        logger.info(f"Processing image: {file.filename}")
        food_name = recognize_food(image_bytes)
        logger.info(f"Recognition result: {food_name}")
        
        # Also get volume estimation
        volume_ml = None
        try:
            # Reset file position for volume estimation
            files = {"file": (file.filename, image_bytes, file.content_type)}
            
            async with httpx.AsyncClient(timeout=80.0) as client:
                logger.info("Calling volume service...")
                response = await client.post(
                    "http://volume-service:8000/estimate-volume",
                    files=files
                )
                
                logger.info(f"Volume service response status: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        volume_data = response.json()
                        logger.info(f"Volume service response data: {volume_data}")
                        volume_ml = volume_data.get("volume_ml")
                        logger.info(f"Volume estimation result: {volume_ml} ml")
                    except Exception as json_error:
                        logger.warning(f"Failed to parse volume service JSON: {json_error}")
                        logger.warning(f"Raw response: {response.text}")
                else:
                    logger.warning(f"Volume estimation failed: {response.status_code}")
                    logger.warning(f"Response text: {response.text}")
                    
        except Exception as e:
            logger.warning(f"Volume estimation error: {type(e).__name__}: {str(e)}")
            # Continue without volume if estimation fails
        
        result = {
            "name": food_name,
            "status": "success"
        }
        
        if volume_ml is not None:
            result["volume"] = volume_ml
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8084)