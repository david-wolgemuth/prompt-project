
What I would have done, had I been willing to spend more time.

## \# 1 - Change the Data Model

I spent some time altering the data model, then decided "fixing" it would take too much time, and might be going against the whole spirit of the exercise

However.  I'll spend some time complaining about it :D

The Data Structure, as it unfolded:
(this might not have been the intention of the original devs... but seemed to be the path hinted to me)

```
FeedbackRequest: {
    Essay: {
        Parent Essay (`revision_of`) {
            FeedbackRequest: {
                ...recursive
            }
        }
    },
    Comment: {
        Editor: {}
    }
}
```

I would rarely recommend a recursive `singly-linked-list` as the main data structure, unless the business model is clearly asking for it.
It leads to very strange NON-PERFORMANT queries,
and is difficult to reason about overall state when looking at a single node

A `tree` would be a far better approach here, with `Essay` as the root.
(The main "noun" we're working with is an "Essay")

Example of how I might structure it:

```
Essay: {
    author
    content: String  (as it is currently)
    FeedbackRequests [
        {
            <!-- if RevisionID _or_ Comment, should be excluded from main list -->
            RevisionID (null if on active version of Essay)
            Comment (request is "unresolved" if null): {
                Editor: {}
            }
        }
        ...
    ]
    Revisions: [
        {
            content: String (content prior to revision)
            timestamps
        }
        ...
    ]
}
```
