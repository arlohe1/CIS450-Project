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

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

/* ----- Q2 (Recommendations) ----- */
router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

/* ----- Q3 (Best Of Decades) ----- */
router.get('/bestof', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

/* ----- Bonus (Posters) ----- */
router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
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

/* ----- Q1 (Dashboard) ----- */
router.get('/genres/', function(req, res) {
  //var connection = pool.getConnection();
  console.log("Inside genres route");
  var query = `
        SELECT * 
        FROM Disaster
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




/* ----- Q3 (Best Of Decades) ----- */

router.get('/decades', function(req, res) {
  var query = `
    SELECT * 
FROM Disaster
ORDER BY damage_property DESC
LIMIT 10;
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
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
