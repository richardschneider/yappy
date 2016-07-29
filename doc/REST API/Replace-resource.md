Replace a specific instance of the resource *type*

````HTTP
PUT /api/[type]/[id]
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
- *id* - the unique identifier of a resource
- *content* - the new resource

#### Remarks

Replaces the entire contents of the resource.

The HTTP Header [Prefer: return=representation](https://tools.ietf.org/html/rfc7240) is used to returned the updated resource in the response; otherwise [204 No Content](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.2.5) is returned.

#### Response

````HTTP
HTTP/1.1 204 No Content
Location: /api/bear/566f89200782f5180a0dcb96
Last-Modified: Thu, 28 Jul 2016 03:36:03 GMT
````

or with `Prefer: return=representation`

````HTTP
HTTP/1.1 200 OK
Location: /api/bear/566f89200782f5180a0dcb96
Last-Modified: Thu, 28 Jul 2016 03:36:03 GMT
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
  "modifiedOn": "2016-07-28T03:36:03.450Z",
  "_metadata": {
    "self": "/api/bear/566f89200782f5180a0dcb96",
    "type": "bear"
  }
}
````

#### Errors

Status | Description
------ | -----------
400 | The resource type does not exist
401 | You need to authenticate yourself
403 | You do not have permission to replace the resource
404 | The resource does not exist
422 | The resource is invalid

