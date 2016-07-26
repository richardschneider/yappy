## CRUD routes

Verb | Path | Description
---- | ---- | -----------
GET | [/api/*type*/*id*](./Get-resource) | Get a specific instance of the resource *type*
GET | [/api/*type*](./Get-instances) | Get the instances of resource *type*
GET | [/api/*type*/schema](./Get-schema) | Get the schema for a resource *type*
DELETE | [/api/*type*/*id*](./Delete-resource) | Delete a specific instance of the resource *type*
PATCH | [/api/*type*/*id*](./Patch-resource) | Update a specific instance of the resource *type*
PUT | [/api/*type*/*id*](./Put-resource) | Update a specific instance of the resource *type*
POST | [/api/*type*](./Post-resource) | Create a new instance of the resource *type*
POST | [/api/*type*/find](./Find-instances) | Get the instances of resource *type* that match the query document

## Misc routes

Verb | Path | Description
---- | ---- | -----------
GET | [/api/whoami](./Who Am I) | Get the instance of the current s`user`
GET | [forex](./forex) | Get currency exchange information
