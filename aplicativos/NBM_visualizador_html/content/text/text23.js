//====================================
//23 - PROGRESSÃO HARMÔNICA: VIOLÃO I - text23.js
//  ATUALIZAÇÃO:30-04-25
//====================================
registerTextBlock({
    id: "text23",
    content: `
<h1>23 - PROGRESSÃO HARMÔNICA: VIOLÃO I</h1>

<pre>
Conteúdo Prévio
- Grau
- Acorde
- Repertório. progressão
</pre>

     <style>
    body {
      counter-reset: tabelas; /* Zera o contador no início da página */
    }

    .tabela {
      display: inline-block;
      vertical-align: top;
      margin-right: 20px;
      margin-bottom: 30px;
      counter-increment: tabelas; /* Incrementa o contador em cada .tabela */
    }

    .tabela::before {
      content: "Tabela " counter(tabelas); /* Insere o número automático */
      display: block;
      font-weight: bold;
    }

    table {
      border-collapse: collapse;
    }

    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }

    th {
      background-color: lightblue;
    }
  </style>


<div class="tabela">

    <table>
        <tr>
            <th>I</th>
            <th>V</th>
        </tr>
        <tr>
            <td>C</td>
            <td>G</td>
        </tr>
        <tr>
            <td>G</td>
            <td>D</td>
        </tr>
        <tr>
            <td>D</td>
            <td>A</td>
        </tr>
        <tr>
            <td>A</td>
            <td>E</td>
        </tr>
    </table>
</div>

<div class="tabela">
    <table>
        <tr>
            <th>Im</th>
            <th>V</th>
        </tr>
        <tr>
            <td>Dm</td>
            <td>A</td>
        </tr>
        <tr>
            <td>Am</td>
            <td>E</td>
        </tr>
    </table>
</div>
<div class="tabela">
    <table>
        <tr>
            <th>I</th>
            <th>IV</th>
            <th>V</th>
        </tr>
        <tr>
            <td>G</td>
            <td>C</td>
            <td>D</td>
        </tr>
        <tr>
            <td>D</td>
            <td>G</td>
            <td>A</td>
        </tr>
        <tr>
            <td>A</td>
            <td>D</td>
            <td>E</td>
        </tr>
    </table>
</div>

<div class="tabela">
    <table>
        <tr>
            <th>I</th>
            <th>IIm</th>
            <th>V</th>
        </tr>
        <tr>
            <td>C</td>
            <td>Dm</td>
            <td>G</td>
        </tr>
        <tr>
            <td>G</td>
            <td>Am</td>
            <td>D</td>
        </tr>
        <tr>
            <td>D</td>
            <td>Em</td>
            <td>A</td>
        </tr>
    </table>
</div>



<div class="tabela">

    <table>
        <tr>
            <th>I</th>
            <th>IIm</th>
            <th>IV</th>
            <th>V</th>
        </tr>
        <tr>
            <td>G</td>
            <td>Am</td>
            <td>C</td>
            <td>D</td>
        </tr>
        <tr>
            <td>D</td>
            <td>Em</td>
            <td>G</td>
            <td>A</td>
        </tr>
    </table>
</div>
    `
  });
