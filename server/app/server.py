import os

from flask import Flask, request, redirect, url_for
from flask.ext import restful
from flask.ext.restful import reqparse, Api
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.bcrypt import Bcrypt
from flask.ext.httpauth import HTTPBasicAuth

basedir = os.path.join(os.path.abspath(os.path.dirname(__file__)), '../')

app = Flask(__name__)
app.config.from_object('app.config')

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
    return "---------"+app_name+"-------------- "+app_path


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

import views
