The server relies upon a service adapter to perform a specific operation.  The operation can be implemented by multiple service adapters. If multiple services are available they are called in random order.  By using multiple service adapters the server is fault tolerant and can use another service for the same operation (in most cases).

The following service types (use) are built-in, see [lib/services](https://github.com/richardschneider/yappy/tree/master/lib/service) for the implementations.

- `fxrates` get the foreign exchange rates
- `translation` get a language translation for a phrase 
- `authentication` authenticate a user

Each service is configured with a default set of options.  The options typically include an `url` and `apikey`.  The `tenant` is allowed to enable/disable the service and to change the options.  When the service is invoked, its tenant specific options are passed as the last argument.

A [Permission](Permissions#service) check is performed to gaurantee that the user can `use` the service.
 
## fxrates

Get the foreign exchanges rates for a specified currency.

````javascript
function (base, currencies, options)
````

- `base` - the base currency, an alphabetic [ISO 4217 Currency code](http://www.iso.org/iso/home/standards/currency_codes.htm)
- `currencies` - the `Array` of currencies whose exchange rates are needed

Sample output
````json
{
  "source": "http://fixer.io",
  "base": "NZD",
  "date": "2015-12-16T02:00:00Z",
  "rates": {
    "USD": 0.67504,
    "CNY": 4.3669,
    "EUR": 0.61744,
    "NZD": 1
  }
}
```` 

## translation 

Get a translation in another language for a phrase.

**TODO**

## authentication 

A service that simply identifies (authenticates) the user from the credentials (claims) in the request. The service must either return a [`user`](https://github.com/richardschneider/yappy/blob/master/lib/model/resource/user.js) with at least an email address or a `Promise.reject()`.

````javascript
function (req, options)
````
- `req` - the incoming request.  Typically the `Authorization` HTTP header is examined.

If successful a `user` object is returned.  At a minimal the `user` must include the `email` address.

````json
{
  "displayName": {
    "tag": "en",
    "text": "Alice"
  },
  "email": "alice@abc.org",
  "name": {
    "tag": "en",
    "text": "Tom's Alice"
  },
  "homepage": "https://www.youtube.com/watch?v=aEj-mrwwaxo",
}
````