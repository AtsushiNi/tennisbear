import * as React from 'react'
import { useEffect, useState } from 'react'
import './App.css';

import GoogleMap from './Components/GoogleMap'

import { Row, Col, Button, Table, Avatar } from 'antd'

function App() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    const today = new Date()
    const month = ("0" + (today.getMonth() + 1)).slice(-2)
    const date =  ("0" + today.getDate()).slice(-2)

    const params = {day: today.getFullYear() + "-" + month + "-" + date}
    const query = new URLSearchParams(params)
    const searchEvents = async() => {
      let response =  await fetch("http://localhost:5000/search?"+query)
      const newEvents = await response.json()
      setEvents(newEvents)
    }
    searchEvents()
  },[])

  const columns = [
    {
      title: "主催者",
      dataIndex: "organizer",
      key: "organizer",
      render: (text, { avatarSrc }) => {
        if(text.length <= 10) return <><td><Avatar src={avatarSrc} /></td><td style={{fontSize: "5px"}}>{text}</td></>
        return <><td><Avatar src={avatarSrc} /></td><td style={{fontSize: "5px"}}>{text.substr(0,8) + ".."}</td></>
      }
    },
    {
      title: "時刻",
      dataIndex: "datetime",
      key: "organizer",
      render: text => <><p style={{fontSize: "5px"}}>{text.split(' ')[0]}</p><p style={{fontSize: "5px"}}>{text.split(' ')[1]}</p></>
    },
    {
      title: "タイトル",
      dataIndex: "title",
      key: "title",
      render: text => {
        if(text.length <= 30) return <td style={{fontSize: "10px"}}>{text}</td>
        return <td style={{fontSize: "10px"}}>{text.substr(0,30) + ".."}</td>
      }
    },
    {
      title: "レベル",
      dataIndex: "level",
      key: "level"
    }
  ]

  const data = events.map((event, index) => ({
    key: index,
    avatarSrc: event.imageUrl,
    organizer: event.organizer.name,
    datetime: event.datetimeForDisplay,
    title: event.eventTitle,
    level: "Lv." + event.minLevel.id + "~" + event.maxLevel.id
  }))

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body>
        <div style={{margin: "50px"}}>
          <Row>
            <Col>
              <Button type="primary">東京都</Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button type="primary">東京都</Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Table dataSource={data} columns={columns} />
            </Col>
            <Col>
              <GoogleMap />
            </Col>
          </Row>
        </div>
      </body>
    </div>
  );
}

export default App;
