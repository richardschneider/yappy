Create a new instance of the resource *type*

````HTTP
POST /api/[type]
Content-Type: application/json
````

````json
{
  "likes": [
    "honey"
  ],
  "name": [
    {
      "tag": "en",
      "text": "yogi"
    }
  ]
}
````

#### Arguments

- *type* - The name of a resource type
- *content* - the new resource

#### Remarks

The HTTP Header [Prefer: return=representation](https://tools.ietf.org/html/rfc7240) is used to returned the created resource in the response; otherwise only metadata is returned.

#### Response

````HTTP
HTTP/1.1 201 Created
Location: /api/bear/579abe7f36312d1c3cc416e0
Last-Modified: Fri, 29 Jul 2016 02:25:03 GMT
Content-Type: application/json; charset=utf-8
Content-Length: ...
````

````json
{
  "_metadata": {
    "self": "/api/bear/579abe7f36312d1c3cc416e0",
    "status": "ok"
  }
}
````

or with `Prefer: return=representation`

````HTTP
HTTP/1.1 201 Created
Location: /api/bear/579abf1a36312d1c3cc416e1
Last-Modified: Fri, 29 Jul 2016 02:27:38 GMT
Content-Type: application/json; charset=utf-8
Content-Length: ...
````

````json
{
  "likes": [
    "honey"
  ],
  "name": [
    {
      "tag": "en",
      "text": "yogi"
    }
  ],
  "modifiedOn": "2016-07-29T02:27:38.396Z",
  "_metadata": {
    "self": "/api/bear/579abf1a36312d1c3cc416e1",
    "type": "bear"
  }
}
````

#### Errors

Status | Description
------ | -----------
400 | The resource type does not exist
401 | You need to authenticate yourself
403 | You do not have permission to create the resource
422 | The resource is invalid

