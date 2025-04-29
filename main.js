const { app, shell, BrowserWindow, ipcMain, Menu, contextBridge, dialog, webContents } = require('electron');
const path = require('path');
const fs = require('fs');
const exceljs = require('exceljs');
const express = require('express');
const api = express();

let searchWindow;
let formWindow;
let krWindow;
let aboutWindow;
let lcrImportedData;
const appDir = path.dirname(app.getPath('exe'));
const excelDir = path.join(appDir, 'excel_files');
const excelFilePath = path.join(excelDir, 'LABMETRO-DQ.xlsx');

// Gets the List of Instruments numbers codes and store them in a JS file
let accessExcel = new exceljs.Workbook();
async function ReadListInstruments() {
    try {
        await accessExcel.xlsx.readFile(excelDir, 'Lista_Inst.xlsx');
        let worksheet = accessExcel.getWorksheet('listagem');
        let serialNumArray = worksheet.getColumn('A').values;
        let InstrumentNumberArray = worksheet.getColumn('B').values;
        let manufacArray = worksheet.getColumn('C').values;
        let equipModel = worksheet.getColumn('D').values;
        let ClientNameArray = worksheet.getColumn('E').values;
        let insertoArray = worksheet.getColumn('F').values;
        let nkFabArray = worksheet.getColumn('G').values;
        let tempRefCertArray = worksheet.getColumn('H').values;
        let labDeCalibracaoArray = worksheet.getColumn('I').values;
        let dataCalibracaoArray = worksheet.getColumn('J').values;
        let nkCertArray = worksheet.getColumn('K').values; 
        let fabricanteEletrometroArray = worksheet.getColumn('L').values;
        let modeloEletrometroArray = worksheet.getColumn('M').values;
        let serieEletrometroArray = worksheet.getColumn('N').values;
        let keleArray = worksheet.getColumn('O').values;

        // Remove header rows (if any) I really don't remember why I wrote the .slice(2) but it is working. If it is working then it's not broken.
        ClientNameArray = ClientNameArray.slice(2); // Assuming header is in the first row
        InstrumentNumberArray = InstrumentNumberArray.slice(2);
        serialNumArray = serialNumArray.slice(2);
        manufacArray = manufacArray.slice(2);
        equipModel = equipModel.slice(2);
        insertoArray = insertoArray.slice(2);
        nkFabArray = nkFabArray.slice(2);
        tempRefCertArray = tempRefCertArray.slice(2);
        labDeCalibracaoArray = labDeCalibracaoArray.slice(2);
        dataCalibracaoArray = dataCalibracaoArray.slice(2);
        nkCertArray = nkCertArray.slice(2);
        fabricanteEletrometroArray = fabricanteEletrometroArray.slice(2);
        modeloEletrometroArray = modeloEletrometroArray.slice(2);
        serieEletrometroArray = serieEletrometroArray.slice(2);
        keleArray = keleArray.slice(2);

        // Create an array of objects
        const ClientListInfo = ClientNameArray.map((name, index) => ({
            proprietario: name,
            codigo: InstrumentNumberArray[index],
            fabricante: manufacArray[index],
            serie: serialNumArray[index],
            modelo: equipModel[index],
            inserto: insertoArray[index],
            nkFab: nkFabArray[index],
            tempRefCert: tempRefCertArray[index],
            labDeCalibracao: labDeCalibracaoArray[index],
            dataCalibracao: dataCalibracaoArray[index],
            nkCert: nkCertArray[index],
            fabricanteEletrometro: fabricanteEletrometroArray[index],
            modeloEletrometro: modeloEletrometroArray[index],
            serieEletrometro: serieEletrometroArray[index],
            kele: keleArray[index],
        }));

        //Starts the API
        api.get('/api/clients', (req, res) => {
            res.json(ClientListInfo);
        });

        api.listen(3000, () => {
            console.log('API listening on port 3000');
        });

    } catch (error) {
        // console.error('ERROR!', error);
        dialog.showMessageBox(formWindow, {
            type: 'error',
            title: 'Error',
            message: 'Ocorreu um erro ao recuperar as informações do banco de dados: ' + error.message
        });
    }
};

//Creates the pre-window to choose which KR value to use
function createContactWindow() {
    aboutWindow = new BrowserWindow({
        title: 'LCR',
        width: 780,
        height: 750,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    aboutWindow.loadURL('https://github.com/SGomesAquilla');
};

function createKrWindow() {
    krWindow = new BrowserWindow({
        title: 'LCR',
        width: 500,
        height: 510,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    krWindow.loadFile(path.join(__dirname, './frontend/kr.html'));
};

//Creates app windows
function createSearchWindow() {
    searchWindow = new BrowserWindow({
        title: 'LCR',
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    searchWindow.loadFile(path.join(__dirname, './frontend/index.html'));
};

function createFormWindow() {
    formWindow = new BrowserWindow({
        title: 'LCR APP',
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    formWindow.loadFile(path.join(__dirname, './frontend/form.html'));
};

// Menu Template
const menu = [
    {
        label: 'Add New',
        submenu: [
            {
                label: 'Add New Client',
                click: () => {
                    BrowserWindow.getFocusedWindow().close();
                    createFormWindow();
                },
            },
            {
                label: 'Add New Kr',
                click: () => {
                    BrowserWindow.getFocusedWindow().close();
                    createKrWindow();
                },
            },
        ],
    },
    {
        label: 'About',
        submenu: [
            {
                label: 'Contact',
                click: () => createContactWindow(),
            },
            {
                label: 'README.md',
                click: () => shell.openPath(path.join(__dirname, 'README.md')),
            },
        ],
    },
    {
        label: 'Exit',
        click: () => app.quit()
    },
];

// Implement Menu
const appMenu = Menu.buildFromTemplate(menu); //comment this part of the code so the developer
Menu.setApplicationMenu(appMenu);           // can test the app and access the console terminal window

app.whenReady().then(() => {
    ReadListInstruments();
    createKrWindow();
});

ipcMain.on('open-searchWindow', (event, initialLCRInfo) => {
    krWindow.close();
    lcrImportedData = initialLCRInfo;

    const krMenu = [
        {
            label: 'Add New',
            submenu: [
                {
                    label: 'Add New Client',
                    click: () => {
                        BrowserWindow.getFocusedWindow().close();
                        createFormWindow();
                    },
                },
                {
                    label: 'Add New Kr',
                    click: () => {
                        BrowserWindow.getFocusedWindow().close();
                        createKrWindow();
                    },
                },
            ],
        },
        {
            label: 'About',
            submenu: [
                {
                    label: 'Contact',
                    click: () => createContactWindow(),
                },
                {
                    label: 'README.md',
                    click: () => shell.openPath(path.join(__dirname, 'README.md')),
                },
            ],
        },
        {
            label: 'Exit',
            click: () => app.quit()
        },
        //This adds padding, sending the next label further to right. We can use empty labels to add padding to the menu labels. Dont know if there is another way...
        {label: ''},{label: ''},{label: ''},{label: ''},{label: ''},{label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''}, {label: ''},
        {
            label: `KR:  ${initialLCRInfo.kr}`,
        },
    ];
    const krMenuTemplate = Menu.buildFromTemplate(krMenu);
    createSearchWindow();
    if (searchWindow) {
        searchWindow.setMenu(krMenuTemplate);
    };
});

ipcMain.on('open-blank-form', () => {
    createFormWindow();
});

ipcMain.on('export-data-to-form', (event, clickedClient) => {
    createFormWindow();
    setTimeout(() => formWindow.webContents.send('client-data', clickedClient), 500); //IMPORTANT NOTE: the timeout is necessary because the window must be fully
    console.log(clickedClient);                                                       // loaded before sending the data. It seems everything under 200ms will make
});                                                                                   // it so the message sent never reachs the window

//Gets the data inserted from the user interface and creates an Excel file with it
ipcMain.on('shareData', async (event, inputData) => {
    // console.log(inputData);//test
    let accessExcel = new exceljs.Workbook();
    try {
        await accessExcel.xlsx.readFile(excelDir, 'LABMETRO-DQ.xlsx');
        let worksheet = accessExcel.getWorksheet('sheet');
        worksheet.getCell('C12').value = lcrImportedData.eletrometro;
        worksheet.getCell('C13').value = lcrImportedData.camara;
        worksheet.getCell('I12').value = lcrImportedData.kr;
        worksheet.getCell('I13').value = lcrImportedData.data;
        worksheet.getCell('B19').value = inputData.proprietario;
        worksheet.getCell('B22').value = inputData.fabricanteCamara;
        worksheet.getCell('D22').value = inputData.modeloCamara;
        worksheet.getCell('F22').value = inputData.serieCamara;
        worksheet.getCell('G22').value = inputData.inserto;
        worksheet.getCell('H22').value = inputData.nkFab;
        worksheet.getCell('I22').value = inputData.tempRefCert;
        worksheet.getCell('B25').value = inputData.labDeCalibracao;
        worksheet.getCell('D25').value = inputData.dataCalibracao
        worksheet.getCell('E25').value = inputData.nkCert;
        worksheet.getCell('B55').value = inputData.fabricanteEletrometro;
        worksheet.getCell('D55').value = inputData.modeloEletrometro;
        worksheet.getCell('F55').value = inputData.serieEletrometro;
        worksheet.getCell('H55').value = inputData.kele;
        await accessExcel.xlsx.writeFile(excelDir, 'LABMETRO-DQ.xlsx');

    } catch (error) {
        // console.error('ERROR!', error);
        dialog.showMessageBox(formWindow, {
            type: 'error',
            title: 'Error',
            message: 'Ocorreu um erro ao salvar as informações: ' + error.message
        });

        return;
    };

    //verifies if the submited data, proprietarios's name already exists inside the excel file. 
    //If it exists, it verifies if the serial number is different or not. If equal, it updates the values, if different, it adds the new set right below.
    //Othwersie is a totally different client, it just adds it on the end of the sheet.
    try {
        let accessDataArrayExcel = new exceljs.Workbook();
        await accessDataArrayExcel.xlsx.readFile(excelDir, 'Lista_Inst.xlsx');
        let InstrumentListWorksheet = accessDataArrayExcel.getWorksheet('listagem');
        let clientNameArray = InstrumentListWorksheet.getColumn('E').values;
        let clientFound = false;
        let clientRows = [];

        for (let i = 1; i < clientNameArray.length; i++) {
            const clientName = clientNameArray[i];
            if (clientName == inputData.proprietario) {
                clientFound = true;
                let row = InstrumentListWorksheet.getRow(i);
                clientRows.push({ row, index: i });
            }
        }

        if (clientFound) {
            let clientUpdated = false;
            for (let clientInfo of clientRows) {
                let serialNumber = clientInfo.row.getCell(1).value;
                if (serialNumber == inputData.serieCamara) {
                    clientInfo.row.getCell('A').value = inputData.serieCamara;
                    clientInfo.row.getCell('B').value = inputData.codigo;
                    clientInfo.row.getCell('C').value = inputData.fabricanteCamara;
                    clientInfo.row.getCell('D').value = inputData.modeloCamara;
                    clientInfo.row.getCell('E').value = inputData.proprietario;
                    clientInfo.row.getCell('F').value = inputData.inserto;
                    clientInfo.row.getCell('G').value = inputData.nkFab;
                    clientInfo.row.getCell('H').value = inputData.tempRefCert;
                    clientInfo.row.getCell('I').value = inputData.labDeCalibracao;
                    clientInfo.row.getCell('J').value = inputData.dataCalibracao;
                    clientInfo.row.getCell('K').value = inputData.nkCert;
                    clientInfo.row.getCell('L').value = inputData.fabricanteEletrometro;
                    clientInfo.row.getCell('M').value = inputData.modeloEletrometro;
                    clientInfo.row.getCell('N').value = inputData.serieEletrometro;
                    clientInfo.row.getCell('O').value = inputData.kele;
                    clientUpdated = true;
                    break;
                }
            }

            if (!clientUpdated) {
                let lastClientIndex = clientRows[clientRows.length - 1].index;
                let newRow = InstrumentListWorksheet.insertRow(lastClientIndex + 1);
                newRow.getCell('A').value = inputData.serieCamara;
                newRow.getCell('B').value = inputData.codigo;
                newRow.getCell('C').value = inputData.fabricanteCamara;
                newRow.getCell('D').value = inputData.modeloCamara;
                newRow.getCell('E').value = inputData.proprietario;
                newRow.getCell('F').value = inputData.inserto;
                newRow.getCell('G').value = inputData.nkFab;
                newRow.getCell('H').value = inputData.tempRefCert;
                newRow.getCell('I').value = inputData.labDeCalibracao;
                newRow.getCell('J').value = inputData.dataCalibracao;
                newRow.getCell('K').value = inputData.nkCert;
                newRow.getCell('L').value = inputData.fabricanteEletrometro;
                newRow.getCell('M').value = inputData.modeloEletrometro;
                newRow.getCell('N').value = inputData.serieEletrometro;
                newRow.getCell('O').value = inputData.kele;
            }

        } else {
            let newRow = InstrumentListWorksheet.addRow();
            newRow.getCell('A').value = inputData.serieCamara;
            newRow.getCell('B').value = inputData.codigo;
            newRow.getCell('C').value = inputData.fabricanteCamara;
            newRow.getCell('D').value = inputData.modeloCamara;
            newRow.getCell('E').value = inputData.proprietario;
            newRow.getCell('F').value = inputData.inserto;
            newRow.getCell('G').value = inputData.nkFab;
            newRow.getCell('H').value = inputData.tempRefCert;
            newRow.getCell('I').value = inputData.labDeCalibracao;
            newRow.getCell('J').value = inputData.dataCalibracao;
            newRow.getCell('K').value = inputData.nkCert;
            newRow.getCell('L').value = inputData.fabricanteEletrometro;
            newRow.getCell('M').value = inputData.modeloEletrometro;
            newRow.getCell('N').value = inputData.serieEletrometro;
            newRow.getCell('O').value = inputData.kele;
        }

        await accessDataArrayExcel.xlsx.writeFile(excelDir, 'Lista_Inst.xlsx');
        dialog.showMessageBox(formWindow,{
            type: 'info',
            title: 'Sucesso!',
            message: 'As informações foram salvas com sucesso!'
        });

    } catch (error) {
        // console.error('ERROR!', error);
        dialog.showMessageBox(formWindow, {
            type: 'error',
            title: 'Error',
            message: 'Ocorreu um erro ao salvar as informações: ' + error.message
        });
    }
});