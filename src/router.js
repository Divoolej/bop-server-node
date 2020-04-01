const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes');

const router = express();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/telegram', routes.telegram);

module.exports = router;
