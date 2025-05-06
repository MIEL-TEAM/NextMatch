
module.exports = {

  functions: {
    'api/videos': {
      memory: 3008, 
      maxDuration: 60, 
    },
  },

  headers: [
    {
      source: '/api/videos',
      headers: [
        {
          key: 'x-vercel-max-body-size',
          value: '100mb', 
        },
      ],
    },
  ],
};
