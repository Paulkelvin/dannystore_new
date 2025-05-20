export default {
  name: 'account',
  title: 'Account',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
    },
    {
      name: 'provider',
      title: 'Provider',
      type: 'string',
    },
    {
      name: 'providerAccountId',
      title: 'Provider Account ID',
      type: 'string',
    },
    {
      name: 'refresh_token',
      title: 'Refresh Token',
      type: 'string',
    },
    {
      name: 'access_token',
      title: 'Access Token',
      type: 'string',
    },
    {
      name: 'expires_at',
      title: 'Expires At',
      type: 'number',
    },
    {
      name: 'token_type',
      title: 'Token Type',
      type: 'string',
    },
    {
      name: 'scope',
      title: 'Scope',
      type: 'string',
    },
    {
      name: 'id_token',
      title: 'ID Token',
      type: 'string',
    },
    {
      name: 'session_state',
      title: 'Session State',
      type: 'string',
    },
  ],
  indexes: [
    {
      name: 'providerAccountId',
      fields: [
        { name: 'provider' },
        { name: 'providerAccountId' },
      ],
      options: { unique: true },
    },
    {
      name: 'userId',
      fields: [{ name: 'userId' }],
    },
  ],
} 