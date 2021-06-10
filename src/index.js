import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const shading = props.highlighted ? {backgroundColor: 'yellow'} : {backgroundColor: 'white'};
  return (
    <button className="square" style={shading} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlighted={this.props.highlightedArr[i]}
      />
    );
  }

  render() {
    const elements = [];
    for(var i = 0; i < 3; i++) {
      const row = [];
      for(var j = 0; j < 3; j++) {
        row.push(this.renderSquare(j+3*i));
      }
      elements.push(<div className="board-row">{row}</div>);
    }
    return (
      <div>{elements}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
      descending: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext? 'X' : 'O';
    const row = Math.floor(i/3) + 1;
    const col = i%3 + 1;
    this.setState({
      history: history.concat([{
        squares: squares,
        row: row,
        col: col
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reSort() {
    this.setState({
      descending: !this.state.descending
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const calculated = calculateWinner(current.squares);
    const winner = calculated ? calculated[0] : null;

    const temp = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (' + history[move].row + ', ' + history[move].col + ')':
        'Go to game start';
      const bold = this.state.stepNumber === move;
      return (
        <li key={move} style={bold ? {fontWeight:'bold'} : {fontWeight: 'normal'}}>
          <button style={bold ? {fontWeight:'bold'} : {fontWeight: 'normal'}} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const moves = this.state.descending? temp.slice(0) : temp.slice(0).reverse();

    let highlightedArr = Array(9).fill(false);

    let status;
    if (winner) {
      status = 'Winner ' + winner;
      const winningSquares = calculated[1];
      for(var i = 0; i < 3; i++) {
        let square = winningSquares[i];
        highlightedArr[square] = true;
      }
    } else if(history.length === 10 && !calculateWinner(current)) {
      status = 'Draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    const desc = this.state.descending ? 'Sort by descending order' : 'Sort by ascending order';
    const toggle = <button onClick={() => this.reSort()}>{desc}</button>

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlightedArr={highlightedArr}
          />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <div>{toggle}</div>
          <ul>{moves}</ul>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a, b, c]];
    }
  }
  return null;
}
