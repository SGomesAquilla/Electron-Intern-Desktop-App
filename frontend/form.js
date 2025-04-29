const proprietario = document.getElementById('proprietario');
const codigo = document.getElementById('codigo');
const fabricanteCamara = document.getElementById('fabricanteCamara');
const modeloCamara = document.getElementById('modeloCamara');
const serieCamara = document.getElementById('serieCamara');
const inserto = document.getElementById('inserto');
const NKFab = document.getElementById('NK(Fab)');
const TempRefCert = document.getElementById('TempRefCert');
const LabDeCalibracao = document.getElementById('LabDeCalibracao');
const DataCalibracao = document.getElementById('DataCalibracao');
const NkCert = document.getElementById('NkCert');
const fabricanteEletrometro = document.getElementById('fabricanteEletrometro');
const modeloEletrometro = document.getElementById('modeloEletrometro');
const serieEletrometro = document.getElementById('serieEletrometro');
const kele = document.getElementById('Kele');

ipcRenderer.on('client-data', (clickedClient) => { //it is important to write , (clickedClient) so it RECEIVES the data
    //sets the values
    proprietario.setAttribute('readonly', 'readonly'); //so the user doesnt change accidentally the content
    proprietario.value = clickedClient.proprietario;
    codigo.value = clickedClient.codigo;
    fabricanteCamara.value = clickedClient.fabricante;
    serieCamara.value = clickedClient.serie;
    modeloCamara.value = clickedClient.modelo;
});

//Gets the values inputed and store in the object called inputData
function exportToSheetValues() {
    let getInputValue = (id) => document.getElementById(id).value;
    const inputData = {
        proprietario: getInputValue('proprietario'),
        codigo: getInputValue('codigo'),
        fabricanteCamara: getInputValue('fabricanteCamara'),
        modeloCamara: getInputValue('modeloCamara'),
        serieCamara: getInputValue('serieCamara'),
        inserto: getInputValue('inserto'),
        nkFab: getInputValue('NK(Fab)'),
        tempRefCert: getInputValue('TempRefCert'),
        labDeCalibracao: getInputValue('LabDeCalibracao'),
        dataCalibracao: getInputValue('DataCalibracao'),
        nkCert: getInputValue('NkCert'),
        fabricanteEletrometro: getInputValue('fabricanteEletrometro'),
        modeloEletrometro: getInputValue('modeloEletrometro'),
        serieEletrometro: getInputValue('serieEletrometro'),
        kele: getInputValue('Kele'),
    };

    // send the information about inputData on the channel called 'shareData'
    // console.log(inputData);//test
    ipcRenderer.send('shareData', inputData);
    return;
};

//makes that when the user presses Enter, it chooses the next input
const inputs = document.querySelectorAll('input'); // Select all text inputs
let currentInputIndex = 0; // Keep track of the current input

inputs[0].focus(); // Focus on the first input initially, just to avoid the user accidentaly typing something and not noticing

inputs.forEach((input, index) => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { // Check if the pressed key is Enter

            currentInputIndex = (index + 1) % inputs.length; // Move to the next input (wraps around)

            inputs[currentInputIndex].focus();
            inputs[currentInputIndex].select(); // Select the text in the input
        };
    });
});