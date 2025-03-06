from fastapi import FastAPI

app = FastAPI()

@app.get("/your-endpoint")
async def get_endpoint():
    return {"message": "OK"}

