const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const makeWASocket = require("@whiskeysockets/baileys").default;
const log = (pino = require("pino"));

let sock = null;
let authInfo = null;

const connectWhatsapp = async function () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: log({ level: "silent" }),
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectWhatsapp();
            }
        } else if (connection === "open") {
            console.log("Connected to whatsapp!");
        }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            if (type === "notify") {
                if (!messages[0]?.key.fromMe) {
                    const captureMessage = messages[0]?.message?.conversation;
                    const numberWa = messages[0]?.key?.remoteJid;

                    const compareMessage = captureMessage.toLocaleLowerCase();

                    if (compareMessage === "confirmado") {
                        await sock.sendMessage(
                            numberWa,
                            {
                                text: "Excelente, gracias por confirmar. Tu pedido está en camino!",
                            }
                        );
                    }
                }
            }
        } catch (error) {
            console.log("error ", error);
        }
    });

    sock.ev.on("creds.update", saveCreds);
    return sock;
};


const postSendMessage = async (req, res) => {
    const params = req.body;

    if (!sock) {
        return res.status(400).send("Not connected to whatsapp");
    }
    else {
        sendMessage(params, req, res);
    }
}


const sendMessage = async (params, req, res) => {
    const id = `${params.billing_address.phone}@s.whatsapp.net`;

    try {
        await sock.sendMessage(id, { text: `Hola ${params.customer.first_name}, te habla Cristopher! Soy tu asesor de ventas en Aura Store. Me alegra informarte que tu pedido de ${params.line_items[0].current_quantity} x "${params.line_items[0].product_name}" ha sido procesado exitosamente y llegará a tu domicilio con dirección "${params.shipping_address.address1}" en las próximas 24/48 horas. Escribe "CONFIRMADO" si los datos sos correctos.` });

    }
    catch (e) {
        console.error(e);
        return res.status(500).send("Error sending message");
    }

    return res.status(200).send("Message sent");
}


module.exports = {
    connectWhatsapp,
    postSendMessage,
};
