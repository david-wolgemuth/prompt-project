from rest_framework import serializers

from project.models import Essay, FeedbackRequest, User, FeedbackRequestComment


class _EssaySerializer(serializers.ModelSerializer):
	""" Serialize an Essay. """
	pk = serializers.IntegerField()
	class Meta:
		depth = 0
		model = Essay
		fields = '__all__'


class _FeedbackRequestComment(serializers.ModelSerializer):
	pk = serializers.IntegerField()
	class Meta:
		depth = 0
		model = FeedbackRequestComment
		fields = '__all__'


class FeedbackRequestSerializer(serializers.ModelSerializer):
	""" Serialize a FeedbackRequest. """
	pk = serializers.IntegerField()
	essay = _EssaySerializer(many=False)
	comment = _FeedbackRequestComment(many=False)

	class Meta:
		model = FeedbackRequest
		fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
	pk = serializers.IntegerField()
	active_feedback_request = FeedbackRequestSerializer(many=False)

	class Meta:
		depth = 0
		model = User
		fields = '__all__'
