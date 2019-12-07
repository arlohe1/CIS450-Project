var express = require('express');
var router = express.Router();
var path = require('path');
// var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */

const oracledb = require('oracledb');


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

/* ----- Search ----- */
router.get('/filters', function(req, res) {
  console.log("entered filters router");
  var query = `
    SELECT DISTINCT event_type 
    FROM disaster d
    ORDER BY event_type
    `;
  connection.execute(query, function(err, rows, fields) {
  if (err) console.log(err);
  else {
    console.log(rows.rows);
    res.json(rows.rows);
  }
  });
}

);

router.get('/filters/:filterData/:month/:sortCategory', function(req, res) {
  console.log("in index.js search");

  var filterData = req.params.filterData;
  var month = req.params.month;
  var sortCategory = req.params.sortCategory;

  console.log(filterData);
  console.log(month);
  console.log(sortCategory);

  var query = '';

  if (filterData == "all events") {
    query = `
    SELECT episode_id, event_type, state, cz_name, to_char(cast(begin_date as date),'MM-DD-YYYY'), 
      injuries_direct+injuries_indirect AS total_injuries,
      deaths_direct+deaths_indirect AS total_deaths, 
      damage_property+damage_crops AS total_damages 
      FROM disaster d
    `;
  }

  else {
    query = `
    SELECT episode_id, event_type, state, cz_name, to_char(cast(begin_date as date),'MM-DD-YYYY'), 
      injuries_direct+injuries_indirect AS total_injuries,
      deaths_direct+deaths_indirect AS total_deaths, 
      damage_property+damage_crops AS total_damages 
      FROM disaster d
      WHERE event_type='${filterData}'
    `;
  }

  var lower;
  var upper;
  switch(month){
    case "January":
      lower = "JAN";
      upper = "FEB";
      break;
    case "February":
      lower = "FEB";
      upper = "MAR";
      break;
    case "March":
      lower = "MAR";
      upper = "APR";
      break;
    case "April":
      lower = "APR";
      upper = "MAY";
      break;
    case "May":
      lower = "MAY";
      upper = "JUN";
      break;
    case "June":
      lower = "JUN";
      upper = "JUL";
      break;
    case "July":
      lower = "JUL";
      upper = "AUG";
      break;
    default:
      lower = "JAN";
      upper = "AUG";
  }

  if (filterData == "all events") {
    query += ` WHERE begin_date >= '${"01-"+lower+"-19"}' AND end_date < '${"01-"+upper+"-19"}'`;
  }
  else {
    query += ` AND begin_date >= '${"01-"+lower+"-19"}' AND end_date < '${"01-"+upper+"-19"}'`;
  }


  switch(sortCategory) {
    case "Total Injuries":
      query += " ORDER BY total_injuries DESC";
      break;
    case "Total Damages":
      console.log("reached sort case damages");
      query += " ORDER BY total_damages DESC";
      break;
    case "Total Deaths":
      console.log("reached sort case deaths");
      query += " ORDER BY total_deaths DESC";
      break;
    case "Begin Date":
      console.log("reached sort case begin date");
      query += " ORDER BY begin_date DESC";
      break;
    default:
      query += " ORDER BY state, cz_name, begin_date";
  }

  console.log("final query, ", query);

  connection.execute(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });

});



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
