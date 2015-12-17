# MongoDB

Created an account on [mongolab](https://mongolab.com/) with the name `makaretu` and the [sandbox database](https://mongolab.com/databases/ecom) named `ecom`.  Added a user with the name `demo`; its password is the same as the name.

## Verify access

Install [mongo](https://www.mongodb.org/downloads?_ga=1.34695457.1689087146.1445643342#production); then try

    >mongo ds051838.mongolab.com:51838/ecom -u demo -p XXXX
    MongoDB shell version: 3.0.7
    connecting to: ds051838.mongolab.com:51838/ecom
    rs-ds051838:PRIMARY> db.runCommand({ping:1});
    { "ok" : 1 }

## Local database

Follow [these instructions](https://docs.mongodb.org/getting-started/shell/tutorial/install-mongodb-on-windows/) to setup mongo database server.

## Server configuration

The API server uses a [configuration file](https://github.com/richardschneider/ecom/tree/master/config) that specifies which database(s) to use.  The [config](https://www.npmjs.com/package/config) package is used  so that different environments (development, CI, production, ...) can use different one.
