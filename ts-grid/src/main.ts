import './style.css'
import './assets/grid';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
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
        <grid-cell>BODY7</grid-cell>
        <grid-cell>BODY8</grid-cell>
      </grid-row>
    </grid-container>
  </div>
</div>
`
