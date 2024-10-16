let device;
let fileToSend;
let gattServer;
let writeCharacteristic;

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    // Request Bluetooth device
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['0000ff11-0000-1000-8000-00805f9b34fb'] }], // Replace with actual service UUIDs for file transfer
      optionalServices: ['0000ff01-0000-1000-8000-00805f9b34fb']
    });

    document.getElementById('status').textContent = 'Device found: ' + device.name;

    // Connect to GATT server
    gattServer = await device.gatt.connect();
    const service = await gattServer.getPrimaryService('0000ff01-0000-1000-8000-00805f9b34fb'); // Replace with appropriate service
    writeCharacteristic = await service.getCharacteristic('0000ff01-0000-1000-8000-00805f9b34fb'); // Replace with write characteristic

    document.getElementById('status').textContent = 'Connected to: ' + device.name;
  } catch (error) {
    console.error('Connection failed', error);
    document.getElementById('status').textContent = 'Connection failed';
  }
});

// Handle drag and drop
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    fileToSend = files[0];
    document.getElementById('status').textContent = `File ready to send: ${fileToSend.name}`;
  }
});

// Send file over Bluetooth
async function sendFile(file) {
  if (!gattServer || !writeCharacteristic) {
    alert('Not connected to a Bluetooth device');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(event) {
    const fileData = new Uint8Array(event.target.result);
    
    // Split the file into chunks and send over Bluetooth
    const CHUNK_SIZE = 20; // Bluetooth LE has a small packet size limit
    for (let i = 0; i < fileData.length; i += CHUNK_SIZE) {
      const chunk = fileData.slice(i, i + CHUNK_SIZE);
      await writeCharacteristic.writeValue(chunk);
      console.log('Sent chunk:', chunk);
    }

    document.getElementById('status').textContent = 'File sent successfully!';
  };

  reader.readAsArrayBuffer(file);
}

// Add a listener to send the file when it's ready
dropZone.addEventListener('click', () => {
  if (fileToSend) {
    sendFile(fileToSend);
  }
});
