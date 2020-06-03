import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-burger-project-4eb3e.firebaseio.com/'
});

export default instance;