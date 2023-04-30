import * as React from 'react'
import { useEffect, useState } from 'react'
import './App.css';

import GoogleMap from './Components/GoogleMap'

import { ConfigProvider, Row, Col, Button, Table, Avatar, DatePicker } from 'antd'

const dayjs = require("dayjs")

function App() {
  const [events, setEvents] = useState([])
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [isOpen, setIsOpen] = useState(true)
  const [pagination, setPagination] = useState({current: 1, pageSize: 10})
  const [hoverIndex, setHoverIndex] = useState(null)

  const onChangeDate = date => {
    if(!date) {
      setDate(dayjs().format("YYYY-MM-DD"))
    } else {
      setDate(date.format("YYYY-MM-DD"))
    }
  }

  const onChangeIsOpen = event => {
    if(isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }

  useEffect(() => {
    const params = { date: date, isOpen: isOpen }
    const query = new URLSearchParams(params)

    const searchEvents = async() => {
      let response =  await fetch("http://localhost:5000/search?"+query)
      const newEvents = await response.json()

      console.log("search with tennisbear API")

      setEvents(newEvents)
    }
    searchEvents()
  }, [date, isOpen])

  const columns = [
    {
      title: "主催者",
      dataIndex: "organizer",
      key: "organizer",
      render: (text, { avatarSrc }) => {
        if(text.length <= 10) return (
          <>
            <Avatar
              src={avatarSrc}
              style={{float: "left", marginTop: "auto"}}
            />
            <p
              style={{fontSize: "5px", float: "left", lineHeight: "32px", margin: "0px", marginLeft: "3px"}}
            >
              {text}
            </p>
          </>
        )
        return <><Avatar src={avatarSrc} /><p style={{fontSize: "5px"}}>{text.substr(0,8) + ".."}</p></>
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
        if(text.length <= 30) return <p style={{fontSize: "10px"}}>{text}</p>
        return <p style={{fontSize: "10px"}}>{text.substr(0,30) + ".."}</p>
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
    id: event.id,
    avatarSrc: event.imageUrl,
    organizer: event.organizer.name,
    datetime: event.datetimeForDisplay,
    title: event.eventTitle,
    level: "Lv." + event.minLevel.id + "~" + event.maxLevel.id,
    isFull: event.isFull
  }))

  const places = events
    .slice((pagination.current-1) * pagination.pageSize, pagination.current * pagination.pageSize)
    .map(event =>  ({lat: event.place.lat, lng: event.place.lng}))

  const theme = {
    token: {
      colorPrimary: "#00B86B"
    }
  }

  return (
    <div className="App">
      <ConfigProvider theme={theme}>
        <div style={{margin: "50px"}}>
          <Row>
            <Col>
              <Button type="primary" style={{"fontWeight": "bold"}}>東京都</Button>
            </Col>
            <Col>
              <DatePicker
                defaultValue={dayjs()}
                format={'MM/DD'}
                onChange={onChangeDate}
              />
            </Col>
            <Col>
              <Button
                type={isOpen ? "primary" : "default"}
                onClick={onChangeIsOpen}
              >
                募集中
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Table
                dataSource={data}
                columns={columns}
                rowClassName={(record, index) => {
                  if(record.isFull) return "table-row-dark"
                  else return "table-row-light"
                  }}
                onChange={pagination => setPagination(pagination)}
                onRow={(record,index) => {
                  return {
                    onClick: event => window.open("https://www.tennisbear.net/event/" + record.id + "/info", "_blank"),
                    onMouseEnter: event => setHoverIndex(index),
                    onMouseLeave: event => setHoverIndex()
                  }
                }}
                />
            </Col>
            <Col>
              <GoogleMap places={places} hoverIndex={hoverIndex}/>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </div>
  );
}

export default App;
