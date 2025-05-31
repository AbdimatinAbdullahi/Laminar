from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import uuid


db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fullname =  db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(200), nullanle=False)
    is_verified = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    password = db.Column(db.String(512), nullable=False)

    def set_hashed_password(self, password):
        self.password = bcrypt.hashpw(password=password.encode('utf-8'), salt=bcrypt.gensalt()).decode('utf-8')
    
    def check_pasword(self, password):
        return bcrypt.checkpw(password=password.encode('utf-8'), hashed_password=self.password.encode('utf-8'))
