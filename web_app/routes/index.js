var express = require('express');
var router = express.Router();
var path = require('path');

/* ----- Connects to your mySQL database ----- */

const oracledb = require('oracledb');
oracledb.fetchAsString = [ oracledb.CLOB ];



var connection;
async function run() {

  try {
    pool = await oracledb.createPool({
      user     : "hackerman",
      password : "beepboop",
      connectString : "cis450proj.c9gzklizhtyu.us-east-1.rds.amazonaws.com/cis450db"
  });

  connection = await pool.getConnection();

  } catch (err) {
    console.log(err);
  }
}

run();



/* ------------------------------------------- */
/* ----- Routers to handle FILE requests ----- */
/* ------------------------------------------- */

router.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

/* ----- Q2 (Recommendations) ----- */
router.get('/search', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'search.html'));
});

/* ----- Q3 (Best Of Decades) ----- */
router.get('/county', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'county.html'));
});

/* ----- Bonus (Posters) ----- */
router.get('/census', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'census.html'));
});

router.get('/episode', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'episode.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

/* Template for a FILE request router:

Specifies that when the app recieves a GET request at <PATH>,
it should respond by sending file <MY_FILE>

router.get('<PATH>', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', '<MY_FILE>'));
});

*/


/* ------------------------------------------------ */
/* ----- Routers to handle data requests ----- */
/* ------------------------------------------------ */
/* ----- (Dashboard) ----- */
router.get('/dashboardSummary', function(req, res) {
  //var connection = pool.getConnection();
  console.log("Inside dashboard route");
  var query = `
        SELECT event_id
        FROM Disaster
        WHERE ROWNUM <= 5
        ORDER BY damage_property DESC`;
  console.log("after query variable");
  connection.execute(query, function(err, rows, fields) {
    console.log("Reached connection query");
    if (err) {
      console.log("Reached here: ", err);
    }
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

/* ----- Q2 (Recommendations) ----- */

router.get('/county/:countyName', function (req, res) {
  console.log("in index.js county")

  var county = req.params.countyName;
  console.log(county);

  var query = `
  SELECT
    state,
    cz_name,
    event_type,
    to_char(cast(begin_date as date),'DD-MM-YYYY'),
    to_char(cast(end_date as date),'DD-MM-YYYY')
    injuries_direct,
    injuries_indirect,
    deaths_direct,
    deaths_indirect,
    damage_property,
    damage_crops
  FROM disaster
  WHERE cz_name_cleaned = '${county}'
  ORDER BY state`;

  console.log(query);

  connection.execute(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});

router.get('/census/:r', function(req, res) {
  var inputRace = req.params.r;
    console.log(inputRace);
  var query = `
    SELECT d.event_type, COUNT(*) AS num_counties
    FROM disaster d
    JOIN county c
    ON d.state_cleaned = c.state_cleaned AND d.cz_name_cleaned = c.name_cleaned
    WHERE percent_${inputRace} > 50
    GROUP BY d.event_type
    ORDER BY num_counties DESC`;

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});



router.get('/episodeEvents', function(req, res) {
  var ep_id = req.query.ep_id;
  var query = `
    SELECT D.*
    FROM disaster D
    WHERE D.episode_id=${ep_id}
    ORDER BY D.event_id DESC`;

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows.rows);
    }
  });
});

router.get('/episodeNarrative', function(req, res) {
  var ep_id = req.query.ep_id;
  var query = `
    SELECT EN.episode_narrative
    FROM EpisodeNarrative EN
    WHERE EN.episode_id=${ep_id}`;

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows.rows);
    }
  });
});




/* ----- Bonus (Posters) ----- */



/* General Template for GET requests:

router.get('/routeName/:customParameter', function(req, res) {
  // Parses the customParameter from the path, and assigns it to variable myData
  var myData = req.params.customParameter;
  var query = '';
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      // Returns the result of the query (rows) in JSON as the response
      res.json(rows);
    }
  });
});
*/


module.exports = router;
