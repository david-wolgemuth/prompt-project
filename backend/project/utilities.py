from django.db.models import query
from project.models import FeedbackRequest, User


class FeedbackRequestManager:
	""" Helper methods related to FeedbackRequests. """

	@staticmethod
	def query_for_user(user: User, include_fulfilled: bool = False):
		""" Query all FeedbackRequests available to the current user.

			Includes those that are finished if requested. Otherwise, includes only unfinished.
		"""
		queryset = FeedbackRequest.objects.filter(assigned_editors=user, active_editor__isnull=True)
		if not include_fulfilled:
			queryset = queryset.filter(comment__isnull=True)
		return queryset
