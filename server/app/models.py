from flask import g

from wtforms.validators import Email

from server import db, flask_bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, info={'validators': Email()})
    password = db.Column(db.String(80), nullable=False)
    posts = db.relationship('Post', backref='user', lazy='dynamic')
    

    def __init__(self, email, password):
        self.email = email
        self.password = flask_bcrypt.generate_password_hash(password)

    def __repr__(self):
        return '<User %r>' % self.email

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    endpoint =db.Column(db.String(220), nullable=False)
    body = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status  = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    # enpoint_id = db.Column(db.Integer, db.ForeignKey('eposts.id'))
    

    def __init__(self, title, endpoint,body):
        self.title = title
        self.endpoint= endpoint
        self.body = body
        self.user_id = g.user.id

    def __repr__(self):
        return '<Post %r>' % self.title


# class Endpoints(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     endpoint = db.Column(db.String(120), nullable=False)
#     ep_body = db.Column(db.Text, nullable=False)
#     created_at = db.Column(db.DateTime, default=db.func.now())
#     posts = db.relationship('Post', backref='eposts', lazy='dynamic')
    

#     def __init__(self, endpoint, ep_body,posts):
#         self.endpoint = endpoint
#         self.ep_body = ep_body
#         self.posts = posts

#     def __repr__(self):
#         return '<Endpoint %r>' % self.endpoint