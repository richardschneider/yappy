var mongoose = require('mongoose');
var express = require('express');
var Schema = mongoose.Schema;
var router = express.Router();

var schema   = new Schema({
	name: String
});
var Bear = mongoose.model('Bear', schema);

router.post('/', function(req, res) {
	var bear = new Bear();		// create a new instance of the Bear model
	bear.name = req.body.name;  // set the bears name (comes from the request)

	bear.save(function(err) {
		if (err)
			res.send(err);

		res.json({ message: 'Bear created!' });
	});
});
		
router.get('/', function(req, res) {
	Bear.find(function(err, bears) {
		if (err)
			res.send(err);

		res.json(bears);
	});
});

router.get('/:id', function(req, res) {
	Bear.findById(req.params.id, function(err, bear) {
		if (err)
			res.send(err);
		res.json(bear);
	});
});

router.put('/:id', function(req, res) {
	Bear.findById(req.params.id, function(err, bear) {

		if (err)
			res.send(err);

		bear.name = req.body.name;
		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear updated!' });
		});

	});
});

router.delete('/:id', function(req, res) {
	Bear.remove({
		_id: req.params.id
	}, function(err, bear) {
		if (err)
			res.send(err);

		res.json({ message: 'Successfully deleted' });
	});
});

module.exports = router;
