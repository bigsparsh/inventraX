from fastapi import FastAPI
from utils.fcns import query_classifier
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


class Stuff(BaseModel):
    query: str


@app.post("/natural-processing")
async def natural_processing(query: Stuff):
    return query_classifier(query)
