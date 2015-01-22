from flask import g
from flask.ext import restful

from server import api, db, flask_bcrypt, auth
from models import User, Post #, Endpoints
from forms import UserCreateForm, SessionCreateForm, PostCreateForm #, PostEndPointForm
from serializers import UserSerializer, PostSerializer #, EndpointSerializer

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
    def get(self):
        posts = Post.query.all()
        return PostSerializer(posts, many=True).data

    @auth.login_required
    def post(self):
        form = PostCreateForm()
        if not form.validate_on_submit():
            return form.errors, 422
        post = Post(form.title.data, form.endpoint.data ,form.body.data)
        db.session.add(post)
        db.session.commit()
        return PostSerializer(post).data, 201

class PostView(restful.Resource):
    def get(self, id):
        posts = Post.query.filter_by(id=id).first()
        return PostSerializer(posts).data


# class EndPointListView(restful.Resource):
#     def get(self):
#         endpoints = Endpoints.query.all()
#         return EndpointSerializer(endpoints, many=True).data

#     @auth.login_required
#     def post(self):
#         form = PostEndPointForm()
#         if not form.validate_on_submit():
#             return form.errors, 422
#         endpoints = Endpoints(form.endpoint.data, form.ep_body.data, form.posts.data)
#         db.session.add(post)
#         db.session.commit()
#         return EndpointSerializer(endpoints).data, 201


# class EndPointView(restful.Resource):
#     def get(self, id):
#         posts = Endpoints.query.filter_by(posts=id).all()
#         return EndpointSerializer(posts).data


api.add_resource(UserView, '/api/v1/users')
api.add_resource(SessionView, '/api/v1/sessions')
api.add_resource(PostListView, '/api/v1/posts')
api.add_resource(PostView, '/api/v1/posts/<int:id>')
# api.add_resource(EndPointListView, '/api/v1/endpoints')
# api.add_resource(EndPointView, '/api/v1/endpoints/<int:id>')
