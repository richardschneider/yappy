var mongo = require('mongodb');
var Grid = require('gridfs-stream');

function GridFSStorage(db) {
    this.mongodb = db;
}

GridFSStorage.prototype._handleFile = function (req, file, done) {
     mongo.MongoClient.connect(this.mongodb, function (err, db) {
        if (err) throw new Error(err);
        var gfs = new Grid(db, mongo);
    
        req.body.tenantId = req.tenantId;
        var writestream = gfs.createWriteStream({
            filename: file.originalname,
            metadata: req.body,
            content_type: file.mimetype
        });

        file.stream.pipe(writestream);
        writestream.on('close', function (file) {
            req.gridfsEntry = file;
            done(null, { gridfsEntry: file });
        });
     });
};

function removeFile(id) {
    console.log('removeFile todo');
    gfs.remove({_id: id}, function (err) {
        if (err) return err;
        console.log('deleted file._id ', id);
    });
}

GridFSStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    delete file.buffer;
    if (file._id) removeFile(file._id);
    cb(null)
}

module.exports = function (opts) {
    return new GridFSStorage(opts);
};
