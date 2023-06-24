

import React from 'react';
import styled from 'styled-components';

export const Symbols = ({insertSymbol}: any) => {
  const symbols = [
    '{', '}','[',']','(',')','<','>','/','-','`','"',"=",":",";"
  ]

  return (
    <S.Symbols>
      { 
        symbols.map(symbol => {
          return <div onClick={() => insertSymbol(symbol)} key={symbol} className='symbol'>{symbol}</div>
        }) 
      }
    </S.Symbols>
  ) 
}

const S = {
  Symbols: styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 3;
  background: black;

  .symbol {
    width: 6.66%;
    color: #828282;
    cursor: pointer;
    text-align: center;
    height: auto;
    padding: 0px 8px;
    height: 32px;
    display: flex;
    align-items: center;
    border-radius: 0px;
    font-family: monospace;
    font-size: 16px;
  }
  `
}