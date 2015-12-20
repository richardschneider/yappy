Authentication is the basis of trust in `yappy`.  An [authentication service](../Services.md#authentication) is trusted to verify the identity of a `user` or a software agent acting on behalf of a `user`.  Once identified, the [permissions](Permissions.md) for the user can then be determined.

In `yappy` a user is not specific to a `tenant`, which works well with social logins.  The user's email address is considered universally unique.  The user's [roles](../Roles.md) are tenant specific.

The [`/api/whoami`](http://test.yappy-richardschneider.c9users.io:8080/api/whoami) endpoint can be used to help resolve authentication and [authorisation](Authorisation.md) issues.  It returns all the information about calling user.

## middleware

Authentication adds the `user` object to the current `req`.  If the authentication service is also `trusted for authorization`, then the user can also contain the `permissions` and `roles` properties.

Sample `req.user` for an authenticated user

````json
{
  "displayName": {
    "tag": "en",
    "text": "Carole"
  },
  "email": "carol@abc.org",
  "isAuthenticated": true,
  "permissions": [
    "public:*",
    "unclassified:view",
    "api:*:view",
    "api:*:find"
  ]
}
````

Sample `req.user` for an anonymous user

````json
{
  "displayName": {
    "tag": "en",
    "text": "anonymous"
  },
  "email": "anonymous@::ffff:10.240.0.44",
  "isAuthenticated": false,
  "permissions": [
    "public:*",
    "unclassified:view",
    "api:*:view",
    "api:*:find"
  ]
}
````
