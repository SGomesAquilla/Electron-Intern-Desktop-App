const searchInput = document.getElementById('searchInput');
const resultList = document.getElementById('result-list');
let data;

// Fetch the data from the API
fetch('http://localhost:3000/api/clients')
  .then(response => response.json())
  .then(result => {
    data = result; //assigns the result to the data variable so it can be accessed later outside its scope
    // Gets the length of the array of clients and iterates through each one of them, adding them on display
    const arr = data.length;
    for (const client of data) {
      let listItem = document.createElement('li');
      listItem.id = client.codigo; // ataches an id to each li element. each id is the respective code number
      listItem.addEventListener('click', exportToForm);
      listItem.innerHTML = `<a target="_blank"> ${client.proprietario} - (${client.codigo}) </a>`;
      resultList.appendChild(listItem);
    }
});
//Keeps track of the content being typed in the input box and displays what includes in it and hide the others
searchInput.addEventListener('input', e => {
    const inputValue = e.target.value.toLowerCase(); 
    const allListItems = resultList.querySelectorAll('li');
    allListItems.forEach((item) => {
        const clientName = item.textContent.trim().toLowerCase();
        if (clientName.includes(inputValue)) { //needs to add functionality to also exclude accentures
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        };
    })
});

// It searchs inside the ClientListInfo for the element of that array that has a code equal to the li id code
function exportToForm() {
    const clickedClient = data.find(({ codigo }) => codigo === this.id);
    ipcRenderer.send('export-data-to-form', clickedClient);
};

//sends a message to the main process to open the form window when button adicionar is clicked
function openForm() {
    ipcRenderer.send('open-blank-form');
};