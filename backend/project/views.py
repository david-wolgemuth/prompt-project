from django.db import transaction
from django.db.utils import IntegrityError
from django.shortcuts import redirect, render
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
import logging

from rest_framework import views
from rest_framework import viewsets
from rest_framework import status
from rest_framework import mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from project.models import FeedbackRequest, FeedbackRequestComment

from project.serializers import FeedbackRequestSerializer, UserSerializer
from project.utilities import FeedbackRequestManager

log = logging.getLogger(__name__)


class FeedbackRequestViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
	""" Viewset for views pertaining to feedback requests. """

	serializer_class = FeedbackRequestSerializer
	permission_classes = (IsAuthenticated,)

	def get_serializer_class(self):
		return super().get_serializer_class()

	def get_queryset(self):
		return FeedbackRequestManager.query_for_user(self.request.user, include_fulfilled=False).select_related('essay')

	@action(detail=True, methods=['get'])
	def history(self, request, pk: int = None):
		"""
		Warning, dumb (very un-performant) code ahead.
			I'm quite frustrated at the models, and their relationships.
				(likely I don't understand the original devs' intent...)
			but don't want to spend a bunch of time ripping
			up a codebase that I'll never see again
		"""
		feedback_request = FeedbackRequest.objects.get(pk=pk)
		request_history = []

		while True:
			request_history.append(feedback_request)
			if feedback_request.essay.revision_of:
				feedback_request = feedback_request.essay.revision_of.feedback_request
			else:
				break

		return Response(FeedbackRequestSerializer(request_history, many=True).data)

	@action(detail=True, methods=['put'])
	def pick_up(self, request, pk: int = None):
		try:
			with transaction.atomic():
				feedback_request = FeedbackRequest.objects.get(pk=pk)
				if feedback_request.active_editor:
					log.warning(f'FeedbackRequest({pk}) already picked up.')
					return Response({'errors': 'Feedback Request has already been picked up.'}, status=status.HTTP_409_CONFLICT)

				# rely on one-one db index ...
				# if request.user.active_feedback_request:
				# 	return Response({'errors': 'Editor has already picked up a request.'}, status=status.HTTP_409_CONFLICT)

				feedback_request.active_editor = request.user
				feedback_request.save()

				return Response(FeedbackRequestSerializer(feedback_request).data)

		except IntegrityError as e:
			log.warning(f'User({request.user.id}) already assigned feedback request. {e}')
			return Response({'errors': 'User already assigned Feedback Request.'}, status=status.HTTP_409_CONFLICT)

	@action(detail=True, methods=['post'])
	def comment(self, request, pk: int=True):
		feedback_request = FeedbackRequest.objects.get(pk=pk)
		if feedback_request.active_editor != request.user:
			log.warning(f'FeedbackRequest({pk}) comment submission attempted by non active user.')
			return Response({'errors': 'May only comment on active feedback request.'}, status=status.HTTP_400_BAD_REQUEST)

		comment = FeedbackRequestComment(
			feedback_request=feedback_request,
			editor=request.user,
			content=request.data['comment'],
		)
		comment.save()

		feedback_request.active_editor = None
		feedback_request.save()

		return Response(FeedbackRequestSerializer(feedback_request).data)



class UsersViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
	""" Viewset for views pertaining to feedback requests. """

	serializer_class = UserSerializer
	permission_classes = (IsAuthenticated,)

	@action(detail=False, methods=['get'])
	def active_user(self, request):
		return Response(UserSerializer(request.user).data)


class HomeView(views.APIView):
	""" View that takes users who navigate to `/` to the correct page, depending on login status. """

	def get(self, *args, **kwargs):
		if self.request.user.is_authenticated:
			return redirect('/platform/')
		return redirect('/login/')


class PlatformView(views.APIView):
	""" View that renders the essay review platform. """

	permission_classes = (IsAuthenticated,)

	def get(self, *args, **kwargs):
		return render(self.request, 'project/platform.html', {})


class LoginView(views.APIView):
	""" View for user login. """

	def get(self, *args, **kwargs):
		if self.request.user.is_authenticated:
			return redirect('/platform/')
		return render(self.request, 'project/login.html', {})

	def post(self, request, *args, **kwargs):
		user = authenticate(request, username=request.data.get('username'), password=request.data.get('password'))
		if user is None:
			# Auth failure
			return Response({'detail': 'Incorrect email or password.'}, status=status.HTTP_403_FORBIDDEN)
		auth_login(request, user)
		return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(views.APIView):
	""" View for user logout. """

	def post(self, request, *args, **kwargs):
		auth_logout(request)
		return Response(status=status.HTTP_204_NO_CONTENT)
