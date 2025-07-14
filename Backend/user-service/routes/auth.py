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


        return jsonify({"message" : "Login success!", "token" : token, "fullname": user.fullname, "email" : user.email, "id": user.id})

    except Exception as e:
        print("Failed login!", str(e))
        return jsonify({"error" : "Server Error"}), 500
    

@auth_bp.route('/protected')
def on_app_load():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error" : "No token found!"}), 404
        
        auth_token = token.split(" ")[1]
        secret_key = current_app.config["SECRTE_KEY"]
        decoded_user = jwt.decode(auth_token, secret_key, algorithms="HS256")
        print("Decoded user: ", decoded_user)
        return jsonify({"message" : "Load success", "email" : decoded_user.get("email"), "id" : decoded_user.get("sub"), "fullname" : decoded_user.get("fullname"), "token" : auth_token}), 200

    except Exception as e:
        print("Error ", str(e))
        return jsonify({"error" : "Internal server error"}), 500
    


def decoder_helper(token):
    try:
        secret_key = current_app.config["SECRTE_KEY"]
        return jwt.decode(token, secret_key, algorithms="HS256")
    except Exception as e:
        print("Failed to decode the user: ", str(e))
        return None


@auth_bp.route('/setOnline', methods=["POST"])
def set_online():
    try:
        data = request.get_json()
        token = data.get("token")
        print("Token when decoding: ", token)
        decoded_user = decoder_helper(token=token)
        if not decoded_user:
            return jsonify({"error" : "Server Error"}), 500
        
        user = User.query.filter_by(id=decoded_user.get("sub")).first()
        if not user:
            return jsonify({"error" : "Internal Server error"}), 500

        user.status = "online"
        db.session.commit()

        print("User setted online")
        return jsonify({"message" : "user setted online"}), 200

    except Exception as e:
        print("Server Error: ", str(e))
        return jsonify({"error" : "Internal Server Error"}), 500



@auth_bp.route("/removeOnline", methods=["POST"])
def remove_online():
    try:
        data = request.get_json()
        token = data["token"]
        decoded_user = decoder_helper(token=token)
        if not decoded_user:
            return jsonify({"error" : "Internal Server error"}), 401
        
        user = User.query.filter_by(id=decoded_user.get("sub")).first()
        if not user:
            return jsonify({"error" : "Internal server error"}), 404
        user.status = "offline"
        db.session.commit()
        print("User setted offline")
        return jsonify({"message" : "setted offline"}), 200

    except Exception as e:
        print("User removing online failed: ", str(e))
        return jsonify({"error" : "Failed removing user online"}), 500
    