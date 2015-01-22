from marshmallow import Serializer, fields

class UserSerializer(Serializer):
    class Meta:
        fields = ("id", "email")

class PostSerializer(Serializer):
    user = fields.Nested(UserSerializer)

    class Meta:
        fields = ("id", "title", "endpoint" ,"body", "user", "created_at", "status")

# class EndpointSerializer(Serializer):
#     user = fields.Nested(UserSerializer)

#     class Meta:
#         fields = ("id", "endpoint", "ep_body", "user", "created_at","posts")