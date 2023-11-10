const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configura o armazenamento e o nome do arquivo para ser único.
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'public/uploads/');
    },
    filename: (req, file, callBack) => {
      const file_id = uuidv4();
      const file_ext = file.originalname.split('.').pop();
      callBack(null, `${file_id}.${file_ext}`);
    }
});

// Criar uma instância do multer para gerenciar o upload.
const upload = multer({ storage: storage });

// Implementa o middleware para o upload.
const uploadSingle = (req, res, next) => {

  // Processa o upload usando a instância do multer.
  upload.single('uploaded_file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Lista de MIME types permitidos.
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    // Máximo tamanho permitido.
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Recupera arquivo recebido.
    const file = req.file;
    const errors = []; // array para registrar os erros.

    // Validar os tipos de arquivos permitidos e o tamanho máximo.
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Tipo de arquivo inválido: ${file.originalname}`);
    }
    if (file.size > maxSize) {
      errors.push(`Arquivo muito grande: ${file.originalname}`);
    }

    // Verifica se houveram errors.
    if (errors.length > 0) {
      // Remove arquivo enviado em caso de erros.
      fs.unlinkSync(file.path);

      return res.status(400).json({ errors });
    }

    // Anexa o arquivo recebido no objeto da requisição.
    req.upload = file;

    // Passa a execução para o próximo middleware.
    next();
  });
};

module.exports = uploadSingle;