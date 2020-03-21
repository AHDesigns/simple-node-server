fetch('http://localhost:8000/api/greeting')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log('res from server', data);
  });
