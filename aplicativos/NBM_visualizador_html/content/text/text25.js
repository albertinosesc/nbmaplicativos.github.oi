//====================================
//25 - NOTAS MUSICAIS - text25.js
//  ATUALIZAÇÃO:30-04-25
//====================================



registerTextBlock({
    id: "text25",
    content: `
<h1>25 - NOTAS MUSICAIS</h1>
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

    td div {
      width: 25px;
      height: 25px;
      margin: 0 auto;
    }
  </style>

<table>
  <tr>
    <th>Nome</th>
    <th>Cor</th>
    <th>Cifra</th>
    <th>Número</th>
    <th>Fruta</th>
    <th>Pentagrama</th>
    <th>Objeto</th>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: red;"></div></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: orange;"></div></td>
    <td>Laranja</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: yellow;"></div></td>
    <td>Amarelo</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: green;"></div></td>
    <td>Verde</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: blue;"></div></td>
    <td>Azul</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: indigo;"></div></td>
    <td>Índigo</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td><div style="background-color: violet;"></div></td>
    <td>Violeta</td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>


<br>

<!-- Acorde G -->
<div class="acorde" data-notas="B2 D#3 E3 F3 E3 D#3 B2">
  <svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="60" font-size="60" text-anchor="middle">G</text>
    
                <text x="150" y="60" font-size="60" text-anchor="middle">G</text>
                <line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line>
                <line x1="60" y1="115" x2="60" y2="340" stroke="#000" stroke-width="2"></line>
                <line x1="96" y1="115" x2="96" y2="340" stroke="#000" stroke-width="2"></line>
                <line x1="132" y1="115" x2="132" y2="340" stroke="#000" stroke-width="2"></line>
                <line x1="168" y1="115" x2="168" y2="340" stroke="#000" stroke-width="2"></line>
                <line x1="204" y1="115" x2="204" y2="340" stroke="#000" stroke-width="2"></line>
                <line x1="240" y1="115" x2="240" y2="340" stroke="#000" stroke-width="2"></line>
                <line x1="60" y1="115" x2="240" y2="115" stroke="#000" stroke-width="4"></line>
                <line x1="60" y1="171.25" x2="240" y2="171.25" stroke="#000" stroke-width="2"></line>
                <line x1="60" y1="227.5" x2="240" y2="227.5" stroke="#000" stroke-width="2"></line>
                <line x1="60" y1="283.75" x2="240" y2="283.75" stroke="#000" stroke-width="2"></line>
                <line x1="60" y1="340" x2="240" y2="340" stroke="#000" stroke-width="2"></line>
                    <circle cx="132" cy="143.125" r="13" fill="#000000" data-key="2-1"></circle>
                    <text x="132" y="147.125" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" data-key="2-1">
                        D#
                    </text>
                    <circle cx="132" cy="199.375" r="13" fill="#000000" data-key="2-2"></circle>
                    <text x="132" y="203.375" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" data-key="2-2">
                        E
                    </text>
                    <circle cx="96" cy="199.375" r="13" fill="#000000" data-key="1-2"></circle>
                    <text x="96" y="203.375" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" data-key="1-2">
                        B
                    </text>
                    <circle cx="132" cy="255.625" r="13" fill="#000000" data-key="2-3"></circle>
                    <text x="132" y="259.625" font-size="14" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" data-key="2-3">
                        F
                    </text>
  </svg>
  <button class="playButton">Tocar</button>
</div>


    `
  });

