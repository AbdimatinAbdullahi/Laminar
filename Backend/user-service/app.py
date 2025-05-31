from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from flask import Flask, request, jsonify
from config import DevelopmentConfig
from flask_cors import CORS

app =  Flask(__name__)
app.config.from_object(DevelopmentConfig)

CORS(app)


@app.route('/')
def index():
    return "Hello", 200


if __name__ == "__main__":
    app.run(debug=True)