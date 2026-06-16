const xlsx = require('xlsx');
const path = require('path');

const data = [
    {
        "Nombre": "John",
        "Apellido 1": "Doe",
        "Apellido 2": "Smith",
        "Folio": "12345",
        "Email": "test@example.com",
        "Ruta del archivo": path.resolve(__dirname, 'test_attachment.txt')
    },
    {
        "Nombre": "Jane",
        "Apellido 1": "Doe",
        "Apellido 2": "Jones",
        "Folio": "67890",
        "Email": "jane@example.com",
        "Ruta del archivo": path.resolve(__dirname, 'test_attachment.txt')
    }
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, "Recipients");
xlsx.writeFile(wb, "test_data.xlsx");
console.log("Test data created: test_data.xlsx");
