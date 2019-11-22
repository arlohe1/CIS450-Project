'use strict';

const {ALL_GENRES, TOP_10, RECOMMEND, BEST_OF} = require('./validationData.js');
// const {ALL_GENRES, TOP_10, RECOMMEND, BEST_OF} = require('./errorData.js');


const assert = require('assert');
const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

/* ---------- Q1 (Dashboard) Tests ---------- */
describe('Dashboard page', () => {

  it('should automatically load all genre buttons', (async () => {
      let driver = await new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();
      try {
          await driver.get('http://localhost:8081/');
          for (const genre of ALL_GENRES) {
            // console.log(`------- Q1a: Testing that Button for Genre = ${genre} Exists -------`);
            await driver.wait(until.elementLocated(By.id(`button-${genre}`)), 3000);
            const randButton = await driver.findElement(By.id(`button-${genre}`));
            const buttonText = await randButton.getText();
            await randButton.click();
            // console.log(`Test: ${buttonText} == ${genre}`);
            assert.equal(buttonText, genre);
          }
        } finally {
          await driver.quit();
        }
    })
  );

  it('should display the top 10 movies of the genre the user clicks', (async () => {
      let driver = await new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();
      try {
          await driver.get('http://localhost:8081/');
          for (const genre in TOP_10) {
            await driver.wait(until.elementLocated(By.id(`button-${genre}`)), 10000);
            const button = await driver.findElement(By.id(`button-${genre}`));
            await button.click();
            await driver.sleep(1000); // Wait for top movies to load.
            var results = await driver.findElements(By.css('#results'));
            await validateTopMovies(genre, results);
          }
        } finally {
          await driver.quit();
        }
    })
  );

  async function validateTopMovies(genre, result) {
    // console.log(`------- Q1b: Testing Genre = ${genre} -------`);
    const top10 = JSON.parse(TOP_10[genre]);
    for (const i in result) {
      const title = await result[i].findElement(By.className('title')).getText();
      // console.log(`Test: ${title} == ${top10[i]['title']}`);
      assert.equal(title, top10[i]['title']);
    }
  }

});

/* ---------- Q2 (Recommendation Page) Tests ---------- */
describe('Recommendation page', () => {

  it('should return the correct recommendations for a given user-inputted movie', (async () => {
      let driver = await new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();
      try {
          for (const title of Object.keys(RECOMMEND)) {
            await driver.get('http://localhost:8081/recommendations');
            const inputBox = await driver.findElement(By.id('movieName'));
            // Type in the movie title
            await inputBox.sendKeys(title);
            const submitButton = await driver.findElement(By.id('submitMovieBtn'));
            // Click Submit
            await submitButton.click();
            // Wait until the query results show up (will timeout after 60 seconds)
            await driver.wait(until.elementLocated(By.css('#results')), 60000);
            const results = await driver.findElements(By.css('#results'));
            await validateRecommendedMovies(title, results);
          }
        } finally {
          await driver.quit();
        }
    })
  );

  async function validateRecommendedMovies(title, results) {
    // console.log(`------- Q2: Testing Title = ${title} -------`);
    const expectedIds = RECOMMEND[title];
    for (const i in results) {
      const observedId = await results[i].findElement(By.className('id')).getText();
      // console.log(`Test: ${observedId} == ${expectedIds[i]}`);
      assert.equal(parseInt(observedId), expectedIds[i]);
    }
  }

});

/* ---------- Q3 (Best of Decades Page) Tests ---------- */
describe('Best Of page', () => {

  it('should return the correct movies for a given decade', (async () => {
      let driver = await new webdriver.Builder()
          .withCapabilities(webdriver.Capabilities.chrome())
          .build();
      try {
          for (const decade of Object.keys(BEST_OF)) {
            await driver.get('http://localhost:8081/bestof');
            await driver.sleep(2000); // Wait for decades to load.
            const dropdown = await driver.findElement(By.id('decadesDropdown'));
            await dropdown.click();
            await driver.sleep(2000); // Wait for options to populate
            await dropdown.sendKeys(decade);
            const submitButton = await driver.findElement(By.id('decadesSubmitBtn'));
            await submitButton.click();
            await driver.wait(until.elementLocated(By.css('#results')), 60000);
            const results = await driver.findElements(By.css('#results'));
            await validateDecadeResults(decade, results);
          }
        } finally {
          await driver.quit();
        }
    })
  );

  async function validateDecadeResults(decade, results) {
    // console.log(`------- Q3: Testing Decade = ${decade} -------`);
    const expectedResults = JSON.parse(BEST_OF[decade]);
    for (const i in results) {
      const observedTitle = await results[i].findElement(By.className('title')).getText();
      // console.log(`Test: ${observedTitle} == ${expectedResults[i]['title']}`);
      assert.equal(observedTitle, expectedResults[i]['title']);
    }
  }

});

// Resources:
// https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/
// https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Your_own_automation_environment
// https://seleniumhq.github.io/selenium/docs/api/javascript/index.html
// https://www.npmjs.com/package/selenium-webdriver
// https://mochajs.org/#using-async-await
