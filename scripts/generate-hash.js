const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'Password1';  // The password you want to use
    const saltRounds = 10;
    
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('\nGenerated Hash:');
        console.log('----------------');
        console.log(hash);
        console.log('\nVerification:');
        console.log('Hash length:', hash.length);
        console.log('Hash format valid:', /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/.test(hash));
        
        // Verify the hash works
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash verification test:', isValid ? 'PASSED' : 'FAILED');
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generateHash(); 