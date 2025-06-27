let selectedFile = null;

const status = document.getElementById('status');
const selectBtn = document.getElementById('selectBtn');
const convertBtn = document.getElementById('convertBtn');

selectBtn.addEventListener('click', async () => {
    selectedFile = await window.electronAPI.selectImage();
    if (selectedFile) {
        status.textContent = 'Image Selected';
    } else {
        status.textContent = 'No image selected.';
    }
});

convertBtn.addEventListener('click', async () => {
    const format = document.getElementById('format').value;

    if (!selectedFile) {
        status.textContent = 'Please select an image first.';
        return;
    }

    const result = await window.electronAPI.convertImage({ filePath: selectedFile, format });

    if (result.success) {
        status.textContent = `Image converted and saved to: ${result.path}`;
    } else {
        status.textContent = `Error: ${result.error}`;
    }
});
