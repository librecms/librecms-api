var fileupload = require('fileupload').createFileUpload('.uploads');
var upload = fileupload.middleware;

var uploadCtrl = {
  init: function(app) {
    app.post('/uploads', upload, function(req, res) {
      console.log('fileupload req.body = ' + JSON.stringify(req.body));
      return res.json(req.body.file);
    });

    app.get('/uploads/:filePath/:fileName', function(req, res, next) {
      var file = req.params.filePath + '/' + req.params.fileName;
      console.log('GET file = ' + file);
      fileupload.get(file, function(err, data) {
        if (err) return next(err);
        return next(data);
      });
    });
  }
};

module.exports = uploadCtrl;
