Classified information is data that is claimed to be sensitive information that requires protection of confidentiality and/or integrity.  This information is assigned one the following security levels

- `unclassified` WYSIWYG (what you see is what you get) and is searchable
- `restricted` redacted but stored as plain text so is searchable
- `sensitive` redacted and stored as cipher text but is equal searchable
- `secret` redacted and stored as  cipher text  and is not searchable
- `top-secret` same as `secret` but also requires approval from someone who can already view the information

By convention, `classified` (anything above `unclassified`) information has a property name starting with one of the following special symbols

prefix | level
------- | -----
`*` | `restricted`
`~` | `sensitive`
`!` | `secret`
`^` | `top-secret`

## Data at rest

`classified` information is encrypted at the application layer.  This prevents exposing the information in backups or by sysadmins using database inspection tools.  The [AES-256-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) algorithm is used; it is an authenticated encryption algorithm designed to provide both data authenticity (integrity) and confidentiality.

Encrypted data contains a *key id* and *algorithm id*, which allows for key rotation/retirement and algorithm upgrades. 

## Data in transit

By default, the server never releases classified information in the plain.  The information is always redacted as `███████`.  A special call to the service is made to get the plain text version and of course a permission is required, which contains the security level, resource type, the activity name, resource id and classified information field name, such as `restricted:customer:view:123:dob`.

When data is redacted, the server adds an URL into the `_metadata` for retrieval of the plain text.

````http
GET /api/bear/5669f60eba535d4e1bf6b307

HTTP/1.1 200 OK

{
  "likes": [
    "honey"
  ],
  "modifiedOn": "2015-12-10T22:00:46.222Z",
  "name": [
    {
      "tag": "en",
      "text": "teddy bear with a secret"
    }
  ],
  "!secret": "███████",
  "_metadata": {
    "self": "/api/bear/5669f60eba535d4e1bf6b307",
    "type": "bear",
    "redactions": {
      "/!secret": "/api/bear/5669f60eba535d4e1bf6b307?only=/!secret"
    }
  }
}
```

In the above example, the `_metada.redactions` contains the URL(s) for any redacted field.  In this case there is only one redacted name, `!secret`.  Note that the `redactions` key is a JSON Pointer to the redacted field.  Following the link returns the plain text of the secret.

````http
GET /api/bear/5669f60eba535d4e1bf6b307?only=/!secret

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8

hates honey
````
