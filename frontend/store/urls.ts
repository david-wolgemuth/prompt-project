export const Urls = {
  Login: () => '/login/',
  Logout: () => '/logout/',
  User: () => '/api/users/active_user/',
  FeedbackRequest: () => '/api/feedback-request/',
  FeedbackRequestHistory: (feedbackRequestPk: any) => `/api/feedback-request/${feedbackRequestPk}/history/`,
  FeedbackRequestComments: (feedbackRequestPk: any) => `/api/feedback-request/${feedbackRequestPk}/comment/`,
  PickUpFeedbackRequest: (feedbackRequestPk: any) => `/api/feedback-request/${feedbackRequestPk}/pick_up/`,
}
