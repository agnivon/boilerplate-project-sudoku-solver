const chai = require("chai");
const assert = chai.assert;

const puzzles = require("../controllers/puzzle-strings.js");
const puzzlesAndSolutions = puzzles.puzzlesAndSolutions;
const Solver = require("../controllers/sudoku-solver.js");
let solver = new Solver();

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

suite("Unit Tests", () => {
  test("Logic handles a valid puzzle string of 81 characters", function () {
    //console.log(puzzlesAndSolutions);
    puzzlesAndSolutions.forEach((puzzle) =>
      assert.deepEqual(solver.validate(puzzle[0]), { error: null }),
    );
  });

  test("Logic handles a puzzle string with invalid characters (not 1-9 or .)", function () {
    puzzlesAndSolutions.forEach((puzzle) =>
      assert.deepEqual(solver.validate(randomizeString(puzzle[0])), {
        error: "Invalid characters in puzzle",
      }),
    );
  });

  test("Logic handles a puzzle string that is not 81 characters in length", function () {
    puzzlesAndSolutions.forEach((puzzle) =>
      assert.deepEqual(
        solver.validate(puzzle[0].slice(0, getRandomInt(1, 79))),
        {
          error: "Expected puzzle to be 81 characters long",
        },
      ),
    );
  });

  test("Logic handles a valid row placement", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      const index = getRandomInt(0, 80);
      const value = puzzle[1][index];
      const row = parseInt(index / 9) + 1;
      const column = (index % 9) + 1;
      assert.isTrue(solver.checkRowPlacement(puzzle[0], row, column, value));
    });
  });

  test("Logic handles an invalid row placement", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      let index, row, startingRowIndex;
      while (!index) {
        row = getRandomInt(1, 9);
        startingRowIndex = (row - 1) * 9;
        for (let i = startingRowIndex; i < startingRowIndex + 9; i++) {
          if (puzzle[0][i] !== ".") index = i;
        }
      }
      const column = (index % 9) + 1;
      const value = puzzle[0][index];
      const randomLeftCol = column > 1 ? getRandomInt(1, column - 1) : null;
      const randomRightCol = column < 9 ? getRandomInt(column + 1, 9) : null;
      const randomColumn = [
        randomLeftCol || randomRightCol,
        randomRightCol || randomLeftCol,
      ][getRandomInt(0, 1)];
      assert.isFalse(
        solver.checkRowPlacement(puzzle[0], row, randomColumn, value),
      );
    });
  });

  test("Logic handles a valid column placement", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      const index = getRandomInt(0, 80);
      const value = puzzle[1][index];
      const row = parseInt(index / 9) + 1;
      const column = (index % 9) + 1;
      assert.isTrue(solver.checkColPlacement(puzzle[0], row, column, value));
    });
  });

  test("Logic handles an invalid column placement", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      let index, row, startingRowIndex;
      while (!index) {
        row = getRandomInt(1, 9);
        startingRowIndex = (row - 1) * 9;
        for (let i = startingRowIndex; i < startingRowIndex + 9; i++) {
          if (puzzle[0][i] !== ".") index = i;
        }
      }
      const column = (index % 9) + 1;
      const value = puzzle[0][index];
      const randomTopRow = row > 1 ? getRandomInt(1, row - 1) : null;
      const randomBottomRow = row < 9 ? getRandomInt(row + 1, 9) : null;
      const randomRow = [
        randomTopRow || randomBottomRow,
        randomBottomRow || randomTopRow,
      ][getRandomInt(0, 1)];
      assert.isFalse(
        solver.checkColPlacement(puzzle[0], randomRow, column, value),
      );
    });
  });

  test("Logic handles a valid region (3x3 grid) placement", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      const index = getRandomInt(0, 80);
      const value = puzzle[1][index];
      const row = parseInt(index / 9) + 1;
      const column = (index % 9) + 1;
      assert.isTrue(solver.checkRegionPlacement(puzzle[0], row, column, value));
    });
  });

  test("Logic handles an invalid region (3x3 grid) placement", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      let index, row;
      while (!index) {
        row = getRandomInt(1, 9);
        const startingRowIndex = (row - 1) * 9;
        for (let i = startingRowIndex; i < startingRowIndex + 9; i++) {
          if (puzzle[0][i] !== ".") index = i;
        }
      }
      const column = (index % 9) + 1;
      const value = puzzle[0][index];

      const startingRegionRow = Math.floor((row - 1) / 3) * 3 + 1;
      const endingRegionRow = startingRegionRow + 2;
      const startingRegionCol = Math.floor((column - 1) / 3) * 3 + 1;
      const endingRegionCol = startingRegionCol + 2;

      let randomRow, randomColumn;

      do {
        const randomLeftCol =
          column > startingRegionCol
            ? getRandomInt(startingRegionCol, column - 1)
            : null;
        const randomRightCol =
          column < endingRegionCol
            ? getRandomInt(column + 1, endingRegionCol)
            : null;

        randomColumn = [
          randomLeftCol || randomRightCol,
          randomRightCol || randomLeftCol,
        ][getRandomInt(0, 1)];

        const randomLeftRow =
          row > startingRegionRow
            ? getRandomInt(startingRegionRow, row - 1)
            : null;
        const randomRightRow =
          row < endingRegionRow ? getRandomInt(row + 1, endingRegionRow) : null;

        randomRow = [
          randomLeftRow || randomRightRow,
          randomRightRow || randomLeftRow,
        ][getRandomInt(0, 1)];

        //console.log(row, column, randomRow, randomColumn);
      } while (randomRow == row || randomColumn == column);

      //console.log(row, column, randomRow, randomColumn, value);

      assert.isFalse(
        solver.checkRegionPlacement(puzzle[0], randomRow, randomColumn, value),
      );
    });
  });

  test("Valid puzzle strings pass the solver", function () {
    puzzlesAndSolutions.forEach((puzzle) =>
      assert.deepEqual(solver.validate(puzzle[0]), { error: null }),
    );
  });

  test("Invalid puzzle strings fail the solver", function () {
    puzzlesAndSolutions.forEach((puzzle) => {
      const invalidPuzzle = [
        randomizeString(puzzle[0]),
        puzzle[0].slice(0, getRandomInt(1, 79)),
      ][getRandomInt(0, 1)];
      assert.isString(solver.validate(invalidPuzzle).error);
    });
  });

  test("Solver returns the expected solution for an incomplete puzzle", function () {
    puzzlesAndSolutions.forEach((puzzle) =>
      assert.equal(solver.solve(puzzle[0]), puzzle[1]),
    );
  });
});
