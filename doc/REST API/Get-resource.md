Get a specific instance of the resource *type*.

````HTTP
GET /api/[type]/[id]
````

#### Arguments

- *type* - The name of a resource type
- *id* - the unique identifier of a resource

#### Remarks

A conditional GET is requested using the `If-Modified-Since` or `If-None-Match` HTTP header.  If the condition is satisfied, then a `304 Not Modified` status is returned.  See [RFC 7232 Conditional Requests](https://tools.ietf.org/html/rfc7232) for more details.

#### Response

````HTTP
HTTP/1.1 200 OK
Last-Modified: Tue, 15 Dec 2015 06:37:33 GMT
Content-Type: application/json; charset=utf-8
Content-Length: ...
````

````json
{
  "likes": [
    "honey"
  ],
  "modifiedOn": "2015-12-15T06:37:33.792Z",
  "name": [
    {
      "tag": "en",
      "text": "teddy bear"
    },
    {
      "tag": "zh-TW",
      "text": "玩具熊"
    },
    {
      "tag": "zh-CH",
      "text": "玩具熊"
    }
  ],
  "_metadata": {
    "self": "/api/bear/566fb52d3c5c1d480aef0406",
    "type": "bear"
  }
}
````

#### Errors

Status | Description
------ | -----------
400 | The resource type does not exist
401 | You need to authenticate yourself
403 | You do not have permission to view the resource
404 | The resource does not exist

