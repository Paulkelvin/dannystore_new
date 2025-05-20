export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: any) => Rule.email(),
    },
    {
      name: 'emailVerified',
      title: 'Email Verified',
      type: 'datetime',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'string',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'User', value: 'user' },
          { title: 'Admin', value: 'admin' },
        ],
      },
      initialValue: 'user',
    },
  ],
  indexes: [
    {
      name: 'email',
      fields: [{ name: 'email' }],
      options: { unique: true },
    },
  ],
} 