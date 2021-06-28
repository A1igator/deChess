/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Chess from 'chess.js';
import Chessground from 'react-chessground';
import 'react-chessground/dist/styles/chessground.css'; // redundant import, but freaks out if i dont import this for whatever reason
import '../styles/chessground.css'; // overwrites previous chessground.css, allows easier/more customizability
import '../styles/chessboard.css'; // this one is for the buttons and text that aren't part of the board 
import { Col, Modal, Row } from 'antd';
import queen from '../images/wQ.svg';
import rook from '../images/wR.svg';
import bishop from '../images/wB.svg';
import knight from '../images/wN.svg';

function ChessBoard(props) {
  const { settings: { vsComputer }, client, code } = props;
  const [chess] = useState(new Chess());
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState('');
  const [lastMove, setLastMove] = useState();
  const [isChecked, setChecked] = useState(false);
  const [viewOnly, setViewOnly] = useState(true);
  // console.log(code);
  
  //uncomment this later, testing UI against PC and it doesnt load vs computer when this code runs
  //useEffect(() => {
  //  client.subscribe({
  //    stream: code,
  //  },
  //  (message) => {
  //    // This function will be called when new messages occur
  //    // console.log(JSON.stringify(message));
  //    // console.log(message.fen);
  //    setViewOnly(false);
  //    if (message.hello !== 'world') {
  //      const { move } = message;
  //      // console.log(move);
  //      const { from, to } = move;
  //      const moves = chess.moves({ verbose: true });
  //      for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
  //        if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
  //          setPendingMove([from, to]);
  //          setSelectVisible(true);
  //          return;
  //        }
  //      }
  //      if (chess.move({ from, to, promotion: 'q' })) {
  //        setFen(chess.fen());
  //        setLastMove([from, to]);
  //        setChecked(chess.in_check());
  //      }
  //    }
  //  });
  //}, [code]);

  let username1 = 'username1';
  let username2 = 'username2';
  let address1 = '0x7E379d280AC80BF9e5D5c30578e165e6c690acC9';
  let address2 = '0x1d156b9aaCc68E4954a0bF47F3a43FEed61EB1a4';
  let elo1 = '987';
  let elo2 = '1234';
  let time1 = '22:32';
  let time2 = '9:42'

  const randomMove = () => {
    const moves = chess.moves({ verbose: true });
    const move = moves[Math.floor(Math.random() * moves.length)];
    if (moves.length > 0) {
      chess.move(move.san);
      setFen(chess.fen());
      setLastMove([move.from, move.to]);
      setChecked(chess.in_check());
    }
  };

  const onMove = (from, to) => {
    const moves = chess.moves({ verbose: true });
    for (let i = 0, len = moves.length; i < len; i++) { /* eslint-disable-line */
      if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
        setPendingMove([from, to]);
        setSelectVisible(true);
        return;
      }
    }
    if (chess.move({ from, to, promotion: 'q' })) {
      setFen(chess.fen());
      setLastMove([from, to]);
      setChecked(chess.in_check());
      client.publish(code, {
        move:
        { from, to, promotion: 'q' },
        fen: chess.fen(),
      });
      // .then(() => console.log('Sent successfully: ', {
      //   move:
      //   { from, to, promotion: 'q' },
      //   fen: chess.fen(),
      // }));
      if (vsComputer) { setTimeout(randomMove, 500); }
    }
  };

  const promotion = (e) => {
    const from = pendingMove[0];
    const to = pendingMove[1];

    chess.move({ from, to, promotion: e });
    setFen(chess.fen());
    setLastMove([from, to]);
    setSelectVisible(false);
    setChecked(chess.in_check());
    client.publish(code, {
      move:
      { from, to, promotion: 'q' },
      fen: chess.fen(),
    });
    // .then(() => console.log('Sent successfully: ', {
    //   move:
    //     { from, to, promotion: 'q' },
    //   fen: chess.fen(),
    // }));
    if (vsComputer) { setTimeout(randomMove, 500); }
  };

  const turnColor = () => (chess.turn() === 'w' ? 'white' : 'black');

  const calcMovable = () => {
    const dests = new Map();
    if (!viewOnly) {
      chess.SQUARES.forEach((s) => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map((m) => m.to));
      });
    }
    return {
      free: false,
      dests,
    };
  };
  
  let boardsize = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.77 / 8) * 8;
  let userInfoXPos = (window.innerWidth / 2) - (boardsize / 2);
  console.log(userInfoXPos);

  return (
    <div style={{
      background: '#2b313c',
      height: '100vh',
    }}
    > 
      <Row>
        <Col span={6} />
        <Col span={12}>
          <div className='username'>{username1}</div>
          <div className='userAddress'>{address1}</div>
          <div className='elo'>{elo1}</div>
          <div id='user1Time' className='userTime'>{time1}</div>
          <Chessground
            width={boardsize}
            height={boardsize}
            turnColor={turnColor()}
            movable={calcMovable()}
            lastMove={lastMove}
            fen={fen}
            onMove={onMove}
            highlight={{
              check: true,
              lastMove: true
            }}
            check={isChecked}
            style={{ marginTop: '10%', marginLeft: '10%' }}
          />
          <div className='username'>{username2}</div>
          <div className='userAddress'>{address2}</div>
          <div className='elo'>{elo2}</div>
          <div id='user1Time' className='userTime'>{time2}</div>
        </Col>
        <Col span={6} />
      </Row>
      <Modal visible={selectVisible} footer={null} closable={false} centered>
        <div style={{ textAlign: 'center', cursor: 'pointer' }}>
          <span role="presentation" onClick={() => promotion('q')}>
            <img src={queen} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion('r')}>
            <img src={rook} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion('b')}>
            <img src={bishop} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion('n')}>
            <img src={knight} alt="" style={{ width: 50 }} />
          </span>
        </div>
      </Modal>
    </div>
  );
}

export default ChessBoard;
