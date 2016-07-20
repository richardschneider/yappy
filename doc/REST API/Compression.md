# Compressed request

Not yet supported.

# Compressed response

The server will compresss responses when requested by the client; both [gzip](https://tools.ietf.org/html/rfc1952) and [deflate](https://tools.ietf.org/html/rfc1951) schemes are supported.  To request compression use the [Accept-Encoding](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3) HTTP header in the request.


````HTTP
GET /api/whoami
Accept-Encoding: gzip
````

````HTTP
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Encoding: gzip

...data....
````