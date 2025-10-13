document.addEventListener("DOMContentLoaded", () => {
  const resultElement = document.getElementById("result");

  function onScanSuccess(decodedText) {
    resultElement.textContent = `QR Code detectado: ${decodedText}`;
    console.log("QR Code:", decodedText);
  }

  function onScanError(errorMessage) {
    // Erros de leitura são normais (quando não há QR na tela)
  }

  const html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras()
    .then((devices) => {
      if (devices && devices.length) {
        // Pega a primeira câmera disponível
        const cameraId = devices[0].id;

        html5QrCode.start(
          cameraId,
          {
            fps: 10, // frames por segundo
            qrbox: 250, // tamanho da área de leitura
          },
          onScanSuccess,
          onScanError
        );
      } else {
        resultElement.textContent = "Nenhuma câmera encontrada 😕";
      }
    })
    .catch((err) => {
      console.error(err);
      resultElement.textContent = "Erro ao acessar a câmera.";
    });
});
