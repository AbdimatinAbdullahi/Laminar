from flask import Flask, Blueprint, request, jsonify, current_app
from models import User, db
from datetime import datetime, timedelta
import jwt 
import config

auth_bp = Blueprint("auth", __name__, url_prefix='/api')

@auth_bp.route('/register', methods=["POST"])
def register():
    try:
        data = request.get_json()

        if User.query.filter_by(email=data.get("email")).first():
            return jsonify({"error" : "User exists"}), 409

        new_user = User(email=data.get("email"), fullname=data.get("fullname"))
        new_user.set_hashed_password(password=data.get("password"))
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message" : "Registration success"}), 200
    except Exception as e:
        print(f"Error while registering a user: {str(e)}")
        return jsonify({"error" : "Registration failed!"}), 500

@auth_bp.route('/login', methods=["POST"])
def login():
    try:
        data = request.get_json()

        user = User.query.filter_by(email=data.get("email")).first()
        if not user:
            return jsonify({"error" : "user not found"}), 404
        
        if not user.check_pasword(data.get("password")):
            return jsonify({"error" : "Incorrect password!"}), 401
        
        payload = {
            "sub" : str(user.id),
            "fullname" : user.fullname,
            "email" : user.email,
            "iat" : datetime.utcnow(),
            "exp" : datetime.utcnow() + timedelta(hours=3)
        }

        secret_key = current_app.config["SECRTE_KEY"]

        token = jwt.encode(payload, secret_key, "HS256")


        return jsonify({"message" : "Login success!", "token" : token, "fullname": user.fullname, "email" : user.email})

    except Exception as e:
        print("Failed login!", str(e))
        return jsonify({"error" : "Server Error"}), 500