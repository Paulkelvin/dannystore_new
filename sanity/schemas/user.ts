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
    {
      name: 'shippingAddresses',
      title: 'Shipping Addresses',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Full Name',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'line1',
              title: 'Address Line 1',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'line2',
              title: 'Address Line 2',
              type: 'string',
            },
            {
              name: 'city',
              title: 'City',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'state',
              title: 'State',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'postalCode',
              title: 'Postal Code',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'country',
              title: 'Country',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
              initialValue: 'US',
            },
            {
              name: 'lastUsed',
              title: 'Last Used',
              type: 'datetime',
            },
            {
              name: 'isDefault',
              title: 'Default Address',
              type: 'boolean',
              initialValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'accountStatus',
      title: 'Account Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
          { title: 'Pending', value: 'pending' },
        ],
      },
      initialValue: 'pending',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
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