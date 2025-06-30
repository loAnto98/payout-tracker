// === CONFIG TELEGRAM ===
const TELEGRAM_TOKEN = '7052346353:AAG2cTRiDgGfgTOkFwJXEdnX7Oos8QX_Wcw';
const first_chat_id = '-4567296224';
const second_chat_id = '-4522590104';

function sendTelegramAlert(message, chatId) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const data = {
        chat_id: chatId,
        text: message
    };

    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            console.error('Errore Telegram:', response.statusText);
        }
    }).catch(err => {
        console.error('Errore Telegram:', err);
    });
}

// === UI BOX VISIBILE ===
let outputDiv = document.createElement('div');
outputDiv.style.position = 'fixed';
outputDiv.style.bottom = '0';
outputDiv.style.right = '0';
outputDiv.style.width = '300px';
outputDiv.style.height = '150px';
outputDiv.style.overflowY = 'auto';
outputDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
outputDiv.style.color = 'white';
outputDiv.style.fontSize = '12px';
outputDiv.style.zIndex = '9999';
outputDiv.style.padding = '10px';
outputDiv.style.fontFamily = 'monospace';
outputDiv.innerText = "🟢 Script attivo...\n";
document.body.appendChild(outputDiv);

let sequenzeAvvisate = new Map();
let sequenzaDa7Notificata = false;
let ultimoAvvisoSecondoGruppo = 0;

const INTERVALLO_NOTIFICA = 600000;
const INTERVALLO_NOTIFICA_SECONDOGRUPO = 60000;

function isNumeroValido(numero) {
    const valore = parseFloat(numero.replace('x', ''));
    return valore >= 1.00 && valore <= 1.99;
}

function leggiPrimiNumeri() {
    const elementi = document.querySelectorAll('.payout');
    const numeriTrovati = [];

    elementi.forEach(el => {
        const testo = el.textContent.trim().replace(/\s+/g, '');
        if (/^[0-9]+\.[0-9]+x$/.test(testo)) {
            numeriTrovati.push(testo);
        }
    });

    if (numeriTrovati.length >= 7) {
        const tempoAttuale = Date.now();

        if (isNumeroValido(numeriTrovati[0]) && isNumeroValido(numeriTrovati[1]) && isNumeroValido(numeriTrovati[2]) &&
            isNumeroValido(numeriTrovati[3]) && isNumeroValido(numeriTrovati[4]) && isNumeroValido(numeriTrovati[5]) &&
            isNumeroValido(numeriTrovati[6])) {
            const sequenza7 = numeriTrovati.slice(0, 7).join(', ');

            if (!sequenzaDa7Notificata) {
                verificaSequenza(sequenza7, numeriTrovati, tempoAttuale, 7);
                sequenzaDa7Notificata = true;
            }

            if (numeriTrovati.length >= 8 && isNumeroValido(numeriTrovati[7])) {
                const sequenza8 = numeriTrovati.slice(0, 8).join(', ');

                if (!sequenzeAvvisate.has(sequenza8)) {
                    verificaSequenza(sequenza8, numeriTrovati, tempoAttuale, 8);
                }
            }
        }
    } else {
        const tempoAttuale = Date.now();
        if (tempoAttuale - ultimoAvvisoSecondoGruppo > INTERVALLO_NOTIFICA_SECONDOGRUPO) {
            outputDiv.innerText = "⏳ In attesa di almeno 7 numeri...\n";
            const messaggio = "⚠️ Attenzione: Non sono stati trovati abbastanza numeri (manca la sequenza).";
            sendTelegramAlert(messaggio, second_chat_id);
            ultimoAvvisoSecondoGruppo = tempoAttuale;
        }
    }

    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function verificaSequenza(sequenza, numeri, tempoAttuale, tipoSequenza) {
    const oraUltimoAvviso = sequenzeAvvisate.get(sequenza);

    if (!oraUltimoAvviso || (tempoAttuale - oraUltimoAvviso) > INTERVALLO_NOTIFICA) {
        const messaggio = `🚨 ATTENZIONE: Nuova sequenza ${tipoSequenza} trovata: ${sequenza}`;
        outputDiv.innerText = `📊 Ultimi ${tipoSequenza} numeri: ${sequenza}\n${messaggio}`;
        sendTelegramAlert(messaggio, first_chat_id);
        sequenzeAvvisate.set(sequenza, tempoAttuale);
    }
}

setInterval(leggiPrimiNumeri, 3000);
