const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

const puzzles = require("../controllers/puzzle-strings.js");
const puzzlesAndSolutions = puzzles.puzzlesAndSolutions;

chai.use(chaiHttp);

function randomizeString(inputString) {
  let randomizedString = "";

  for (let i = 0; i < inputString.length; i++) {
    const randomCodeUnit = Math.floor(Math.random() * 65535);
    randomizedString += String.fromCharCode(randomCodeUnit);
  }

  return randomizedString;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

suite("Functional Tests", () => {
  test("Solve a puzzle with valid puzzle string: POST request to /api/solve", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: puzzle[0] })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.solution, puzzle[1]);
        });
    });
    done();
  });

  test("Solve a puzzle with missing puzzle string: POST request to /api/solve", function (done) {
    chai
      .request(server)
      .post("/api/solve")
      .send({})
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "Required field missing" });
        done();
      });
  });

  test("Solve a puzzle with invalid characters: POST request to /api/solve", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: randomizeString(puzzle[0]) })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
        });
    });
    done();
  });

  test("Solve a puzzle with incorrect length: POST request to /api/solve", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: puzzle[0].slice(0, getRandomInt(1, 79)) })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "Expected puzzle to be 81 characters long",
          });
        });
    });
    done();
  });

  test("Solve a puzzle with missing puzzle string: POST request to /api/solve", function (done) {
    chai
      .request(server)
      .post("/api/solve")
      .send({
        puzzle:
          "9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
      })
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "Puzzle cannot be solved" });
        done();
      });
  });

  test("Check a puzzle placement with all fields: POST request to /api/check", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      const index = getRandomInt(0, 80);
      const coordinate =
        String.fromCharCode(65 + parseInt(index / 9)) + ((index % 9) + 1);
      const value = puzzle[1][index];

      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle: puzzle[0], coordinate, value })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            valid: true,
          });
        });
    });
    done();
  });

  test("Check a puzzle placement with single placement conflict: POST request to /api/check", function (done) {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle:
          "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
        coordinate: "A1",
        value: "2",
      })
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid, false);
        assert.equal(res.body.conflict.length, 1);
        done();
      });
  });

  test("Check a puzzle placement with multiple placement conflicts: POST request to /api/check", function (done) {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle:
          "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
        coordinate: "A1",
        value: "1",
      })
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid, false);
        assert.isAtLeast(res.body.conflict.length, 2);
        done();
      });
  });

  test("Check a puzzle placement with all placement conflicts: POST request to /api/check", function (done) {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle:
          "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
        coordinate: "A1",
        value: "5",
      })
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.isFalse(res.body.valid, false);
        assert.equal(res.body.conflict.length, 3);
        done();
      });
  });

  test("Check a puzzle placement with missing required fields: POST request to /api/check", function (done) {
    chai
      .request(server)
      .post("/api/check")
      .send({
        puzzle:
          "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
      })
      .end((_err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "Required field(s) missing" });
        done();
      });
  });

  test("Check a puzzle placement with invalid characters: POST request to /api/check", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: randomizeString(puzzle[0]),
          coordinate: "A1",
          value: "1",
        })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
        });
    });
    done();
  });

  test("Check a puzzle placement with incorrect length: POST request to /api/check", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzle[0].slice(1, getRandomInt(1, 79)),
          coordinate: "A1",
          value: "1",
        })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, {
            error: "Expected puzzle to be 81 characters long",
          });
        });
    });
    done();
  });

  test("Check a puzzle placement with invalid placement coordinate: POST request to /api/check", function (done) {
    const invalidCoordinates = ["A10", "B20", "T5", "Z7", "D78"];
    puzzlesAndSolutions.forEach((puzzle, idx) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzle[0],
          coordinate: invalidCoordinates[idx],
          value: "1",
        })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid coordinate" });
        });
    });
    done();
  });

  test("Check a puzzle placement with invalid placement value: POST request to /api/check", function (done) {
    puzzlesAndSolutions.forEach((puzzle) => {
      chai
        .request(server)
        .post("/api/check")
        .send({
          puzzle: puzzle[0],
          coordinate: "A1",
          value: getRandomInt(10, 1000),
        })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: "Invalid value" });
        });
    });
    done();
  });
});
