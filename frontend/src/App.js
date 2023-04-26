import { useEffect, useState } from 'react'
import logo from './logo.svg';
import './App.css';

function App() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    const searchEvents = async() => {
      let response =  await new Promise((resolve, reject) => {
        fetch("localhost:5000/search")
          .then(res => res.json())
          .then(data => resolve(data))
      })
      setEvents(searchEvents)
    }
    searchEvents()
  })
  fetch("http://localhost:5000/search")

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
