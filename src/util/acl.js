import AccessControl from 'accesscontrol';

const grantsObject = {
  admin: {
    // user resource
    user: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
  },
  user: {
    // user resource
    user: {
      'create:any': ['*'],
      'read:own': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
  },
};

export default new AccessControl(grantsObject);
