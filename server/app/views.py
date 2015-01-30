from flask import g
from flask.ext import restful

from server import api, db, flask_bcrypt, auth
from models import User, Post #, Endpoints
from forms import UserCreateForm, SessionCreateForm, PostCreateForm #, PostEndPointForm
from serializers import UserSerializer, PostSerializer, DomainSerializer #, EndpointSerializer

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
        posts = Post.query.filter_by(user=g.user)
        return PostSerializer(posts, many=True).data

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
        return PostSerializer(post).data, 201

class PostView(restful.Resource):
    def get(self, id):
        posts = Post.query.filter_by(id=id).first()
        return PostSerializer(posts).data

    @auth.login_required
    def post(self,id):
        form = PostCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422

	post = Post.query.filter_by(id=id).first()
        post.title = form.title.data
        post.endpoint = form.endpoint.data
	post.endpointmethod = form.endpointmethod.data
	post.body = form.body.data
        db.session.commit()
        return PostSerializer(post).data, 201




class Alldomains(restful.Resource):
    def get(self, path):
        apps = path.split('&')
        app_name = apps[0].split('=')[1].split('.')[1]
        app_path = apps[1].split('=')[1].split('.')[1]
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='GET').first()
        body = DomainSerializer(posts).data['body']
        if body:
            return body
        else: 
            return 'Method Not allowed' , 405

    def post(self, path):
        apps = path.split('&')
        app_name = apps[0].split('=')[1].split('.')[1]
        app_path = apps[1].split('=')[1].split('.')[1]
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='POST').first()
        if body:
            return body
        else: 
            return 'Method Not allowed' , 405
    
    def put(self,path):
        apps = path.split('&')
        app_name = apps[0].split('=')[1].split('.')[1]
        app_path = apps[1].split('=')[1].split('.')[1]
        posts = Post.query.filter_by(title= app_name, endpoint=app_path,endpointmethod='PUT').first()
        body = DomainSerializer(posts).data['body']
        print body
        if body:
            return body
        else:
            return 'Method Not allowed' , 405

    def delete():
	pass

class ServiceSSview(restful.Resource):
    @auth.login_required
    def post(self, status, id):
        posts = Post.query.filter_by(id=id).first()
        k=1
	if status == 'false' or status=='stop':
             k = 0
        posts.status = k
        db.session.commit()
        return PostSerializer(posts).data


class ServiceDeleteView(restful.Resource):
    @auth.login_required
    def post(self, id):
        posts = Post.query.filter_by(id=id).first()
        db.session.delete(posts)
        db.session.commit()
        return "successfully deleted"
      
# Adding Views as resources to Application

api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(PostListView, '/api/v1/posts')
api.add_resource(PostView, '/api/v1/posts/<int:id>')
api.add_resource(Alldomains, '/<path:path>')
api.add_resource(ServiceSSview, '/apistatus/v1/<status>/<int:id>')
api.add_resource(ServiceDeleteView, '/apistatus/v1/delete/<int:id>')

