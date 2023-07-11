import React from "react";
import { useState, useRef, useEffect } from "react";


function Square({ value, onSquareClick, id }) {
  return (
    <button className="square" onClick={onSquareClick} id={"boton" + id}>
      {value}
    </button>
  );
}

function sendPlay(val, player){
    console.log('sending... val: ' + val + ',jugador: ' + player);
    fetch ("http://localhost:8080/jugada?val=" + val + "&jugador=" + player)
            .then(res => res.json())
            .then(
            (result) => {
                console.log('server returns: timestamp=' 
                + result.timestamp
                + ', rcvdmsg='
                +result.rcvdmsg);
            },
            (error) => {
                console.log('Error connecting to communicate movement.');
            });
}

function updatePlay(){
      console.log('Contacting server for updates... ');
      fetch("http://localhost:8080/getjugada")
              .then(res => res.json())
              .then(
              (result) => {
                  if (result.val && result.val !== '-1'){
                      console.log('Simulating Click on boton' + result.val);
                      document.getElementById('boton' + result.val).click();
                  }
              },
              (error) => {
                  console.log('error connecting to getplays.');
              });
  }

function Board({ xIsNext, squares, onPlay }) {
    
 
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    
    sendPlay(i, xIsNext ? "X" : "O");
    
    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <div>
      <div className="status"> {status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} id='0' />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} id='1'/>
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} id='2'/>
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} id='3'/>
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} id='4'/>
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} id='5'/>
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} id='6'/>
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} id='7'/>
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} id='8'/>
      </div>
    </div>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];


  const [svrStatus, setSvrStatus] = useState('Starting Connection....');
   
  
  const intervalRef = useRef(null);
  
  
  const timedPlaysMonitorRef = useRef(null);
  
  
  useEffect(() =>{
        timedPlaysMonitorRef.current = setInterval(
        () => {updatePlay();}, 10000);
        return () => clearInterval(timedPlaysMonitorRef.current)
  }, []);
  
  
  useEffect(() =>{
        intervalRef.current = setInterval(
        () => {checkStatus(svrStatus);}, 20000);
        return () => clearInterval(intervalRef.current)
  }, []);
  
  
  
  
  
  function checkStatus(currentStatus){
      console.log('checking...' + svrStatus + '. With intervalRef.current: ' + intervalRef.current);
      fetch("http://localhost:8080/status")
              .then(res => res.json())
              .then(
              (result) => {
                  setSvrStatus(result.status);
              },
              (error) => {
                  setSvrStatus('error');
              });
  }
  
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((square, move) => {
    let description;
    if (move > 0) {
      description = "go to move #" + move;
    } else {
      description = "go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol> {moves}</ol>
      </div>
      <div>
        {svrStatus}
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
