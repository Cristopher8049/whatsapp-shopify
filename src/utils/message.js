const createMessage = (params) => {
    const captureMessage = message;
    const compareMessage = captureMessage.toLocaleLowerCase();
    //only one time

    if (compareMessage === "confirmado") {
        return {
            text: "Excelente, gracias por confirmar. Tu pedido está en camino!",
        };
    }
    return null;
}