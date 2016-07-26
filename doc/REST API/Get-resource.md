Get a specific instance of the resource *type*.

````HTTP
GET /api/[type]/[id]
````

#### Arguments

- *type* - The name of a resource type
- *id* - the unique identifier of a resource

### Response


#### Errors

Status | Description
------ | -----------
400 | The resource type does not exist
401 | You need to authenticate yourself
403 | You do not have permission to view the resource
404 | The resource does not exist

