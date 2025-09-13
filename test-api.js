// Simple test script to verify API functionality
const http = require('http');

function testAPI() {
  const data = JSON.stringify({
    userId: 'test_user',
    question: 'What is gravity?'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/questions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('Testing API with question: "What is gravity?"');

  const req = http.request(options, (res) => {
    let body = '';
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        console.log('✅ Response received successfully!');
        console.log('Question ID:', response.questionId);
        console.log('Answer ID:', response.answerId);
        console.log('\nWaiting for answer...');

        // Wait a bit and fetch the answer
        setTimeout(() => {
          fetchAnswer(response.answerId);
        }, 3000);

      } catch (e) {
        console.log('❌ Failed to parse response:', body);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request failed:', err.message);
  });

  req.write(data);
  req.end();
}

function fetchAnswer(answerId) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/answers/${answerId}`,
    method: 'GET'
  };

  console.log(`\nFetching answer with ID: ${answerId}`);

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);

    res.on('end', () => {
      try {
        const answer = JSON.parse(body);
        console.log('✅ Answer fetched successfully!');
        console.log('Text:', answer.text);
        console.log('Visualization layers:', answer.visualization?.layers?.length || 0);
        console.log('Animation duration:', answer.visualization?.duration || 'N/A', 'ms');
      } catch (e) {
        console.log('❌ Failed to parse answer:', body);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Answer fetch failed:', err.message);
  });

  req.end();
}

// Run the test
testAPI();