import axios from 'axios';

const MOCK_DATA_API_URL = 'https://randomuser.me/api';

const seedMockData = async () => {
  const res = await axios.get(`${MOCK_DATA_API_URL}?nat=br&results=1`);

  console.log(res.data);
};

seedMockData().then(() => { console.log('Seeder Executed'); }).catch(() => { console.log('Error on Seeder'); });
