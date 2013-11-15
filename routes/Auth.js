var passport = require('passport');

var AuthCtrl = {
  init: function(app) {
    app.post('/auth/login', passport.authenticate('local'), function(req, res, next) {
      var user = req.user;
      if (!user) return res.status(401).end();
      user.getCourses(function(err, courses) {
        user = user.toObject();
        user.courses = courses;
        res.cookie('user', JSON.stringify({
          _id: user._id,
          userName: user.userName || 'unknown',
          firstName: user.firstName || 'Uknown',
          lastName: user.lastName || 'User',
          role: user.role || 'public',
          courses: user.courses || []
        }));
        return res.json(user);
      });
    });

    app.post('/auth/logout', function(req, res, next) {
      req.logout();
      res.status(200).end();
    });
  }
};
module.exports = AuthCtrl;
