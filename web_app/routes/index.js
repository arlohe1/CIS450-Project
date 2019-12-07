var express = require('express');
var router = express.Router();
var path = require('path');
// var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */

// var mysql = require('mysql');

// config.connectionLimit = 10;
// var connection = mysql.createPool(config);
const oracledb = require('oracledb');

// var connection;
// var pool = oracledb.createPool({
//   user     : "hackerman",
//   password : "beepboop",
//   connectString : "cis450proj.c9gzklizhtyu.us-east-1.rds.amazonaws.com:1521/cis450db"
// };


// function(err, connection)
//   {
//     if (err) { console.error(err); return; }
//     connection.query(
//       "SELECT event_id, state_cleaned, cz_name_cleaned, damage_property "
//     + "FROM Disaster "
//     + "WHERE damage_property > 1000000 "
//     + "AND state='ohio'"
//     + "ORDER BY damage_property",
//       function(err, rows, fields)
//       {
//         if (err) { console.error(err); return; }
//         else {
//                   console.log(rows);
//                   res.json(rows);
//         }

//       });
//   }

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

//     const result = await connection.execute(
//       `
//     SELECT *
//       FROM Disaster
//       ORDER BY damage_property DESC
//       LIMIT 10;
//   `);
//     console.log(result.rows);

//   }

// catch (err) {
//   console.log(err);
// }

// }

// run();



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

  var query = `
  SELECT white_total/total * 100.0 AS percent_white, hispanic_total/total * 100.0 AS percent_hispanic,
  black_total/total * 100.0 AS percent_black, native_total/total * 100.0 AS percent_native, asian_total/total * 100.0 AS percent_asian,
  pacific_total/total * 100.0 AS percent_pacific FROM
    (SELECT T.*, white_total + hispanic_total + black_total + native_total + asian_total + pacific_total AS total
    FROM
        (SELECT SUM(white) AS white_total, SUM(hispanic) AS hispanic_total, SUM(black) AS black_total,
        SUM(native) AS native_total, SUM(asian) AS asian_total, SUM(pacific) AS pacific_total
        FROM
            (SELECT D.state AS state, D.cz_name AS county, C.percent_white * C.total_pop AS white,
            C.percent_hispanic * C.total_pop AS hispanic,
            C.percent_black * C.total_pop AS black,
            C.percent_native * C.total_pop AS native,
            C.percent_asian * C.total_pop AS asian,
            C.percent_pacific * C.total_pop AS pacific
            FROM Disaster D INNER JOIN County C
            ON D.state_cleaned = C.state_cleaned AND D.cz_name_cleaned = C.name_cleaned
            GROUP BY D.state, D.cz_name, C.percent_white, C.percent_hispanic, C.percent_black, C.percent_native, C.percent_asian,
            C.percent_pacific, C.total_pop
            ORDER BY D.cz_name)
        ) T
    )`;

  connection.execute(query, function (err, rows, fields) {
    if (err) console.log("In index.js error", err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});


router.get('/dashboardSummary/topEvents', function(req, res) {

  var query = `
    SELECT event_type, ROUND(damage_property/1000000) FROM
      (SELECT event_type, damage_property
       FROM
        (SELECT event_type, SUM(damage_property) AS damage_property
         FROM Disaster
         GROUP BY event_type)
       ORDER BY damage_property DESC)
    WHERE ROWNUM <= 5`;

  console.log(query);
  connection.execute(query, function (err, rows, fields) {
    if (err) console.log("In index.js error", err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});


/* ----- Q2 (Recommendations) ----- */




/* -----County----- */
// "movie" ("county") must be all lowercase and no punctuation or spaces
// router.get('/county/:countyName', function (req, res) {
//   console.log("in index.js county")
//   var county = req.params.countyName;
//   var query = `
//   SELECT T.state, T.county, T.begin_date, T.end_date, P.episode_narrative, V.event_narrative
//   FROM episodenarrative P JOIN
//   (SELECT state, cz_name as county, begin_date, end_date, episode_id, event_id
//   FROM disaster D
//   WHERE D.cz_name_cleaned = '${county}') T
//   ON P.episode_id = T.episode_id JOIN Eventnarrative V
//   ON V.event_id = T.event_id
//   ORDER BY T.state`;
//   console.log(query);
//   connection.execute(query, function (err, rows, fields) {
//     if (err) console.log(err);
//     else {
//       console.log(rows);
//       //console.log(query);
//       //console.log(err);
//       //console.log(fields);
//       res.json(rows.rows);
//     }
//   });
// });

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
      //console.log(query);
      //console.log(err);
      //console.log(fields);
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

  // console.log(query);

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
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
