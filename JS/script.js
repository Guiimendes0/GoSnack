document.addEventListener("DOMContentLoaded", () => {
  const resultElement = document.getElementById("result");
  const cameraSelect = document.getElementById("cameraSelect");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  const html5QrCode = new Html5Qrcode("reader");
  let currentCameraId = null;

  // Função chamada quando um QR é lido
  function onScanSuccess(decodedText) {
    resultElement.textContent = `✅ QR Code detectado: ${decodedText}`;
    console.log("QR Code:", decodedText);
  }

  // Popula o dropdown com as câmeras disponíveis
  Html5Qrcode.getCameras()
    .then((devices) => {
      if (devices && devices.length) {
        devices.forEach((device) => {
          const option = document.createElement("option");
          option.value = device.id;
          option.text = device.label || `Câmera ${cameraSelect.length + 1}`;
          cameraSelect.appendChild(option);
        });
        currentCameraId = devices[0].id;
      } else {
        resultElement.textContent = "Nenhuma câmera encontrada 😕";
      }
    })
    .catch((err) => {
      console.error("Erro ao listar câmeras:", err);
      resultElement.textContent = "Erro ao acessar as câmeras.";
    });

  // Inicia a leitura com a câmera selecionada
  startBtn.addEventListener("click", () => {
    const selectedCameraId = cameraSelect.value;
    if (!selectedCameraId) {
      alert("Selecione uma câmera antes de iniciar.");
      return;
    }

    html5QrCode
      .start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: 250,
        },
        onScanSuccess
      )
      .then(() => {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        cameraSelect.disabled = true;
        resultElement.textContent = "🔍 Lendo QR Codes...";
      })
      .catch((err) => {
        console.error("Erro ao iniciar leitura:", err);
        resultElement.textContent = "Erro ao iniciar leitura da câmera.";
      });
  });

  // Para a leitura
  stopBtn.addEventListener("click", () => {
    html5QrCode.stop().then(() => {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      cameraSelect.disabled = false;
      resultElement.textContent = "Leitura parada.";
    });
  });
});

async function initCameraList() {
  try {
    // Força o pedido de permissão antes de listar câmeras
    await navigator.mediaDevices.getUserMedia({ video: true });
    const devices = await Html5Qrcode.getCameras();

    if (devices && devices.length) {
      devices.forEach((device) => {
        const option = document.createElement("option");
        option.value = device.id;
        option.text = device.label || `Câmera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
      });
    } else {
      resultElement.textContent = "Nenhuma câmera encontrada 😕";
    }
  } catch (err) {
    console.error("Erro ao acessar câmera:", err);
    resultElement.textContent = "Permissão negada ou erro ao acessar a câmera.";
  }
}

// Chame isso dentro do DOMContentLoaded
initCameraList();
