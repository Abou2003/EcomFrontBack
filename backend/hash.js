const bcrypt = require('bcrypt');

const motDePasse = '123456'; // change-le

bcrypt.hash(motDePasse, 10).then(hash => {
    console.log('Hash généré :', hash);
});