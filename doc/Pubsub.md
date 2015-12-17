[Publish/Subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern), aka `pubsub`, is used for inter-communication in a loosely-coupled system. An event consists of an `topic` string and a `message` object.  `topic` names are hierarchical and are rooted at `/ecom`.

## Usage
The `peers` object contains the `publish`, `subscribe` and `unsubscribe` functions. The [strong-pubsub](https://github.com/strongloop/strong-pubsub) package is used.  We start out with just a local in-app pubsub for the time being.  Then later scale-out to the internet to inform other server and even clients.

    let peers = require('../lib/pubsub');
    peers.publish('/yappy/api/change/user', req.originalUrl);

## Caches
Caches need to be [invalidated](https://github.com/richardschneider/yappy/issues/69) when a resource is modified.  The crud layer will send a message containing the resource ID on modification.  The cache can then remove its entry for the resource.  Simple as.

## Workflow
A Workflow can listen for an event and then kick-off some processing task.

For example, when a `tenant` is created it **should** receive an email to activate the account.  Or when a purchase is authorised then the `fulfillment` system is engaged.

## Events

topic | message | description
----- | ------- | -----------
/yappy/api/create/*type* | url to resource | published when a resource is created.
/yappy/api/change/*type* | url to resource | published when a resource is changed.
/yappy/api/delete/*type* | url to resource | published when a resource is deleted.
/yappy/error/server | JSON error | published when an internal error is encountered.
/yappy/error/*service* | JSON error | published when a [service](Service.md) fails.
