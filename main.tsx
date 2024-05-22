import React, { useEffect, useState } from 'react';
import sudoku from './sudoku';
import './style.css';
import './fontawesome/css/all.css';

const App: React.FC = () => {
  const [board, setBoard] = useState<number[][]>([]);
  const [solvedBoard, setSolvedBoard] = useState<number[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);
  const [activeSquare, setActiveSquare] = useState<HTMLElement | null>(null);

  const setupBoard = () => {
    const squares = document.getElementsByClassName('square');
    for (let i = 0; i < squares.length; i++) {
      const row = 9 - Math.floor(i / 9);
      const column = (i % 9) + 1;
      const id = row * 10 + column;
      squares[i].setAttribute('id', id.toString());
      squares[i].addEventListener('click', onSquareClick);
    }
  };

  const fillBoard = (board: number[][]) => {
    const squares = document.getElementsByClassName('square');
    for (let i = 0; i < squares.length; i++) {
      const row = 9 - Math.floor(i / 9);
      const column = (i % 9) + 1;
      const id = row * 10 + column;
      const square = document.getElementById(id.toString());
      if (board[row - 1][column - 1] !== 0) square?.classList.add('filled');
      square!.innerHTML = board[row - 1][column - 1] === 0 ? '' : board[row - 1][column - 1].toString();
    }
  };

  const stringToArray = (sudokuString: string) => {
    const board: number[][] = [];
    let row: number[] = [];
    for (let i = 0; i < sudokuString.length; i++) {
      if (sudokuString[i] === '.') {
        row.push(0);
      } else {
        row.push(parseInt(sudokuString[i]));
      }
      if (row.length === 9) {
        board.push(row);
        row = [];
      }
    }
    return board;
  };

  const onSquareClick = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('filled')) return;
    if (activeSquare) activeSquare.classList.remove('active');
    target.classList.add('active');
    setActiveSquare(target);
  };

  const onNumberClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget as HTMLElement;
    if (!activeSquare || activeSquare.classList.contains('filled')) return;
    activeSquare.innerHTML = target.innerHTML;
    const userInput = parseInt(target.innerHTML!);
    const row = parseInt(activeSquare.id.charAt(0));
    const column = parseInt(activeSquare.id.charAt(1));

    const isCorrect = userInput === solvedBoard[row - 1][column - 1];
    activeSquare.classList.remove(isCorrect ? 'false' : 'true');
    activeSquare.classList.add(isCorrect ? 'true' : 'false');

    if (isCorrect) {
      activeSquare.classList.add('filled');
      if (document.getElementsByClassName('filled').length === 81)
        endGame('Bravo! Sudoku Conquered!', 'green');
      return;
    }

    setMistakes((prev) => {
      const newMistakes = prev + 1;
      if (newMistakes === 3) endGame('Game Over! 3 Strikes, Try Again!', 'darkred');
      return newMistakes;
    });
  };

  const endGame = (message: string, color: string) => {
    const squares = document.getElementsByClassName('square');
    for (let i = 0; i < squares.length; i++) {
      squares[i].removeEventListener('click', onSquareClick);
    }
    showAlert(message, color);
  };

  const showAlert = (message: string, color: string) => {
    const alert = document.getElementById('alert');
    if (alert) {
      alert.innerHTML = message;
      alert.style.color = color;
      alert.style.display = 'block';
    }
  };

  const onHintClick = () => {
    if (hints === 0) return;
    setHints((prev) => prev - 1);
    if (!activeSquare || activeSquare.classList.contains('filled')) return;
    const row = parseInt(activeSquare.id.charAt(0));
    const column = parseInt(activeSquare.id.charAt(1));
    activeSquare.innerHTML = solvedBoard[row - 1][column - 1].toString();
    activeSquare.classList.add('filled', 'true');
  };

  const onNewGameClick = () => {
    const puzzle = sudoku.generate("easy");
    const solution = sudoku.solve(puzzle);
    const newBoard = stringToArray(puzzle);
    const newSolvedBoard = stringToArray(solution);
    setBoard(newBoard);
    setSolvedBoard(newSolvedBoard);
    setMistakes(0);
    setHints(3);
    setActiveSquare(null);
    setupBoard();
    fillBoard(newBoard);
    const alert = document.getElementById('alert');
    if (alert) {
      alert.style.display = 'none';
    }
  };

  useEffect(() => {
    onNewGameClick();
  }, []);

  return (
    <div className="app">
      <h1>Sudoku</h1>
      <div className="board">
        {Array.from({ length: 81 }).map((_, index) => (
          <div className={`square`} key={index}></div>
        ))}
      </div>
      <div className="controls">
        <div className="numbers">
          {Array.from({ length: 9 }).map((_, index) => (
            <button key={index} onClick={onNumberClick}>{index + 1}</button>
          ))}
        </div>
        <div className="actions">
          <button onClick={onHintClick}>Hint ({hints})</button>
          <button onClick={onNewGameClick}>New Game</button>
        </div>
      </div>
      <div id="alert" className="alert"></div>
    </div>
  );
};
export default App;