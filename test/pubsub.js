'use strict';

require('should');
var peers = require('../lib/pubsub');

describe ('Peers (pubsub)', () => {

    it('should be able to publish', () => {
        peers.should.have.property('publish');
    });
    
    it('should be able to subscribe', () => {
        peers.should.have.property('subscribe');
    });
    
    it('should be able to unsubscribe', () => {
        peers.should.have.property('unsubscribe');
    });

});
