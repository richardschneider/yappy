Authentication is the basis of trust in `yappy`.  An [authentication service](Services.md#authentication) is trusted to verify the identity of a `user` or a software agent acting on behalf of a `user`.  Once identified, the [permissions](Permissions.md) for the user can then be determined.

In `yappy` a user is not specific to a `tenant`, which works well with social logins.  The user's email address is considered universally unique.  The user's [roles](Roles.md) are tenant specific.
