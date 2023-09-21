import './style.css'
import './assets/grid';
import { GridElement } from './assets/grid/grid';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/`
<div class="box">
  <div class="wrap">
    <grid-container>
      <grid-head>
        <grid-cell>HEAD1</grid-cell>
        <grid-cell>HEAD2</grid-cell>
        <grid-cell>HEAD3</grid-cell>
        <grid-cell>HEAD4</grid-cell>
      </grid-head>
      <grid-row>
        <grid-cell>BODY1</grid-cell>
        <grid-cell>BODY2</grid-cell>
        <grid-cell>BODY32323kl4</grid-cell>
        <grid-cell>BODY4</grid-cell>
      </grid-row>
      <grid-row>
        <grid-cell>BODY5</grid-cell>
        <grid-cell>BODY6</grid-cell>
        <grid-cell><input type="text" /></grid-cell>
        <grid-cell>BODY8</grid-cell>
      </grid-row>
    </grid-container>
  </div>
</div>
`

setTimeout(() => {
  const container = document.querySelector('grid-container') as GridElement;
  container.on = {
    'grid-row-click': (e: CustomEvent) => {
      console.log('ROW');
      // console.log(e);
    },
    'grid-cell-click': (e: CustomEvent) => {
      // console.log('CELL');
      // console.log(e);
    },
    'grid-column-head-click': (e: CustomEvent) => {
      // console.log('HEAD');
      // console.log(e);
    }
  }

  // const newRow = document.createElement('grid-row');
  // newRow.innerHTML = `
  //   <grid-cell>BODY9</grid-cell>
  //   <grid-cell>BODY10</grid-cell>
  //   <grid-cell>BODY11LONGTEXTTESTTESTTEST</grid-cell>
  //   <grid-cell>BODY12</grid-cell>
  // `;
  // container.appendChild(newRow);
}, 1000);
