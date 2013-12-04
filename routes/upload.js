var uploadPath = 'uploads';
var fileupload = require('fileupload').createFileUpload(uploadPath);
var upload = fileupload.middleware;

var uploadCtrl = {
  init: function(app) {
    app.post('/uploads', upload, function(req, res) {
      console.log(JSON.stringify(req.body.file));
      req.body.file.map(function(file) {
        file.uploadPath = uploadPath;
        return file;
      });
      return res.json(req.body.file);
    });

    app.get('/' + uploadPath + '/:filePath/:fileName', function(req, res, next) {
      var file = req.params.filePath + '/' + req.params.fileName;
      fileupload.get(file, function(err, data) {
        if (err) return next(err);
        return data ? res.sendfile(uploadPath + '/' + file) : res.status(404).end();
      });
    });
  }
};

module.exports = uploadCtrl;
