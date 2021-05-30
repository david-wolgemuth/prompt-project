import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { map, zipObject } from 'lodash'
import { Essay, FeedbackRequest, FeedbackState } from './feedbackTypes'

const initialState: any = {
  activeFeedbackRequestHistory: {},
  feedbackRequests: {},
  essays: {},
}

const feedbackSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addEssay(state, action: PayloadAction<Essay>) {
      state.essays[action.payload.pk] = action.payload
    },
    addEssays(state, action: PayloadAction<Essay[]>) {
      state.essays = { ...state.essays, ...zipObject(map(action.payload, 'pk'), action.payload) }
    },
    addFeedbackRequest(state, action: PayloadAction<FeedbackRequest>) {
      state.feedbackRequests[action.payload.pk] = action.payload
    },
    setFeedbackRequests(state, action: PayloadAction<FeedbackRequest[]>) {
      state.feedbackRequests = { ...zipObject(map(action.payload, 'pk'), action.payload) }
    },
    setActiveFeedbackRequestHistory(state, action: any) {
      state.activeFeedbackRequestHistory = action.payload;
    },
  },
})

export const { addEssay, addEssays, addFeedbackRequest, setFeedbackRequests, setActiveFeedbackRequestHistory } = feedbackSlice.actions
export default feedbackSlice.reducer
