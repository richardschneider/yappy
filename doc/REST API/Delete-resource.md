Delete a specific instance of the resource *type*.

````HTTP
DELETE /api/[type]/[id]
````

#### Arguments

- *type* - The name of a resource type
- *id* - the unique identifier of a resource

#### Remarks

Performs a physical of the resource.

!!! note
    The 204 status code is returned on success, NOT 200.

#### Response

````HTTP
HTTP/1.1 204 No Content
````

#### Errors

Status | Description
------ | -----------
400 | The resource type does not exist
401 | You need to authenticate yourself
403 | You do not have permission to delete the resource
404 | The resource does not exist

