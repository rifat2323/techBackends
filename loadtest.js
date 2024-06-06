

(async () => {
    const loadtest = await import('loadtest');
  
    const options = {
      url: 'http://localhost:8000/discount', // Replace with your server's URL
      maxRequests: 110,             // Total number of requests to perform
      concurrency: 20,               // Number of concurrent requests
      method: 'GET',     
      timeout: 90000, 
      statusCallback: (error, result, latency) => {
        if (error) {
          console.error('Request error:', error);
        } else {
          console.log('Request successful:', result);
          console.log('Current latency:', latency);
        }
      },         // HTTP method
    };
  
    loadtest.loadTest(options, (error, result) => {
      if (error) {
        return console.error('Got an error: %s', error);
      }
      console.log('Tests run successfully');
      console.log(result);
    });
  })();
  