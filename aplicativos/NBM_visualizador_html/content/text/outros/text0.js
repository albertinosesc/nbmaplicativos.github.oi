
// =============================================
//VIOLÃO - ACORDES MAIRORES SEM PESTANA - text1.js
// =============================================

registerTextBlock({
    id: "text50",
    content: `
  <style>
  .acorde {
    margin-bottom: 40px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 10px;
    width: 320px;
    display: inline-block;
    vertical-align: top;
    margin-right: 20px;
  }
  .playButton {
    margin-top: 10px;
    padding: 8px 15px;
    font-size: 16px;
    width: 100%;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .playButton:hover {
    background-color: #45a049;
  }
  .playButton.playing {
    background-color: #f44336;
  }
</style>
  



    <h1>Acordes Maiores Sem Pestana</h1>
    <br>
<svg id="svg-diagrama" width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><text x="150" y="60" font-size="60" text-anchor="middle">D</text><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="115" x2="60" y2="340" stroke="#000" stroke-width="2"></line><text x="60" y="95.5" font-size="26" text-anchor="middle">X</text><line x1="96" y1="115" x2="96" y2="340" stroke="#000" stroke-width="2"></line><text x="96" y="95.5" font-size="26" text-anchor="middle">X</text><line x1="132" y1="115" x2="132" y2="340" stroke="#000" stroke-width="2"></line><circle cx="132" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="168" y1="115" x2="168" y2="340" stroke="#000" stroke-width="2"></line><line x1="204" y1="115" x2="204" y2="340" stroke="#000" stroke-width="2"></line><line x1="240" y1="115" x2="240" y2="340" stroke="#000" stroke-width="2"></line><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="171.25" x2="240" y2="171.25" stroke="#000" stroke-width="2"></line><line x1="60" y1="227.5" x2="240" y2="227.5" stroke="#000" stroke-width="2"></line><line x1="60" y1="283.75" x2="240" y2="283.75" stroke="#000" stroke-width="2"></line><line x1="60" y1="340" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="168" cy="199.375" r="13" fill="#000"></circle><text x="168" y="203.375" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">1</text><circle cx="240" cy="199.375" r="13" fill="#000000"></circle><text x="240" y="199.375" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">2</text><circle cx="204" cy="255.625" r="13" fill="#000000"></circle><text x="204" y="255.625" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">3</text></svg>
<svg id="svg-diagrama" width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><text x="150" y="60" font-size="60" text-anchor="middle">A</text><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="115" x2="60" y2="340" stroke="#000" stroke-width="2"></line><text x="60" y="95.5" font-size="26" text-anchor="middle">X</text><line x1="96" y1="115" x2="96" y2="340" stroke="#000" stroke-width="2"></line><circle cx="96" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="132" y1="115" x2="132" y2="340" stroke="#000" stroke-width="2"></line><line x1="168" y1="115" x2="168" y2="340" stroke="#000" stroke-width="2"></line><line x1="204" y1="115" x2="204" y2="340" stroke="#000" stroke-width="2"></line><line x1="240" y1="115" x2="240" y2="340" stroke="#000" stroke-width="2"></line><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="171.25" x2="240" y2="171.25" stroke="#000" stroke-width="2"></line><line x1="60" y1="227.5" x2="240" y2="227.5" stroke="#000" stroke-width="2"></line><line x1="60" y1="283.75" x2="240" y2="283.75" stroke="#000" stroke-width="2"></line><line x1="60" y1="340" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="132" cy="199.375" r="13" fill="#000"></circle><text x="132" y="203.375" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">1</text><circle cx="204" cy="199.375" r="13" fill="#000"></circle><text x="204" y="203.375" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">3</text><circle cx="168" cy="199.375" r="13" fill="#000000"></circle><text x="168" y="199.375" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">2</text></svg>   
<svg id="svg-diagrama" width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><text x="150" y="60" font-size="60" text-anchor="middle">E</text><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="115" x2="60" y2="340" stroke="#000" stroke-width="2"></line><circle cx="60" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="96" y1="115" x2="96" y2="340" stroke="#000" stroke-width="2"></line><line x1="132" y1="115" x2="132" y2="340" stroke="#000" stroke-width="2"></line><line x1="168" y1="115" x2="168" y2="340" stroke="#000" stroke-width="2"></line><line x1="204" y1="115" x2="204" y2="340" stroke="#000" stroke-width="2"></line><line x1="240" y1="115" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="240" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="171.25" x2="240" y2="171.25" stroke="#000" stroke-width="2"></line><line x1="60" y1="227.5" x2="240" y2="227.5" stroke="#000" stroke-width="2"></line><line x1="60" y1="283.75" x2="240" y2="283.75" stroke="#000" stroke-width="2"></line><line x1="60" y1="340" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="132" cy="199.375" r="13" fill="#000"></circle><text x="132" y="203.375" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">3</text><circle cx="168" cy="143.125" r="13" fill="#000000"></circle><text x="168" y="143.125" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">1</text><circle cx="96" cy="199.375" r="13" fill="#000000"></circle><text x="96" y="199.375" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">2</text></svg>
<svg id="svg-diagrama" width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><text x="150" y="60" font-size="60" text-anchor="middle">C</text><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="115" x2="60" y2="340" stroke="#000" stroke-width="2"></line><text x="60" y="95.5" font-size="26" text-anchor="middle">X</text><line x1="96" y1="115" x2="96" y2="340" stroke="#000" stroke-width="2"></line><line x1="132" y1="115" x2="132" y2="340" stroke="#000" stroke-width="2"></line><line x1="168" y1="115" x2="168" y2="340" stroke="#000" stroke-width="2"></line><circle cx="168" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="204" y1="115" x2="204" y2="340" stroke="#000" stroke-width="2"></line><line x1="240" y1="115" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="240" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="171.25" x2="240" y2="171.25" stroke="#000" stroke-width="2"></line><line x1="60" y1="227.5" x2="240" y2="227.5" stroke="#000" stroke-width="2"></line><line x1="60" y1="283.75" x2="240" y2="283.75" stroke="#000" stroke-width="2"></line><line x1="60" y1="340" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="204" cy="143.125" r="13" fill="#000000"></circle><text x="204" y="143.125" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">1</text><circle cx="132" cy="199.375" r="13" fill="#000000"></circle><text x="132" y="199.375" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">2</text><circle cx="96" cy="255.625" r="13" fill="#000000"></circle><text x="96" y="255.625" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">3</text></svg>
<svg id="svg-diagrama" width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><text x="150" y="60" font-size="60" text-anchor="middle">G</text><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="115" x2="60" y2="340" stroke="#000" stroke-width="2"></line><line x1="96" y1="115" x2="96" y2="340" stroke="#000" stroke-width="2"></line><line x1="132" y1="115" x2="132" y2="340" stroke="#000" stroke-width="2"></line><circle cx="132" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="168" y1="115" x2="168" y2="340" stroke="#000" stroke-width="2"></line><circle cx="168" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="204" y1="115" x2="204" y2="340" stroke="#000" stroke-width="2"></line><circle cx="204" cy="87.5" r="13" fill="none" stroke="#000" stroke-width="2" class="casa-zero-circulo"></circle><line x1="240" y1="115" x2="240" y2="340" stroke="#000" stroke-width="2"></line><line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line><line x1="60" y1="171.25" x2="240" y2="171.25" stroke="#000" stroke-width="2"></line><line x1="60" y1="227.5" x2="240" y2="227.5" stroke="#000" stroke-width="2"></line><line x1="60" y1="283.75" x2="240" y2="283.75" stroke="#000" stroke-width="2"></line><line x1="60" y1="340" x2="240" y2="340" stroke="#000" stroke-width="2"></line><circle cx="60" cy="255.625" r="13" fill="#000"></circle><text x="60" y="259.625" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">2</text><circle cx="96" cy="199.375" r="13" fill="#000"></circle><text x="96" y="203.375" font-size="14" fill="#fff" text-anchor="middle" dominant-baseline="middle">1</text><circle cx="240" cy="255.625" r="13" fill="#000000"></circle><text x="240" y="255.625" fill="#fff" font-size="14" text-anchor="middle" dominant-baseline="middle">3</text></svg>



    `
  });