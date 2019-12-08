var express = require('express');
var router = express.Router();
var path = require('path');
var moment = require('moment');

/* ----- Connects to your mySQL database ----- */

const oracledb = require('oracledb');
oracledb.fetchAsString = [oracledb.CLOB];



var connection;
async function run() {

  try {
    pool = await oracledb.createPool({
      user: "hackerman",
      password: "beepboop",
      connectString: "cis450proj.c9gzklizhtyu.us-east-1.rds.amazonaws.com/cis450db"
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

router.get('/', function(req, res){
  res.redirect('/dashboard');
});

router.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/search', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'search.html'));
});

router.get('/county', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'county.html'));
});

router.get('/census', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'census.html'));
});

router.get('/episode', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'episode.html'));
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
      res.json(rows.rows);
    }
  })
});
    
    
router.get('/dashboardSummary/topRegion', function(req, res) {

  var query = `
  WITH T AS
    (SELECT D.state AS state, D.cz_name AS county, COUNT(*) AS count
    FROM Disaster D INNER JOIN County C
    ON D.state_cleaned = C.state_cleaned AND D.cz_name_cleaned = C.name_cleaned
    GROUP BY D.state, D.cz_name
    ORDER BY count DESC)
  SELECT state, county, count
  FROM T
  WHERE count = (SELECT MAX(count)
  FROM T)`;

  connection.execute(query, function (err, rows, fields) {
    if (err) console.log("topRegion", err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  })
});


router.get('/dashboardSummary/map', function(req, res) {

  var query = `
  SELECT D.state AS state, COUNT(*) AS count
  FROM Disaster D INNER JOIN County C
  ON D.state_cleaned = C.state_cleaned AND D.cz_name_cleaned = C.name_cleaned
  GROUP BY D.state
  ORDER BY count DESC`;

  connection.execute(query, function (err, rows, fields) {
    if (err) console.log("map", err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  })
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
  } else {
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
  switch (month) {
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
  } else {
    query += ` AND begin_date >= '${"01-"+lower+"-19"}' AND end_date < '${"01-"+upper+"-19"}'`;
  }


  switch (sortCategory) {
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

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });

});


/* ----- County ----- */
router.get('/county/:selectedState/:selectedCounty', function (req, res) {
  var county = req.params.selectedCounty.toLowerCase().replace(/\s+/g, '');
  var state = req.params.selectedState.toLowerCase().replace(/\s+/g, '');
  console.log("STATE: ", state);
  console.log("COUNTY", county);

  var query = `
  SELECT
    state,
    cz_name,
    to_char(cast(begin_date as date),'DD-MM-YYYY') AS begin_date,
    to_char(cast(end_date as date),'DD-MM-YYYY') AS end_date,
    episode_id
  FROM disaster
  WHERE cz_name_cleaned = '${county}'
  AND state_cleaned = '${state}'
  ORDER BY begin_date`;

  console.log(query);

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});

router.get('/county/:selectedState', function (req, res) {
  var state = req.params.selectedState.toLowerCase().replace(/\s+/g, '');
  console.log("STATE: ", state);

  var query = `
  SELECT
    state,
    cz_name AS county,
    to_char(cast(begin_date as date),'DD-MM-YYYY') AS begin_date,
    to_char(cast(end_date as date),'DD-MM-YYYY') AS end_date,
    episode_id
  FROM disaster
  WHERE state_cleaned = '${state}'
  ORDER BY county`;

  console.log(query);

  connection.execute(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});

router.get('/countyQuery', function(req, res) {
  console.log('IN INDEX.JS');
  var query = `
    SELECT DISTINCT state
    FROM County
    ORDER BY state ASC
  `;
  console.log('QUERY:');
  console.log(query);
  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log('QUERY RESULT: ')
      console.log(rows.rows);
      res.json(rows.rows);
    }
  });
});

router.get('/countyQuery/:selectedState', function (req, res) {
  var state = req.params.selectedState;
  console.log("Param in countyQuery state", state);
  var query = `
    SELECT name
    FROM County
    WHERE state = '${state}'
    ORDER BY name
    `;
  console.log(query);
  connection.execute(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows.rows);
      res.json(rows.rows);
    }
  });
});


/* ----- Census ----- */
router.get('/censusEvents', function(req, res) {
  var query = `
    SELECT event_type
    FROM disaster
    GROUP BY event_type
    ORDER BY event_type`;

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});


router.get('/censusEvents/:selectedEventType', function(req, res) {
  var inputType = req.params.selectedEventType;
  console.log('this is input', inputType);
  var query = `
    SELECT
      ROUND(AVG(percent_white)),
      ROUND(AVG(percent_black)),
      ROUND(AVG(percent_hispanic)),
      ROUND(AVG(percent_asian)),
      ROUND(AVG(percent_native)),
      ROUND(AVG(percent_pacific)),
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY income_per_capita ASC),
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY income_per_capita ASC),
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY income_per_capita ASC),
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY unemployment_rate ASC),
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY unemployment_rate ASC),
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY unemployment_rate ASC),
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY poverty ASC),
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY poverty ASC),
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY poverty ASC)
    FROM disaster d
    JOIN county c
    ON d.state_cleaned = c.state_cleaned AND d.cz_name_cleaned = c.name_cleaned
    WHERE event_type = '${inputType}'
    `;

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows.rows);
    }
  });
});


/* ----- Episodes ----- */
router.get('/episodeEvents', function(req, res) {
  var ep_id = req.query.ep_id;
  var query = `
    SELECT D.*
    FROM disaster D
    WHERE D.episode_id=${ep_id}
    ORDER BY D.event_id ASC`;

  connection.execute(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      for(event of rows.rows) {
        event[3] = moment(event[3]).format("MMM DD, YYYY");
        event[4]= moment(event[4]).format("MMM DD, YYYY");
      }
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