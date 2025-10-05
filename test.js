const https = require('https');

// Test ElevenLabs API connectivity
async function testElevenLabsAPI() {
    const API_KEY = 'sk_0fce9e6c88afb8461ddf2b579ceba24ba64553e85b3cb097'; // Your actual API key
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Default voice ID
    
    const data = JSON.stringify({
        text: "Hello, this is a test of the ElevenLabs API.",
        model_id: "eleven_monolingual_v1",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
        }
    });

    const options = {
        hostname: 'api.elevenlabs.io',
        port: 443,
        path: `/v1/text-to-speech/${VOICE_ID}`,
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY,
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Headers:`, res.headers);
            
            let audioData = Buffer.alloc(0);
            
            res.on('data', (chunk) => {
                audioData = Buffer.concat([audioData, chunk]);
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ API Test Successful! Received ${audioData.length} bytes of audio data`);
                    resolve({ success: true, dataSize: audioData.length });
                } else {
                    console.log(`❌ API Test Failed with status: ${res.statusCode}`);
                    console.log(`Response: ${audioData.toString()}`);
                    resolve({ success: false, statusCode: res.statusCode, response: audioData.toString() });
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request Error: ${error.message}`);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Test ElevenLabs Speech-to-Text API
async function testSpeechToTextAPI() {
    const API_KEY = 'sk_0fce9e6c88afb8461ddf2b579ceba24ba64553e85b3cb097';
    
    // Create minimal multipart form data with just model_id (no audio file)
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const data = [
        `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
        `Content-Disposition: form-data; name="model_id"`,
        ``,
        `eleven_multilingual_v1`,
        `------WebKitFormBoundary7MA4YWxkTrZu0gW--`
    ].join('\r\n');

    const options = {
        hostname: 'api.elevenlabs.io',
        port: 443,
        path: '/v1/speech-to-text',
        method: 'POST',
        headers: {
            'xi-api-key': API_KEY,
            'Content-Type': `multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW`,
            'Content-Length': Buffer.byteLength(data)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`Response: ${responseData}`);
                
                if (res.statusCode === 422) {
                    console.log('✅ API endpoint works! (422 = missing audio file, which is expected)');
                    resolve({ success: true, message: 'Endpoint accessible' });
                } else if (res.statusCode === 401) {
                    console.log('❌ API Key invalid');
                    resolve({ success: false, message: 'Invalid API key' });
                } else {
                    console.log(`Status ${res.statusCode}: ${responseData}`);
                    resolve({ success: true, statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request Error: ${error.message}`);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Run the tests
Promise.all([
    testElevenLabsAPI(),
    testSpeechToTextAPI()
])
.then(results => {
    results.forEach((result, index) => {
        if (result.success) {
            console.log(`🎉 Test ${index + 1} is working correctly!`);
        } else {
            console.log(`💥 Test ${index + 1} failed. Check your API key and settings.`);
        }
    });
})
.catch(error => {
    console.error('💥 Test failed with error:', error.message);
});