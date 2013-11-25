module.exports.init = function(app) {
  var CourseCtrl = require('./Course');
  CourseCtrl.init(app);
  var UserCtrl = require('./User');
  UserCtrl.init(app);
  var AssignmentCtrl = require('./Assignment');
  AssignmentCtrl.init(app);

  var Auth = require('./Auth');
  Auth.init(app);

  var upload = require('./upload');
  upload.init(app);
};
