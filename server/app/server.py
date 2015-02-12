import os

from flask import Flask, request, redirect, url_for
from flask.ext import restful
from flask.ext.restful import reqparse, Api
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.bcrypt import Bcrypt
from flask.ext.httpauth import HTTPBasicAuth



basedir = os.path.join(os.path.abspath(os.path.dirname(__file__)), '../')
print basedir

app = Flask(__name__,static_folder='static')
app.config.from_object('app.config')
app.config['SAMPLE_FOLDER'] = basedir

# flask-sqlalchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.sqlite')
# app.config['SERVER_NAME'] = '127.0.0.1:5123'
db = SQLAlchemy(app)

import pdb
# pdb.set_trace()
# flask-restful
api = restful.Api(app)

# flask-bcrypt
flask_bcrypt = Bcrypt(app)

# flask-httpauth
auth = HTTPBasicAuth()

'''
@app.before_request
def before_request():
    print request.host
    print request.args
   


#@app.route('/', defaults={'path': ''}, subdomain='qa')
@app.route('/<path:path>')
def user_profile(path):
    print path
    apps = path.split('&') 
    print apps
    app_name = apps[0].split('=')[1].replace('wwww.','')
    app_path = apps[1].split('=')[1]
#    body =db.Post.query.filter_by(db.Post.title=app_name, db.Post.endpoint=app_path).first()
    return app_name
'''

@app.after_request
def after_request(response):
    print response.headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')    
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

import views
