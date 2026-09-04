from pathlib import Path
import joblib
import numpy as np
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from tensorflow import keras

BASE_DIR = Path(__file__).resolve().parent

model = keras.models.load_model(BASE_DIR / "iris_model.keras")
scaler = joblib.load(BASE_DIR / "scaler.pkl")

app = FastAPI(title="Iris Flower Classifier")

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


class FlowerInput(BaseModel):
    sepal_length: float = Field(..., gt=0)
    sepal_width: float = Field(..., gt=0)
    petal_length: float = Field(..., gt=0)
    petal_width: float = Field(..., gt=0)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    html = (BASE_DIR / "static" / "index.html").read_text(encoding="utf-8")
    return HTMLResponse(html)


@app.post("/predict")
async def predict(data: FlowerInput):
    values = np.array([[
        data.sepal_length,
        data.sepal_width,
        data.petal_length,
        data.petal_width,
    ]], dtype=np.float32)

    scaled = scaler.transform(values)
    probabilities = model.predict(scaled, verbose=0)[0]

    classes = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"]
    index = int(np.argmax(probabilities))

    return {
        "prediction": classes[index],
        "confidence": float(probabilities[index]),
        "probabilities": {
            classes[i]: float(probabilities[i])
            for i in range(len(classes))
        },
    }
