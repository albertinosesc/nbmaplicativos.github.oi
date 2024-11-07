function converter() {
  const input = document.getElementById('input').value;
  const songs = input.split(/\n(?=X:\d+)/);
  let output = '';

  songs.forEach(song => {
    const lines = song.split('\n');
    let songOutput = '';
    let timeSignatureValue = 4;
    let title = '';
    let composer = '';
    let rhythm = '';
    let tempo = '';

    for (const line of lines) {
      if (line.match(/^M:/)) {
        const timeSignature = line.match(/M:(\d+)\/\d+/);
        if (timeSignature) {
          timeSignatureValue = parseInt(timeSignature[1]);
          songOutput = timeSignatureValue + '';
        }
        continue;
      }

      if (line.startsWith('T:')) {
        title = line.substring(2).trim();
      }
      if (line.startsWith('C:')) {
        composer = line.substring(2).trim();
      }
      if (line.startsWith('R:')) {
        rhythm = line.substring(2).trim();
      }
      if (line.startsWith('Q:')) {
        tempo = line.match(/Q:\d+\/\d+=(\d+)/)?.[1] || '';
      }

      if (line.match(/^(X:|T:|L:|K:|%%|C:|R:|Q:)/)) {
        continue;
      }

      if (line.trim()) {
        const parts = line.split('|');
        const processedParts = parts.map(part => {
          part = part.trim();
          if (!part || part === ']') return part;

          if (part.startsWith(':')) {
            part = part.substring(1);
          }
          if (part.endsWith(':')) {
            part = part.substring(0, part.length - 1);
          }

          const numberPrefix = part.match(/^(\d+)\s*/);
          if (numberPrefix) {
            part = part.substring(numberPrefix[0].length);
          }

          const chords = part.match(/"([^"]+)"/g);
          if (chords) {
            return (numberPrefix ? numberPrefix[1] + '/  ' : '') + chords.map(c => c.replace(/"/g, '')).join('  ');
          }

          return (numberPrefix ? numberPrefix[1] + '/  ' : '') + '%';
        }).map(chord => chord.padEnd(4, ' '));

        let outputLine = '';
        for (let i = 0; i < parts.length; i++) {
          const originalPart = parts[i].trim();
          const processedPart = processedParts[i];

          if (originalPart.startsWith(':') && originalPart.endsWith(':')) {
            outputLine += `|: ${processedPart} :|`;
          } else if (originalPart.startsWith(':')) {
            outputLine += `|: ${processedPart} |`;
          } else if (originalPart.endsWith(':')) {
            outputLine += `| ${processedPart} :|`;
          } else if (originalPart === ']') {
            outputLine += '|]';
          } else {
            if (processedPart.trim() === '%') {
              outputLine += `|  %  `;
            } else {
              outputLine += `| ${processedPart} `;
            }
          }
        }
        songOutput += outputLine;
      }
    }

    let header = '';
    if (title) {
      header += `Música:  ${title}\n`;
    }
    if (composer) {
      header += `Compositor:  ${composer}\n`;
    }
    if (rhythm) {
      header += `Ritmo:  ${rhythm}\n`;
    }
    if (tempo) {
      header += `Tempo:  ${tempo}\n`;
    }
    if (header) {
      header += '\n';
    }

    songOutput = songOutput.replace(/:\|\|/g, ':|');
    output += header + songOutput.trim() + '\n\n';
  });

  document.getElementById('output').textContent = output.trim();
}

function downloadTxt() {
  const content = document.getElementById('output').textContent;
  const filename = document.getElementById('filename').value.trim() || 'notacao_musical';
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const content = document.getElementById('output').textContent;
  const filename = document.getElementById('filename').value.trim() || 'notacao_musical';
  const lines = content.split('\n');
  let y = 20;

  doc.setFont('courier');
  doc.setFontSize(12);

  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 10;
  });

  doc.save(`${filename}.pdf`);
}

function copyResult() {
  const content = document.getElementById('output').textContent;
  navigator.clipboard.writeText(content).then(() => {
    const originalText = document.querySelector('.copy-btn').textContent;
    document.querySelector('.copy-btn').textContent = 'Copiado!';
    setTimeout(() => {
      document.querySelector('.copy-btn').textContent = originalText;
    }, 2000);
  });
}