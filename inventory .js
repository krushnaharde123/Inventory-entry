const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const FILES_DIR = path.join(__dirname, '../../files');

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR);
}

// Save inventory file
router.post('/save', (req, res) => {
  const { fileName, fileContent } = req.body;
  const filePath = path.join(FILES_DIR, fileName);

  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      return res.status(500).send('Error saving file');
    }
    res.status(200).send('File saved successfully');
  });
});

// Get list of files
router.get('/files', (req, res) => {
  fs.readdir(FILES_DIR, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading files');
    }
    res.status(200).json(files);
  });
});

// Get file content
router.get('/files/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(FILES_DIR, fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }
    res.status(200).send(data);
  });
});

module.exports = router;