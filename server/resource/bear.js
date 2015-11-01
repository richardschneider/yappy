var jsonApi = require("jsonapi-server");
var text = require("../model/text");

jsonApi.define({
  namespace: "ecom",
  resource: "bear",
  description: "Not the drinking kind",
  searchParams: {
    query: jsonApi.Joi.string()
      .description("Fuzzy text match against names")
      .example("learn")
  },
  attributes: {
    name: jsonApi.Joi.array().items(text()).required()
      .description("The names of the bear")
      .example([{ tag: 'en', text: 'Yogi'}])
  }
});
