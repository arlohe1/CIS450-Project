/*Joins on state and county. For each county, calculates percentage_demographic * county_population
* Sums up that number across all counties to get the total population of each demographic affected by the 
* natural disasters. Uses this to find the split across demographics affected, by percentage. */
--SELECT white_total/
SELECT white_total/total AS percent_white, hispanic_total/total AS percent_hispanic, 
black_total/total AS percent_black, native_total/total AS percent_native, asian_total/total AS percent_asian,
pacific_total/total AS percent_pacific FROM 
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
    );

/*Filter the natural disasters to determine the distribution of occurrences across different regions of the 
United States and return the regions with the highest/lowest occurrences*/
SELECT D.state AS state, D.cz_name AS county, COUNT(*) AS count
FROM Disaster D INNER JOIN County C 
ON D.state_cleaned = C.state_cleaned AND D.cz_name_cleaned = C.name_cleaned
GROUP BY D.state, D.cz_name
ORDER BY count DESC;

/*County & State with Highest occurence*/
WITH T AS 
    (SELECT D.state AS state, D.cz_name AS county, COUNT(*) AS count
    FROM Disaster D INNER JOIN County C 
    ON D.state_cleaned = C.state_cleaned AND D.cz_name_cleaned = C.name_cleaned
    GROUP BY D.state, D.cz_name
    ORDER BY count DESC)
SELECT state, county, count
FROM T
WHERE count = 
 (SELECT MAX(count)
 FROM T);
 
 /*County & State with lowest occurence*/
WITH T AS 
    (SELECT D.state AS state, D.cz_name AS county, COUNT(*) AS count
    FROM Disaster D INNER JOIN County C 
    ON D.state_cleaned = C.state_cleaned AND D.cz_name_cleaned = C.name_cleaned
    GROUP BY D.state, D.cz_name
    ORDER BY count DESC)
SELECT state, county, count
FROM T
WHERE count = 
 (SELECT MIN(count)
 FROM T);
 
/*Rank the natural disasters by Damaged property*/
SELECT * 
FROM Disaster
ORDER BY damage_property DESC;

/*Rank the natural disasters by Damaged property, grouped by event type*/
SELECT event_type, SUM(damage_property) AS property_sum
FROM Disaster
GROUP BY event_type
ORDER BY property_sum DESC;

/*Rank the natural disasters by Damaged crops*/
SELECT * 
FROM Disaster
ORDER BY damage_crops DESC;

/*Rank the natural disasters by Damaged crops, grouped by event type*/
SELECT event_type, SUM(damage_crops) AS crops_sum
FROM Disaster
GROUP BY event_type
ORDER BY crops_sum DESC;

/*Rank the natural disasters by injuries_direct*/
SELECT * 
FROM Disaster
ORDER BY injuries_direct DESC;

/*Rank the natural disasters by direct injuries, grouped by event type*/
SELECT event_type, SUM(injuries_direct) AS injuries_direct_sum
FROM Disaster
GROUP BY event_type
ORDER BY injuries_direct_sum DESC;

/*Rank the natural disasters by injuries_indirect*/
SELECT * 
FROM Disaster
ORDER BY injuries_indirect DESC;

/*Rank the natural disasters by injuries_indirect, grouped by event type*/
SELECT event_type, SUM(injuries_indirect) AS injuries_indirect_sum
FROM Disaster
GROUP BY event_type
ORDER BY injuries_indirect_sum DESC;

/*Rank the natural disasters by deaths_direct*/
SELECT * 
FROM Disaster
ORDER BY deaths_direct DESC;

/*Rank the natural disasters by deaths_direct, grouped by event type*/
SELECT event_type, SUM(deaths_direct) AS deaths_direct_sum
FROM Disaster
GROUP BY event_type
ORDER BY deaths_direct_sum DESC;

/*Rank the natural disasters by deaths_indirect*/
SELECT * 
FROM Disaster
ORDER BY deaths_indirect DESC;

/*Rank the natural disasters by deaths_indirect, grouped by event type*/
SELECT event_type, SUM(deaths_indirect) AS deaths_indirect_sum
FROM Disaster
GROUP BY event_type
ORDER BY deaths_indirect_sum DESC;

/*Join disaster and county tables to rank specific storm events by the total number of people affected (grouped by event_id)*/
SELECT d.event_id, SUM(total_pop) AS total_affected 
FROM disaster d
JOIN county c
ON d.state_cleaned = c.state_cleaned AND d.cz_name_cleaned = c.name_cleaned
GROUP BY d.event_id
ORDER BY total_affected DESC;

/*Join disaster and county tables to rank storm types by the total number of people affected (grouped by event_type)*/
SELECT d.event_type, SUM(total_pop) AS total_affected 
FROM disaster d
JOIN county c
ON d.state_cleaned = c.state_cleaned AND d.cz_name_cleaned = c.name_cleaned
GROUP BY d.event_type
ORDER BY total_affected DESC;

/*An example of querying the database to identify all storm events that occurred in a specific location at a specific time range and who
was affected (demographics, income, etc.), 
e.g. Philadelphia, Pennsylvania occurring between January 1, 2019 and April 30, 2019, */
SELECT d.event_id, d.event_type, d.state_cleaned, d.cz_name_cleaned, d.begin_date, d.end_date, 
c.total_pop, c.median_income, c.income_per_capita, c.poverty, c.unemployment_rate, 
c.percent_white, c.percent_hispanic, c.percent_black, c.percent_native, c.percent_asian, c.percent_pacific
FROM disaster d
JOIN county c
ON d.state_cleaned = c.state_cleaned AND d.cz_name_cleaned = c.name_cleaned
WHERE d.state_cleaned = 'pennsylvania' AND d.cz_name_cleaned = 'philadelphia'
AND d.begin_date >= '01-JAN-19' AND d.end_date <= '30-APR-19'
ORDER BY d.begin_date;
