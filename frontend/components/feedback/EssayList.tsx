import { Card, Empty, List, message, PageHeader, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom';
import { getEssays, selectOrderedFeedbackRequests } from 'store/feedback/feedbackSelector'
import { loadFeedbackRequests, pickUpFeedbackRequest } from 'store/feedback/feedbackThunks'
import { loadActiveUser } from 'store/user/userThunks'
import { FeedbackRequest } from 'store/feedback/feedbackTypes'
import { getActiveUser } from 'store/user/userSelector';
import { useReduxDispatch } from 'store/store'

export const EssayList = () => {
  /**
   * TASK REQUIREMENTS
   *
   * Add to the edit queue page an interface that allows the editor to :
   * - pick up a request for feedback
   *
   * Include "Empty State"
   *  if the editor is on their queue while they have picked up an edit request
   */
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useReduxDispatch()
  const feedbackRequests = useSelector(selectOrderedFeedbackRequests)
  const activeUser = useSelector(getActiveUser);
  const essays = useSelector(getEssays)
  const history = useHistory();

  useEffect(() => {
    ; (async () => {
      setIsLoading(true)
      try {
        await dispatch(loadFeedbackRequests())
        await dispatch(loadActiveUser())
        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
        message.error('Failed to load essays. Please refresh this page to try again.')
      }
    })()
  }, [dispatch])

  const onClickGiveFeedback = async feedbackRequestPk => {
    try {
      await dispatch(pickUpFeedbackRequest(feedbackRequestPk));
      history.push(`feedback_requests/${feedbackRequestPk}`);
    } catch (err) {
      setIsLoading(false)
      message.error(String(err.response.data.errors))
    }
  }

  const renderAlreadyTakenActiveFeedbackMessage = () => {
    if (isLoading) {
      return (
        <Card className="center">
          <Spin />
        </Card>
      )
    }
    console.log(activeUser!.active_feedback_request);

    return (
      <Card>
        <Empty description="Please complete your active feedback request before starting a new one">
            <a
              href={`#/feedback_requests/${activeUser!.active_feedback_request.id}`}
            >Give Feedback</a>
        </Empty>
      </Card>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="center">
          <Spin />
        </Card>
      )
    }
    if (activeUser?.active_feedback_request) {
      return (
        renderAlreadyTakenActiveFeedbackMessage()
      );
    }
    return (
      <List
        itemLayout="horizontal"
        dataSource={feedbackRequests}
        renderItem={(item: FeedbackRequest) => {
          const essay = essays[item.essay]
          return (
            <List.Item
              actions={[
                <a
                  onClick={e => {
                    e.preventDefault();
                    onClickGiveFeedback(item.pk);
                  }}
                  href={`#/feedback_requests/${item.pk}`}
                >Give Feedback</a>]}
            >
              <List.Item.Meta title={essay.name} />
            </List.Item>
          )
        }} />
    )
  }

  return (
    <>
      <PageHeader ghost={false} title="Feedback Requests" />
      <Card>{renderContent()}</Card>
    </>
  )

}
