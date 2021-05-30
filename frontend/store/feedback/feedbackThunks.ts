import { Dispatch } from '@reduxjs/toolkit'
import API from 'store/api'
import { Urls } from 'store/urls'
import { addEssays, setFeedbackRequests, setActiveFeedbackRequestHistory } from './feedbackSlice'
import { Essay, FeedbackRequest } from './feedbackTypes'

type FeedbackRequestRetrieve = Omit<FeedbackRequest, 'essay'> & {
  essay: Essay
}

export const loadFeedbackRequestHistory = (feedbackRequestPk) => async (dispatch: Dispatch) => {
  try {
    const { data }: { data: FeedbackRequest[] } = await API.get(Urls.FeedbackRequestHistory(feedbackRequestPk))
    dispatch(setActiveFeedbackRequestHistory(data));
  } catch (err) {
    throw err;
  }
}

export const pickUpFeedbackRequest = (feedbackRequestPk) => async (dispatch: Dispatch) => {
  try {
    const { data }: { data: any } = await API.put(Urls.PickUpFeedbackRequest(feedbackRequestPk))
    return;
  } catch (err) {
    throw err;
  }
}

export const postCommentOnFeedbackRequest = (feedbackRequestPk, commentText) => async (dispatch: Dispatch) => {
  try {
    const { data }: { data: any } = await API.post(Urls.FeedbackRequestComments(feedbackRequestPk), { comment: commentText })
    return;
  } catch (err) {
    throw err;
  }
}

export const loadFeedbackRequests = () => async (dispatch: Dispatch) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const { data: frrs }: { data: FeedbackRequestRetrieve[] } = await API.get(Urls.FeedbackRequest())
    const allFeedbackRequests: FeedbackRequest[] = []
    const allEssays: Essay[] = []
    frrs.forEach(frr => {
      const { essay, ...frrDestructured } = frr
      const feedbackRequest: Partial<FeedbackRequest> = { ...frrDestructured }
      feedbackRequest.essay = essay.pk
      allEssays.push(essay)
      allFeedbackRequests.push(feedbackRequest as FeedbackRequest)
    })
    dispatch(setFeedbackRequests(allFeedbackRequests))
    dispatch(addEssays(allEssays))
    return allFeedbackRequests
  } catch (err) {
    throw err
  }
}
