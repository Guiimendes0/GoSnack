document.addEventListener("DOMContentLoaded", () => {
  const resultElement = document.getElementById("result");
  const cameraSelect = document.getElementById("cameraSelect");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  const html5QrCode = new Html5Qrcode("reader");
  let currentCameraId = null;

  function onScanSuccess(decodedText) {
    resultElement.textContent = `✅ QR Code detectado: ${decodedText}`;
    console.log("QR Code:", decodedText);
  }

  async function initCameraList() {
    try {
      // Solicita permissão primeiro (necessário em mobile)
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length) {
        devices.forEach((device) => {
          const option = document.createElement("option");
          option.value = device.id;
          option.text = device.label || `Câmera ${cameraSelect.length + 1}`;
          cameraSelect.appendChild(option);
        });

        // 🔍 Tenta encontrar a traseira principal
        const backCam = devices.find((d) =>
          /back|rear|traseira|environment/i.test(d.label)
        );

        if (backCam) {
          cameraSelect.value = backCam.id;
          currentCameraId = backCam.id;
        } else {
          // fallback: primeira da lista
          cameraSelect.value = devices[0].id;
          currentCameraId = devices[0].id;
        }
      } else {
        resultElement.textContent = "Nenhuma câmera encontrada 😕";
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      resultElement.textContent =
        "Permissão negada ou erro ao acessar a câmera.";
    }
  }

  async function startCamera() {
    const selectedCameraId = cameraSelect.value;
    if (!selectedCameraId) {
      alert("Selecione uma câmera antes de iniciar.");
      return;
    }

    try {
      await html5QrCode.start(
        { deviceId: { exact: selectedCameraId } },
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
      startBtn.disabled = true;
      stopBtn.disabled = false;
      cameraSelect.disabled = true;
      resultElement.textContent = "🔍 Lendo QR Codes...";
    } catch (err) {
      console.error("Erro ao iniciar leitura:", err);
      resultElement.textContent = "Erro ao iniciar leitura da câmera.";
    }
  }

  function stopCamera() {
    html5QrCode.stop().then(() => {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      cameraSelect.disabled = false;
      resultElement.textContent = "Leitura parada.";
    });
  }

  startBtn.addEventListener("click", startCamera);
  stopBtn.addEventListener("click", stopCamera);

  // 🧠 Se o navegador suportar, tenta abrir a traseira por padrão
  if (navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop()); // fecha a prévia
        initCameraList();
      })
      .catch(() => {
        // fallback se não suportar
        initCameraList();
      });
  } else {
    initCameraList();
  }
});
