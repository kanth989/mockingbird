from flask import g, request,render_template,Response,redirect,url_for,abort,send_from_directory
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
    return app_name,app_path

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
        return self.allapps,201

    @auth.login_required
    def post(self):
        form = PostCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        postdata = Post.query.filter_by(title = form.title.data,endpoint = form.endpoint.data , endpointmethod = form.endpointmethod.data).first()
        if PostSerializer(postdata).data['id']:
            return "Endpoint method already exists"
        post = Post(form.title.data, form.endpoint.data ,form.body.data, form.endpointmethod.data)
        db.session.add(post)
        db.session.commit()
        return self.allapps,201

    @property
    def allapps(self):
        posts = Post.query.filter_by(user=g.user)
        return PostSerializer(posts, many=True).data


class PostView(restful.Resource):
    def get(self, id):
        posts = Post.query.filter_by(id=id).first()
        return PostSerializer(posts).data

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
        post.title = kwargs['title']
        post.endpoint = kwargs['endpoint']
        post.endpointmethod = kwargs['endpointmethod']
        post.body = json.dumps(body)
    else:
        post = Post(kwargs['title'], kwargs['endpoint'] ,json.dumps(body), kwargs['endpointmethod'])
        db.session.add(post)
    db.session.commit()
    return PostSerializer(post).data

     
class  Fileupload(restful.Resource):
    @auth.login_required
    def post(self):
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
                                    body = mets.get('result',None)) 
		return redirect('/api/v1/posts')
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
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='GET').first()
        body = DomainSerializer(posts).data['body']
        if body:
            return body
        else: 
            return 'Method Not allowed' , 405

    def post(self, path):
        app_name,app_path = extract(path)
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='POST').first()
        body = DomainSerializer(posts).data['body']
        if body:
            return body
        else: 
            return 'Method Not allowed' , 405
    
    def put(self,path):
        app_name,app_path = extract(path)
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='PUT').first()
        body = DomainSerializer(posts).data['body']
        if body:
            return body
        else:
            return 'Method Not allowed' , 405

    def delete():
        app_name,app_path = extract(path)
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='PUT').first()
        body = DomainSerializer(posts).data['body']
        if body:
            return body
        else:
            return 'Method Not allowed' , 405

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


# Adding Views as resources to Application

api.add_resource(UI,'/')
api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(PostListView, '/api/v1/posts')
api.add_resource(PostView, '/api/v1/posts/<int:id>')
api.add_resource(Alldomains, '/<path:path>')
api.add_resource(ServiceSSview, '/apistatus/v1/<status>/<int:id>')
api.add_resource(ServiceDeleteView, '/apistatus/v1/delete/<int:id>')
api.add_resource(Fileupload,'/api/v1/upload')

