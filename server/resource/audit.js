var jsonApi = require('jsonapi-server');

jsonApi.define({
  namespace: 'ecom',
  resource: 'audit',
  description: 'A historic record of something that has occured.',
  searchParams: {
    query: jsonApi.Joi.string()
      .description('Fuzzy text match against names')
      .example('learn')
  },
  attributes: {
    who: jsonApi.Joi.string().required()
      .description('who performed it')
      .example('x'),
    what: jsonApi.Joi.string().required()
      .description('what was performed')
      .example('x'),
    where: jsonApi.Joi.string().required()
      .description('where was it performed')
      .example('x'),
    when: jsonApi.Joi.string().required()
      .description('when was it perfomed')
      .example('x'),
    why: jsonApi.Joi.string().required()
      .description('what was it performed')
      .example('x')
  }
});
