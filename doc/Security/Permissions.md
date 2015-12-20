Permission are used to determine if an user/account is allowed to perform an activity. The [Apache Shiro](http://shiro.apache.org/permissions.html) scheme is used.  Permissions are grouped in a `Role` and a user/account can be member of many roles.

A permission consists of a *scope*, *noun* and *verb* followed by instance information.  Each component of the permission is separated by a `:`; such as `api:customer:view:123` for a resource or `service:fxrates:use:yahooXchange` for a service.

## Resource

Access to a resource (product, customer, etc.) is controlled by the resource permissions; which contain the resource type, an activity name and the resource id.  For example, `api:product:change` allows changing of all products; where as `api:customer:view:123` allows viewing of the specific customer.

The supported activities are `create`, `view`, `change`, `delete` and `find`.

## Classified information

[Classified information](../Classified-information) is data that is claimed to be sensitive information that requires protection of confidentiality or integrity.  A security level can be assigned, which determines accessiability and encryption strength.


By default the server never releases classified information in the plain.  The information is always redacted as `███████`.  A special call to the service is made to get the plain text version and of course a permission is required, which contains the security level, resource type, the activity name, resource id and classified information field name, such as `restricted:customer:view:123:dob`.

The supported activity is `view`.

## Service

A [service](../Services) is an adapter to another system.  Services are grouped by functionality, so that the system can still be used even if one service provider is failing.  The current service groups
- `fxrates` foreign currency exchange rates
-
- `translation` translation from one language to another
- `authentication` authenticate a user

The permission to use a service is composed of the service group and service name; such as `service:fxrates:use:yahooXchange`.

This is only one activity `use`.

## Misc

- `public:view` permission that everyone has
