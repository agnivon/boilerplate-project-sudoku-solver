"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    if (puzzle && coordinate && value) {
      let result = solver.validate(puzzle);
      if (result.error) return res.json(result);

      result = solver.validateCoordinate(coordinate);
      if (result.error) return res.json(result);

      result = solver.validateValue(value);
      if (result.error) return res.json(result);

      const [row, column] = solver.getRowAndColumnFromCoordinate(coordinate);

      return res.json(solver.checkPlacement(puzzle, row, column, value));
    } else {
      return res.json({ error: "Required field(s) missing" });
    }
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;

    if (puzzle) {
      let result = solver.validate(puzzle);
      if (result.error) return res.json(result);

      const solution = solver.solve(puzzle);

      if (solution) return res.json({ solution });
      else return res.json({ error: "Puzzle cannot be solved" });
    } else {
      return res.json({ error: "Required field missing" });
    }
  });
};
