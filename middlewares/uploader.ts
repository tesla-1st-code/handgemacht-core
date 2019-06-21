const multer = require('multer');

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads/' + req["orgCode"] + "/")
    },
    filename: function (req, file, cb) {
      const fileName = req["orgCode"] + "-" + file.fieldname;
      cb(null, fileName + '-' + Date.now())
    }
});
