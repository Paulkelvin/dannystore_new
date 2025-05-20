export default {
  name: 'session',
  title: 'Session',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
    },
    {
      name: 'sessionToken',
      title: 'Session Token',
      type: 'string',
    },
    {
      name: 'expires',
      title: 'Expires',
      type: 'datetime',
    },
  ],
  indexes: [
    {
      name: 'sessionToken',
      fields: [{ name: 'sessionToken' }],
      options: { unique: true },
    },
    {
      name: 'userId',
      fields: [{ name: 'userId' }],
    },
  ],
} 