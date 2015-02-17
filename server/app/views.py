from flask import g, request,render_template,Response,redirect,url_for,abort,send_from_directory,make_response
from flask.ext import restful

from server import api, db, flask_bcrypt, auth
from models import User, Post #, Endpoints
from forms import UserCreateForm, SessionCreateForm, PostCreateForm #, PostEndPointForm
from serializers import UserSerializer, PostSerializer, DomainSerializer #, EndpointSerializer
from werkzeug import secure_filename
import os,uuid,json,jsonschema


def extract(path):
    apps = path.split('&')
    app_name = apps[0].split('=')[1].split('.')[1]
    app_path = apps[1].split('=')[1]
    print app_name,app_path
    return app_name,app_path

def getResponse(app_name,app_path, method):
    print app_name,app_path, method
    posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod=method,status=1).first()
    body = DomainSerializer(posts).data['body']
    if body:
        return json.loads(body)
    else: 
        return 'Method Not allowed' , 405

def processResponse(apps):
    print apps
    for app in apps:
        app['body'] = json.loads(app['body'])
    return apps

def getallApps():
    posts = Post.query.filter_by(user=g.user).order_by('title','endpoint')
    return processResponse(PostSerializer(posts, many=True).data)

@auth.verify_password
def verify_password(email, password):
    user = User.query.filter_by(email=email).first()
    if not user:
        return False
    g.user = user
    return flask_bcrypt.check_password_hash(user.password, password)

class UserView(restful.Resource):
    def post(self):
        form = UserCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

        user = User(form.email.data, form.password.data)
        db.session.add(user)
        db.session.commit()
        return UserSerializer(user).data

class SessionView(restful.Resource):
    def post(self):
        form = SessionCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

        user = User.query.filter_by(email=form.email.data).first()
        if user and flask_bcrypt.check_password_hash(user.password, form.password.data):
            return UserSerializer(user).data, 201
        return '', 401

class PostListView(restful.Resource):
    @auth.login_required
    def get(self):
        return getallApps(),201

    @auth.login_required
    def post(self):
        form = PostCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        postdata = updatePosts(title = form.title.data,endpoint = form.endpoint.data , endpointmethod = form.endpointmethod.data,user=g.user,body=form.body.data)
        return getallApps(),201


class PostView(restful.Resource):
    def get(self, id):
        posts = Post.query.filter_by(id=id).first()
        return processResponse(PostSerializer(posts).data)

    @auth.login_required
    def post(self,id):
        form = PostCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        response = updatePosts(id=id,title=form.title.data,endpoint=form.endpoint.data,endpointmethod=form.endpointmethod.data,body=form.body.data)
        return response, 201

def updatePosts(**kwargs):
    body = kwargs.pop('body')
    if kwargs.has_key('id'):
        post = Post.query.filter_by(id=kwargs['id']).first()
    else:
        post = Post.query.filter_by(**kwargs).first()
    if PostSerializer(post).data['id']:
        post.body = json.dumps(body)
    else:
        post = Post(kwargs['title'], kwargs['endpoint'] ,json.dumps(body), kwargs['endpointmethod'])
        db.session.add(post)
    db.session.commit()
    return PostSerializer(post).data

     
class  Fileupload(restful.Resource):
    @auth.login_required
    def post(self):
        print request.files
        file = request.files['file']
	filename = secure_filename(file.filename)
	fname = str(uuid.uuid1()).replace('-','')+'.json'
	file.save(os.path.join('uploaded',fname))
        try:
	    if self.isValid(fname):
	        for data in self.content.get('endpoints',None):
		    for mets in  data.get('methods',None):
                        updatePosts(title = self.content.get('name',None),\
                                    endpoint = data.get('path',None),\
                                    endpointmethod = mets.get('method',None),\
                                    body = mets.get('result',None),user=g.user) 
		return getallApps(),200
            return {'Message':'Not parsed'}
	except: 
                import traceback
                print traceback.format_exc()
		return {'message':'There is some error reading your File.'}

    def isValid(self,fname):
        self.content = json.load(open('uploaded/'+fname))
        schema = json.load(open('json/schema'))
        return jsonschema.validate(self.content, schema) is None

class Alldomains(restful.Resource):
    def get(self, path):
        app_name,app_path = extract(path)
        return getResponse(app_name,app_path,'GET')

    def post(self, path):
        app_name,app_path = extract(path)
        return getResponse(app_name,app_path,'POST')

    def put(self,path):
        app_name,app_path = extract(path)
        return getResponse(app_name,app_path,'PUT')

    def delete():
        app_name,app_path = extract(path)
        return getResponse(app_name,app_path,'DELETE')


class ServiceSSview(restful.Resource):
    @auth.login_required
    def get(self, status, id):
        posts = Post.query.filter_by(id=id).first()
        k=1
        if status == 'false' or status=='stop':
             k = 0
        posts.status = k
        db.session.commit()
        return {'Message':'Successful','status':200}


class ServiceDeleteView(restful.Resource):
    @auth.login_required
    def post(self, id):
        posts = Post.query.filter_by(id=id).first()
        db.session.delete(posts)
        db.session.commit()
        return "successfully deleted"

class UI(restful.Resource):
    def get(self):
        return Response(render_template('index.html'),mimetype='text/html')

class samplejson(restful.Resource):
    def get(self):
        resp = make_response(send_from_directory(directory=api.app.config['SAMPLE_FOLDER'] , filename='app/sample/sample.json'))
        resp.headers["Content-Disposition"] = "attachment; filename=sample.json"
        return resp


# Adding Views as resources to Application

api.add_resource(UI,'/')
api.add_resource(samplejson,'/download')
api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(PostListView, '/api/v1/posts')
api.add_resource(PostView, '/api/v1/posts/<int:id>')
api.add_resource(Alldomains, '/<path:path>')
api.add_resource(ServiceSSview, '/apistatus/v1/<status>/<int:id>')
api.add_resource(ServiceDeleteView, '/apistatus/v1/delete/<int:id>')
api.add_resource(Fileupload,'/api/v1/upload')

