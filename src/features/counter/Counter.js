import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { increment, decrement, incrementByAmount, reset } from '../counter/counterSlice';
import { addAction } from '../history/historySlice';

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = useState('');

  const handleIncrement = () => {
    dispatch(increment());
    dispatch(addAction({ type: 'Increment', value: '+1' }));
  };

  const handleDecrement = () => {
    dispatch(decrement());
    dispatch(addAction({ type: 'Decrement', value: '-1' }));
  };

  const handleIncrementByAmount = () => {
    const amount = parseInt(inputValue) || 0;
    if (amount !== 0) {
      dispatch(incrementByAmount(amount));
      dispatch(addAction({ type: 'Increment By', value: `+${amount}` }));
      setInputValue('');
    }
  };

  const handleReset = () => {
    dispatch(reset());
    dispatch(addAction({ type: 'Reset', value: '0' }));
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Redux Counter</h2>
      <div className="counter-display">{count}</div>
      
      <div className="button-group">
        <button className="btn-primary" onClick={handleIncrement}>
          Increment (+1)
        </button>
        <button className="btn-secondary" onClick={handleDecrement}>
          Decrement (-1)
        </button>
        <button className="btn-success" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="input-group">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter amount"
        />
        <button className="btn-primary" onClick={handleIncrementByAmount}>
          Increment by Amount
        </button>
      </div>
    </div>
  );
}