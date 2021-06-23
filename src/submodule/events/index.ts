// eslint-disable-next-line import/prefer-default-export
export const TOPICS = {
  AUTH: {
    SIGNED: {
      IN: 'auth.signed.in',
      UP: 'auth.signed.up',
    },
  },
  USER: {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
  },
  TASK: {
    CREATED: 'task.created',
    UPDATED: 'task.updated',
    DELETED: 'task.deleted',
    CHECKED: 'task.checked',
    UNCHECKED: 'task.unchecked',
  },
  POST: {
    CREATED: 'post.created',
    UPDATED: 'post.updated',
    DELETED: 'post.deleted',
    PINNED: 'post.pinned',
    UNPINNED: 'post.unpinned',
  },
  POST_BODY: {
    UPDATED: 'post-body.updated',
  },
  CLIENT_VIEW: {
    CREATED: 'client-view.created',
    UPDATED: 'client-view.updated',
    DELETED: 'client-view.deleted',
  },
};
