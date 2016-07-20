## CRUD routes

Verb | Path | Description
----- | -----------
GET | [/api/*type*/*id*](./GetInstance) | Get a specific instance of the resource *type*
GET | [/api/*type*](./GetInstances) | Get the instances of resource *type*
GET | [/api/*type*/schema](./GetSchema) | Get the schema for a resource *type*
DELETE | [/api/*type*/*id*](./DeleteInstance) | Delete a specific instance of the resource *type*
PATCH | [/api/*type*/*id*](./PatchInstance) | Update a specific instance of the resource *type*
PUT | [/api/*type*/*id*](./PutInstance) | Update a specific instance of the resource *type*
POST | [/api/*type*](./PostInstance) | Create a new instance of the resource *type*
POST | [/api/*type*/find](./FindInstances) | Get the instances of resource *type* that match the query document

## Misc routes

Verb | Path | Description
----- | -----------
GET | [/api/whoami](./Who Am I) | Get the instance of the `user`
GET | [forex](./forex) | Get currency exchange information
