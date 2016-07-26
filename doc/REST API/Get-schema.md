Get the [schema](http://json-schema.org) of the resource *type*.

````HTTP
GET /api/[type]/schema
````

#### Arguments

- *type* - The name of a resource type

#### Response

````HTTP
HTTP/1.1 200 OK
Last-Modified: Tue, 26 Jul 2016 02:34:45 GMT
Content-Type: application/schema+json; charset=utf-8
Content-Length: 656

{
  "description": "Not the drinking kind.",
  "type": "object",
  "properties": {
    "name": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tag": {
            "type": "string",
            "pattern": "^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$",
            "required": true
          },
          "text": {
            "type": "string",
            "required": true
          }
        }
      },
      "required": true
    },
    "likes": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "required": true
    }
  },
  "_metadata": {
    "self": "/api/bear/schema"
  }
}
````

#### Errors

Status | Description
------ | -----------
400 | The resource type does not exist
401 | You need to authenticate yourself
403 | You do not have permission to view the resource
501 | The resource type is valid but a schema is not present

