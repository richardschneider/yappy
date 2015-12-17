The following environent variables are used by the server.  Use `export` in *nix and `set` in windows.

- `NODE_ENV` one of `develop`, `CI` or `production`
- `IP` the server's IP address, defaults to 'http://localhost'
- `PORT` the server's port, defaults to 3000
-
- `SallySecret` the **required** secret for the [secure audit trail](https://github.com/richardschneider/sally)
- `YandexKey` API key to the [yandex translation service](https://tech.yandex.com/translate/)