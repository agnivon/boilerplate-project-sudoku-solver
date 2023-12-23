class SudokuSolver {
  getRowAndColumnFromCoordinate(coordinate) {
    return [coordinate[0], parseInt(coordinate[1])];
  }
  getRowInt(row) {
    return row.toUpperCase().charCodeAt(0) - 65 + 1;
  }

  validate(puzzleString) {
    if (puzzleString.length !== 81) {
      return { error: "Expected puzzle to be 81 characters long" };
    }
    if (puzzleString.match(/[^1-9.]/g)) {
      return { error: "Invalid characters in puzzle" };
    }
    return { error: null };
  }

  validateCoordinate(coordinate) {
    if (!coordinate.match(/^[A-I][1-9]$/)) {
      return { error: "Invalid coordinate" };
    }
    return { error: null };
  }

  validateValue(value) {
    const intValue = parseInt(value);
    if (!(intValue >= 1 && value <= 9)) {
      return { error: "Invalid value" };
    }
    return { error: null };
  }

  checkPlacement(puzzleString, row, column, value) {
    const conflict = [];

    const intValue = parseInt(value);
    const intRow = typeof row === "string" ? this.getRowInt(row) : row;

    if (!this.checkRowPlacement(puzzleString, intRow, column, intValue)) {
      conflict.push("row");
    }
    if (!this.checkColPlacement(puzzleString, intRow, column, intValue)) {
      conflict.push("column");
    }
    if (!this.checkRegionPlacement(puzzleString, intRow, column, intValue)) {
      conflict.push("region");
    }

    if (conflict.length) {
      return { valid: false, conflict };
    }
    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const startIndex = (row - 1) * 9;
    const endIndex = startIndex + 8;

    for (let i = startIndex; i <= endIndex; i++) {
      if (puzzleString[i] == value && i % 9 != column - 1) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const colIndex = column - 1;

    for (let i = 0; i < 9; i++) {
      const index = i * 9 + colIndex;
      if (puzzleString[index] == value && row - 1 != i) {
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const startRowIndex = Math.floor((row - 1) / 3) * 3 * 9;
    const startColIndex = Math.floor((column - 1) / 3) * 3;

    for (let i = startRowIndex; i <= startRowIndex + 9 * 2; i += 9) {
      for (let j = startColIndex; j <= startColIndex + 2; j++) {
        // console.log(
        //   puzzleString[i + j],
        //   puzzleString[i + j] == value,
        //   i,
        //   this.getRowIndex(row),
        //   parseInt(i / 9) != this.getRowIndex(row),
        //   j != column - 1,
        // );
        if (
          puzzleString[i + j] == value &&
          (parseInt(i / 9) != row - 1 || j != column - 1)
        ) {
          return false;
        }
      }
    }
    return true;
  }
  solveRecursive(puzzleString, solution, i) {
    if (i === 81) {
      return solution;
    }
    if (puzzleString[i] !== ".") {
      return this.solveRecursive(puzzleString, solution, i + 1);
    }
    for (let j = 1; j <= 9; j++) {
      const row = parseInt(i / 9) + 1;
      const column = (i % 9) + 1;
      const { valid } = this.checkPlacement(
        solution,
        row,
        column,
        j.toString(),
      );
      if (valid) {
        const modifiedSolution =
          solution.slice(0, i) + j.toString() + solution.slice(i + 1);
        const newSolution = this.solveRecursive(
          puzzleString,
          modifiedSolution,
          i + 1,
        );
        if (newSolution) {
          return newSolution;
        }
      }
    }
    return null;
  }

  solve(puzzleString) {
    if (this.validate(puzzleString).error === null) {
      return this.solveRecursive(puzzleString, puzzleString, 0);
    }
    return null;
  }
}

module.exports = SudokuSolver;
