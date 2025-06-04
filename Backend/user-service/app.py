from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from flask import Flask, request, jsonify
from config import DevelopmentConfig
from flask_cors import CORS
from models import User, db
from routes.auth import auth_bp

app =  Flask(__name__)
app.config.from_object(DevelopmentConfig)
db.init_app(app=app)
CORS(app)


app.register_blueprint(auth_bp)
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return "Hello", 200


if __name__ == "__main__":
    app.run(debug=True)