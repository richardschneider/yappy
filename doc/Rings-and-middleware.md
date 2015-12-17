0. `sally` Secure audit logging
1. `express` 
    * Standard express request/response middleware (compression, bodyParser, ...)
    * self-test - verifies that a response is correct
2. `security`
   * multi-tenancy - Determines the tenant based on the URL and prevents returning other tenant's data
   * authentication - identity the user
   * authorization - activity based permissions
3. `mung` Resource/document transformation
   * Redact - removing sensitive data
   * Metadata - adding `_metadata` and 
   * Upgrade - gradual upgrade of a resource
4. `plug-ins` Mini applications
   * `/api/media`
   * `/api/:type`
   * `/forex`
   * `/api-test`

When a lower ring needs access to a higher level ring it must call the server via `myself` - [dog food #70](https://github.com/richardschneider/ecom/issues/70) 

````
myself(req)
   .get('/api/tenant/123')
   .then(tentant => ...);
````

Components at the same ring level can off-load work to each other using the `handle` method.  Here `media` lets `crud` do some of the work.

````
router.get('/media', function(req, res, next) {
    return crud.handle(req, res, next);
});

router.get('/media/:id', function(req, res, next) {
    return crud.handle(req, res, next);
});
````
