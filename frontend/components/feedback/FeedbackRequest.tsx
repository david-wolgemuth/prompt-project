import { Input, Row, Card, Collapse, message, PageHeader, Spin, Button, Layout, Col, Empty } from 'antd'
import { isEmpty } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { getActiveFeedbackRequestHistory } from 'store/feedback/feedbackSelector'
import { loadFeedbackRequestHistory, postCommentOnFeedbackRequest } from 'store/feedback/feedbackThunks'
import { useReduxDispatch } from 'store/store'


export const FeedbackRequest = () => {
  /**
   * TASK REQUIREMENTS
   * You will then add a page that allows the editor to provide feedback.
   * Please base your design off of this Figma:
   *
   * https://www.figma.com/file/9RkIdF2b9j6YMpQqaGFSHI/Prompt-Project---Essay-Feedback-Interface-Design
   *
  */
  const dispatch = useReduxDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackComment, setFeedbackComment] = useState('')
  const { feedbackRequestPk } = useParams();
  const activeFeedbackRequestHistory = useSelector(getActiveFeedbackRequestHistory)
  const history = useHistory();

  console.log(activeFeedbackRequestHistory);

  useEffect(() => {
    ; (async () => {
      setIsLoading(true)
      try {
        await dispatch(loadFeedbackRequestHistory(feedbackRequestPk))
        setIsLoading(false)
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        message.error('Failed to load.')
      }
    })()
  }, [feedbackRequestPk])

  const onClickSubmit = async () => {
    if (!feedbackComment) {
      message.error('Comment must be filled in.')
      return
    }
    try {
      setIsLoading(true)
      await dispatch(postCommentOnFeedbackRequest(feedbackRequestPk, feedbackComment))
      setIsLoading(false)
      history.push('/');
    } catch (err) {
      setIsLoading(false)
      message.error('Failed to load.')
    }
  }

  const renderEssayRevision = (feedbackRequest) => (
    <Collapse.Panel header={feedbackRequest.essay.name} key="1">
      <Row>
        <Col span={12}>
          <Card>
            <h3>Essay</h3>
            {feedbackRequest.essay.content}
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <h3>Feedback</h3>
            {feedbackRequest.comment?.content}
          </Card>
        </Col>
      </Row>
    </Collapse.Panel>
  )

  if (isLoading) {
    return (
      <Card className="center">
        <Spin />
      </Card>
    )
  }

  const lastestRequest = activeFeedbackRequestHistory[0];
  let requestHistory;
  if (lastestRequest.comment) {
    // Already submitted feedback
    requestHistory = activeFeedbackRequestHistory.slice(0);
  } else {
    requestHistory = activeFeedbackRequestHistory.slice(1);
  }


  return (
    <>
      <PageHeader ghost={false} title={lastestRequest.essay.name} extra={[<Button key="submit-button" type="primary" onClick={onClickSubmit}>Submit Feedback</Button>]} />
      <Layout>
        <Layout.Content style={{padding: '50px'}}>
          <Card>
            <h3>Previous Feedback</h3>
            <Collapse>
              {requestHistory.map(feedbackRequest => (
                renderEssayRevision(feedbackRequest)
              ))}
            </Collapse>
          </Card>
        </Layout.Content>
        <Layout.Content style={{padding: '50px'}}>
          {lastestRequest.comment ?(
            <Empty description="Already submitted feedback.">
                <a
                  href={`#`}
                >Return to Requested Feedback List</a>
            </Empty>
          ) : (
            <Row>
              <Col span={12}>
                <Card>
                  <h3>Essay</h3>
                  {lastestRequest.essay.content}
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <h3>Feedback</h3>
                  <Input.TextArea onChange={e => setFeedbackComment(e.target.value)} value={feedbackComment} />
                </Card>
              </Col>
            </Row>
          )}
        </Layout.Content>
      </Layout>
    </>
  )

}
