A response with a 4xx or 5xx [HTTP Status]() indicates an error.  The response payload contains an error object with further information.

The error object contains the following properties:

- `message` - human readable description of the error
- `details` - further information on the error.  It's an empty string if no further details are available.

````HTTP
HTTP/1.1 400 Bad Request
content-language: en
content-type: application/json; charset=utf-8
content-length: ...

{
  "message": "Resource type 'contact' is unknown",
  "details": ""
}
````

## Translation

`error.message` is in the language of the client and is indicated in the [Content-Language](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.12) HTTP header.  The simplest why to request translation is to add [Accept-Language](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4) in the request; see [Client language](./Client-language) for more details.

````HTTP
GET /api/contact/1 HTTP/1.1
Accept-Language: fr-FR
````

````HTTP
HTTP/1.1 400 Bad Request
content-language: fr
content-type: application/json; charset=utf-8
content-length: ...

{
  "message": "Type de ressource «contact» est inconnu",
  "details": ""
}
````

## Validation

Resources are validated against a schema; when in error a `422 Unprocessable Entity` is returned.  The `error.details` contains a list of properties and the reason why the value failed.  The property is specified in [JSON Pointer](https://tools.ietf.org/html/rfc6901) notation.

````HTTP
POST /api/bear HTTP/1.1
Content-Type: application/json
Content-Length: ...
Authorization: ...

{
  "name": [ {"text": "teddy bear"} ],
  "likes": "me"
}
````

````HTTP
HTTP/1.1 422 Unprocessable Entity
content-language: en
content-type: application/json; charset=utf-8
content-length: ...

{
  "message": "The supplied data is incorrect",
  "details": {
    "/name/0/tag": "key is not present in the object",
    "/likes": "me is not an instance of Array"
  }
}
````
